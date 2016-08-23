//offscreen framebuffer
FramebufferHandler = function (type, options) {
    var framebufferContainer = {};


    this.getFramebuffer = function(name){
        if(framebufferContainer[name]){
            return framebufferContainer[name];
        }else{
            return null;
        }
    }

    this.addFramebuffer = function (name, options){
        options = options || {};
        if(framebufferContainer[name]){
            alert('Framebuffer "'+name+'" already exists');
            return;
        }
        var newFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, newFramebuffer);
        newFramebuffer.width = options.fbWidth || 512;
        newFramebuffer.height = options.fbHeight || 512;

        var fbTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fbTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        //gl.generateMipmap(gl.TEXTURE_2D);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, newFramebuffer.width, newFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        var renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, newFramebuffer.width, newFramebuffer.height);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        framebufferContainer[name] = newFramebuffer;
        framebufferContainer[name].texture = fbTexture;
    }

}



FramebufferHandler.prototype.InitializePickingBuffers = function (options) {
  options = options || {};
  this.viewportWidth = options.vpWidth || 512;
  this.viewportHeight = options.vpHeight || 512;
  // refrence: http://learningwebgl.com/blog/?p=1786
  // This procress is similar to renderring to a buffer. The only difference is that it will be externally read on demand.
  this.lastCapturedColourMap = new Uint8Array(this.viewportWidth * this.viewportHeight * 4);
  this.fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
  this.rttTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.rttTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.viewportWidth, this.viewportHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  var renderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.viewportWidth, this.viewportHeight);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.rttTexture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

  this.currentPickingIndex = null;
}


FramebufferHandler.prototype.StartRenderLoop = function (enabled, mouseProps) {
  if (enabled) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawObject(world, {doPicking:true,forcedShader:shaderHanlder.getShader("picking-shader")});
    gl.readPixels(0, 0, this.viewportWidth, this.viewportHeight, gl.RGBA, gl.UNSIGNED_BYTE, this.lastCapturedColourMap);
    if (mouseProps) {
      var colour = this.GetColourMapColour(mouseProps.x, mouseProps.y);
      //console.log(colour);
      this.currentPickingIndex = colour[0] * 65536 + colour[1] * 256 + colour[2];
    }
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

FramebufferHandler.prototype.GetColourMapColour = function (x, y) {
  if (x >= this.viewportWidth || y >= this.viewportHeight
    || x < 0 || y < 0) return [0,0,0];
  if (!this.lastCapturedColourMap) throw "Colour map not captured.";
  // 4 components per colour, and y is inverted
  var firstAddress = (this.viewportHeight - 1 - y) * this.viewportWidth * 4 + x * 4;
  return [this.lastCapturedColourMap[firstAddress],
          this.lastCapturedColourMap[firstAddress + 1],
          this.lastCapturedColourMap[firstAddress + 2]];
}


var framebufferHandler = new FramebufferHandler;