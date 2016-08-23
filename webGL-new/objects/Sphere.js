Sphere = function (options) {
    var lightNormals = 1;

    this.normals=[];this.textureCoords=[];this.vertices=[];this.colors=[];this.indices=[];
    var latitudeBands = options.latitudeBands;
    var longitudeBands = options.longitudeBands;
    var radius = options.radius;
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      var theta = latNumber * Math.PI / latitudeBands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        var phi = longNumber * 2 * Math.PI / longitudeBands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;
        var u = 1 - (longNumber / longitudeBands);
        var v = 1 - (latNumber / latitudeBands);

        this.normals.push(x * lightNormals);
        this.normals.push(y * lightNormals);
        this.normals.push(z * lightNormals);
        this.textureCoords.push(u);
        this.textureCoords.push(v);
        this.vertices.push(radius * x);
        this.vertices.push(radius * y);
        this.vertices.push(radius * z);
        var r,g,b;
        if(options.noise){
          n = options.noise.getValue(radius * x,radius * y,radius * z);
          r=0,5; g=1; b=2;
          if(n>0.7) r=g=b=n*4;
        }else{
          r=Math.random();
          g=Math.random();
          b=Math.random();
        }
        this.colors.push(r);
        this.colors.push(g);
        this.colors.push(b);
        this.colors.push(1);
      }
    }

    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
        var first = (latNumber * (longitudeBands + 1)) + longNumber;
        var second = first + longitudeBands + 1;
        this.indices.push(first);
        this.indices.push(second);
        this.indices.push(first + 1);

        this.indices.push(second);
        this.indices.push(second + 1);
        this.indices.push(first + 1);
      }
    }
};