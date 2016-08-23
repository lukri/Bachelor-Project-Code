Square = function (options) {
    this.glTriangleType = gl.TRIANGLE_STRIP;
    this.vertices = [
         1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
         1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0
    ];
    this.colors = [];
    for (var i=0; i < 4; i++) {
      this.colors = this.colors.concat([0.5, 0.5, 1.0, 1.0]);
    }
    this.textureCoords = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ];

    this.normals = [
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
    ];
};