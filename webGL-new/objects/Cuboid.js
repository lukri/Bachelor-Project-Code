Cuboid = function (options) {
    options = options || {};
    var center = options.center || {x:0,y:0,z:0};
    var x = options.x || 2;
    var y = options.y || 2;
    var z = options.z || 2;

    x /= 2;
    y /= 2;
    z /= 2;

    this.vertices = [
        // Front face
        -x, -y,  z,
         x, -y,  z,
         x,  y,  z,
        -x,  y,  z,

        // Back face
        -x, -y, -z,
        -x,  y, -z,
         x,  y, -z,
         x, -y, -z,

        // Top face
        -x,  y, -z,
        -x,  y,  z,
         x,  y,  z,
         x,  y, -z,

        // Bottom face
        -x, -y, -z,
         x, -y, -z,
         x, -y,  z,
        -x, -y,  z,

        // Right face
         x, -y, -z,
         x,  y, -z,
         x,  y,  z,
         x, -y,  z,

        // Left face
        -x, -y, -z,
        -x, -y,  z,
        -x,  y,  z,
        -x,  y, -z,
    ];
    this.colorsTemp = [
        [1.0, 0.0, 0.0, 1.0],     // Front face
        [1.0, 1.0, 0.0, 1.0],     // Back face
        [0.0, 1.0, 0.0, 1.0],     // Top face
        [1.0, 0.5, 0.5, 1.0],     // Bottom face
        [1.0, 0.0, 1.0, 1.0],     // Right face
        [0.0, 0.0, 1.0, 1.0],     // Left face
    ];
    this.colors = [];
    for (var i in this.colorsTemp) {
    var color = this.colorsTemp[i];
    for (var j=0; j < 4; j++) {
    this.colors = this.colors.concat(color);
    }
    }

    //colorful ;)
    this.colors = [];
    for(var i=0; i<24;i++)
        this.colors.push(Math.random(),Math.random(),Math.random(),1);


    this.textureCoords = [
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Back face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Top face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,

        // Bottom face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,

        // Right face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ];

    this.normals = [
        // Front face
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,

        // Back face
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,

        // Top face
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,

        // Bottom face
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,

        // Right face
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,

        // Left face
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0
    ];

    this.indices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ]
};