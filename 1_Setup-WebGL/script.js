//198 achtung wieder uaskommentieren    197 beachten, kann undefiniert sein
var gl;

function initGL(canvas) {
    try {
        //gl = canvas.getContext("experimental-webgl");
        /*global WebGLUtils*/
        gl = WebGLUtils.setupWebGL(canvas);
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

/*global mat4*/
var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

//saves last modelview
function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

//restores last modelview
function mvPopMatrix() {
    if (mvMatrixStack.length === 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function degToRad(degrees) {
    degrees = degrees % 360;
    return degrees * Math.PI / 180;
}


var currentObj = null;

function drawScene() {
    //Normal Rendering to canvas / // Render scene to screen


    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    mat4.identity(mvMatrix);

    
    
    //Kamera 
    /*global camera*/
    mat4.multiply(mvMatrix,camera.getMatrix(),mvMatrix);


    /*global framebufferHandler*/
    /*global mouseDown*/
    /*global lastMouseX*/
    /*global lastMouseY*/
    /*global world*/
    // Render picking colour map buffer off-screen
    framebufferHandler.StartRenderLoop(mouseDown,{x:lastMouseX,y:lastMouseY});
    if(mouseDown){
        currentObj = world.pickingObjectArray[framebufferHandler.currentPickingIndex] || currentObj;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    drawObject(world);
}



function drawObject(obj, options){
    options = options || {};
    if(!options.notReset)
    mvPushMatrix();

    mat4.multiply(mvMatrix,obj.transformMatrix,mvMatrix);

    var shaderProgram = obj.shader || options.shader;
    options.shader = shaderProgram;
    if(!shaderProgram){
        console.log("no shader found");
        return;
    }
    if(options.forcedShader){shaderProgram = options.forcedShader;}
    if((currentObj == obj)){
        //shaderProgram=shaderHanlder.getShader("color-shader")

        //shaderProgram=shaderHanlder.getShader("perFragLight");

    }

    var texture = obj.texture || options.texture;
    options.texture = texture;


    if(obj.hasGeometry){
        var buffer = null;
        gl.useProgram(shaderProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.vPosBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.vPosBuffer.itemSize, gl.FLOAT, false, 0, 0);

        buffer = obj.vColBuffer || obj.junkBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, buffer.itemSize, gl.FLOAT, false, 0, 0);

        buffer = obj.vNormBuffer || obj.junkBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, buffer.itemSize, gl.FLOAT, false, 0, 0);

        buffer = obj.vTexBuffer || obj.junkBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, buffer.itemSize, gl.FLOAT, false, 0, 0);


        //set picking color
        var color = obj.indexColorArray;
        gl.uniform3f(shaderProgram.pickingColorUniform,color[0],color[1],color[2]);

        var alphaValue = 1;
        var useBlending = blending.getValue() || obj.useBlending;
        if (useBlending&&!options.doPicking) {
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            gl.enable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);
            alphaValue = (alpha.getValue()||obj.alphaValue)||1;
        } else {
            gl.disable(gl.BLEND);
            gl.enable(gl.DEPTH_TEST);
        }
        gl.uniform1f(shaderProgram.alphaUniform, alphaValue);

        gl.uniform1i(shaderProgram.useLightingUniform, lighting.getValue());
        if (lighting.getValue()) {
          gl.uniform3f(
              shaderProgram.ambientColorUniform,
              ambientR.getValue(),
              ambientG.getValue(),
              ambientB.getValue()
          );
          var lightingDirection = [
              lightDirectionX.getValue(),
              lightDirectionY.getValue(),
              lightDirectionZ.getValue()
          ];
          var adjustedLD = vec3.create();
          vec3.normalize(lightingDirection, adjustedLD);
          vec3.scale(adjustedLD, -1);
          gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);
          gl.uniform3f(
            shaderProgram.directionalColorUniform,
            directionalR.getValue(),
            directionalG.getValue(),
            directionalB.getValue()
          );

          gl.uniform3f(
            shaderProgram.pointLightingLocationUniform,
            lightPositionX.getValue(),
            lightPositionY.getValue(),
            lightPositionZ.getValue()
          );
          gl.uniform3f(
            shaderProgram.pointLightingColorUniform,
            pointR.getValue(),
            pointG.getValue(),
            pointB.getValue()
          );

          gl.uniform3f(
            shaderProgram.pointLightingSpecularColorUniform,
            specularR.getValue(),
            specularG.getValue(),
            specularB.getValue()
          );
          gl.uniform3f(
            shaderProgram.pointLightingDiffuseColorUniform,
            diffuseR.getValue(),
            diffuseG.getValue(),
            diffuseB.getValue()
          );


        }
        //specular light & Textures
        var useShininessMap = false;
        if(obj.vTexBuffer && texture){
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(shaderProgram.samplerUniform, 0);
            if(texture.shininessMap){
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, texture.shininessMap);
                gl.uniform1i(shaderProgram.shininessMapSamplerUniform, 1);
                useShininessMap = true;
            }
        }
        gl.uniform1i(shaderProgram.useShininessMapUniform, useShininessMap&&snininessMapUse.getValue());
        gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, specular.getValue());
        var shininessValue = shininess.getValue()||0;
        //if(texture.shininess!=null)shininessValue = texture.shininess;
        if(obj.shininess!=null)shininessValue = obj.shininess;
        gl.uniform1f(shaderProgram.materialShininessUniform, shininessValue);




        gl.uniform1i(shaderProgram.useTexturesUniform, useTexture.getValue());

        //if(!texture||(currentObj == obj)){
        if(!texture){
            gl.uniform1i(shaderProgram.useTexturesUniform, false);
        }
        if(obj.vIndexBuffer){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.vIndexBuffer);
        }

        //setMatrixUniforms Start
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

        var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

        gl.uniformMatrix4fv(shaderProgram.cameraMatrixUniform, false, camera.getMatrix());
        //setMatrixUniforms End

        //used for s2
        //gl.uniform3f(shaderProgram.colorUniform, 7, 0, 1);

        if(obj.vIndexBuffer){
            gl.drawElements(gl.TRIANGLES, obj.vIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }else{
            gl.drawArrays(obj.glTriangleType, 0, obj.vPosBuffer.numItems);
        }
    }
    if(!options.noChilds){
    for(var childKey in obj.children){
        drawObject(obj.children[childKey], options);
    }
    }

    if(!options.notReset)
    mvPopMatrix();
}


var isPaused = false;
function togglePause(){
    //TODO: add pause message
    isPaused = !isPaused; 
}


function tick() {
    requestAnimFrame(tick);
    if(!loadManager.isFinished())return;
    handleKeys();
    if(!isPaused){
        drawScene();
        animate();
    }
}




function webGLStart() { //called from bodyonload in index.html

    var canvas = document.getElementById("canvas");
    
    initGL(canvas);
    assemblyScene();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //gl.clearColor(0.8, 1.0, 0.8, 1.0);
    //http://www.farb-tabelle.de/de/rgb2hex.htm?q=204%2C255%2C204
    //http://www.farb-tabelle.de/de/farbtabelle-websicher-rgB.htm



    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    canvas.onmousemove = handleMouseMove;

    //http://www.w3schools.com/js/js_htmldom_eventlistener.asp
    //document.onkeydown = handleKeyDown(event);
    //document.onkeyup = handleKeyUp(event);

    var x = document;
    if (x.addEventListener) {                    // For all major browsers, except IE 8 and earlier
         x.addEventListener("keydown", handleKeyDown);
         x.addEventListener("keyup", handleKeyUp);
    } else if (x.attachEvent) {                  // For IE 8 and earlier versions
         x.attachEvent("onkeydown", handleKeyDown);
         x.attachEvent("onkeyup", handleKeyUp);
    }

    tick();
}