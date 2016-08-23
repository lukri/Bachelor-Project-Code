Obj = function (type, options) {
    this.options = options || {};
    this.setObjectIndex();

    this.transformMatrix = mat4.create();
    mat4.identity(this.transformMatrix);
    this.transformMatrixSaved = mat4.create();
    mat4.identity(this.transformMatrixSaved);
    this.saveMatrix = function(){
        mat4.identity(this.transformMatrixSaved);
        mat4.multiply(this.transformMatrix,this.transformMatrixSaved,this.transformMatrixSaved);
    }
    this.scale = function(scale){
        var scaleArray = [1,1,1];
        scale = scale || {};
        if(scale.xyz)scale.x = scale.y = scale.z = scale.xyz;
        if(scale.x)scaleArray[0]=scale.x;
        if(scale.y)scaleArray[1]=scale.y;
        if(scale.z)scaleArray[2]=scale.z;
        mat4.scale(this.transformMatrix,scaleArray);
    }

    this.translate = function(translation, doBefore){
        var transMat = mat4.create();
        mat4.identity(transMat);
        var translateArray = [0,0,0];
        translation = translation || {};
        if(translation.x)translateArray[0]=translation.x;
        if(translation.y)translateArray[1]=translation.y;
        if(translation.z)translateArray[2]=translation.z;
        mat4.translate(transMat, translateArray);
        if(doBefore){
            mat4.multiply(this.transformMatrix,transMat,this.transformMatrix);
        }else{
            mat4.multiply(transMat,this.transformMatrix,this.transformMatrix);
        }
    }
    this.rotate = function(rotation, doBefore){
        var rotMat = mat4.create();
        mat4.identity(rotMat);
        rotation = rotation || {};
        if(rotation.x)
            mat4.rotate(rotMat, degToRad(rotation.x), [1, 0, 0]);
        if(rotation.y)
            mat4.rotate(rotMat, degToRad(rotation.y), [0, 1, 0]);
        if(rotation.z)
            mat4.rotate(rotMat, degToRad(rotation.z), [0, 0, 1]);
        if(doBefore){
            mat4.multiply(this.transformMatrix,rotMat,this.transformMatrix);
        }else{
            mat4.multiply(rotMat,this.transformMatrix,this.transformMatrix);
        }
    }

    this.reset = function(){
        mat4.identity(this.transformMatrix);
        mat4.multiply(this.transformMatrix,this.transformMatrixSaved,this.transformMatrix);
    }

    this.position = [0,0,0];
    this.rotation = {x:0,y:0,z:0};

    this.shader = null;
    this.texture = null;
    this.shininess = null;

    this.children = [];

    this.glTriangleType = gl.TRIANGLES;

    this.hasGeometry = false;

    this.addChild = function(childObj){
        if(!childObj)return;
        this.children.push(childObj);
    }

    this.invertNormals = function(){
        for(var i=0; i<this.normals.length; i++){
            this.normals[i] *= -1;
        }
        if(this.vNormBuffer){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vNormBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
        }
    }


    this.setShader = function(shaderName){
        this.shader = shaderHanlder.getShader(shaderName);
    }
    this.setTexture = function(textureName){
        this.texture = textureHanlder.getTexture(textureName);
    }



    this.setGeometry = function(type, options){
        var geometryObject = null;

        this.options = options || {};
        switch(type) {
        //*------------------------------------------------------------------------
        case "revolution":
            geometryObject = new Revolution(options);
            break;
        //*------------------------------------------------------------------------
        case "triangle":
            geometryObject = new Triangle(options);
            break;
        //*------------------------------------------------------------------------
        case "square":
            geometryObject = new Square(options);
            break;
        //*------------------------------------------------------------------------
        case "cube":
            geometryObject = new Cube(options);
            break;
        //*------------------------------------------------------------------------
        case "cuboid":
            geometryObject = new Cuboid(options);
            break;
        //*------------------------------------------------------------------------
        case "sphere":
            geometryObject = new Sphere(options);
            break;
        //*------------------------------------------------------------------------
        case "cylinder":
            geometryObject = new Cylinder(options);
            break;
        //*------------------------------------------------------------------------
        case "preloaded":
            this.vertices = this.options.vertices;
            this.normals = this.options.normals || null;
            this.textureCoords = this.options.textureCoords || null;
            this.colors = this.options.colors || null;
            this.indices = this.options.indices || null;
            this.glTriangleType = this.options.glTriangleType || gl.TRIANGLES;
            break;
        //*------------------------------------------------------------------------
        default:
            alert(type + " not found!");
            this.vertices = null;
            this.colors = null;
            return;
            break;
        }


        if(geometryObject){
            this.vertices = geometryObject.vertices || null;
            this.normals = geometryObject.normals || null;
            this.textureCoords = geometryObject.textureCoords || null;
            this.colors = geometryObject.colors || null;
            this.indices = geometryObject.indices || null;
            this.glTriangleType = geometryObject.glTriangleType || gl.TRIANGLES;

            if(this.options.isLight)this.invertNormals();

        }


        this.vPosBuffer = null;
        this.vColBuffer = null;
        this.vTexBuffer = null;
        this.vNormBuffer = null
        this.vIndexBuffer = null;
        this.junkBuffer = null;

        if(this.vertices){
            this.vPosBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vPosBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
            this.vPosBuffer.itemSize = 3;
            this.vPosBuffer.numItems = this.vertices.length / this.vPosBuffer.itemSize;
        }

        if(this.colors){
            this.vColBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vColBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
            this.vColBuffer.itemSize = 4;
            this.vColBuffer.numItems = this.colors.length / this.vColBuffer.itemSize;
            if(this.vPosBuffer.numItems != this.vColBuffer.numItems){
                this.vColBuffer = null;
                console.log("Colors were not set correctly");
            }
        }

        if(this.textureCoords){
            this.vTexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vTexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureCoords), gl.STATIC_DRAW);
            this.vTexBuffer.itemSize = 2;
            this.vTexBuffer.numItems = this.textureCoords.length / this.vTexBuffer.itemSize;
            if(this.vPosBuffer.numItems != this.vTexBuffer.numItems)this.vTexBuffer = null;
        }

        if(this.normals){
            this.vNormBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vNormBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
            this.vNormBuffer.itemSize = 3;
            this.vNormBuffer.numItems = this.normals.length / this.vNormBuffer.itemSize;
            if(this.vPosBuffer.numItems != this.vNormBuffer.numItems)this.vNormBuffer = null;
        }

        if(this.indices){
            this.vIndexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vIndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
            this.vIndexBuffer.itemSize = 1;
            this.vIndexBuffer.numItems = this.indices.length;
        }

        this.junkBuffer = gl.createBuffer();
        var junkArray = new Array(this.vPosBuffer.numItems);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.junkBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(junkArray), gl.STATIC_DRAW);
        this.junkBuffer.itemSize = 1;
        this.junkBuffer.numItems = this.vPosBuffer.numItems;

        this.hasGeometry = true;
    }
    if(type && (type!="group"))this.setGeometry(type, options);
}


Obj.prototype.loadSetGeometry = function(taskName, options){
    var options = options || {};
    if(!loadManager.addLoadingTask(taskName))return;
    if(!options.requestFile){
        alert("no request file defined");
        loadManager.removeLoadingTask(this);
        return;
    };

    var requestMethod = options.requestMethod || "GET";
    var requestFile = options.requestFile;
    var caller = this; //is also taskName

    var request = new XMLHttpRequest();
    request.open(requestMethod, requestFile);
    request.options = options;
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            caller.setGeometry("preloaded", caller.handleLoadedData(request.responseText, options));
            loadManager.removeLoadingTask(taskName);
        }
    }
    request.send();
}

Obj.prototype.handleLoadedData = function(data, options){
    var parseMethod = options.parseMethod || "text";
    var scale = options.scale || {xyz:1};
    if(scale.xyz)scale.x = scale.y = scale.z = scale.xyz;
    var shift = options.shift || {};
    var parsedData = {};

    switch(parseMethod) {
    //*------------------------------------------------------------------------
    case "json":
        data = JSON.parse(data);
        parsedData.vertices = data.vertexPositions;
        parsedData.textureCoords = data.vertexTextureCoords;
        parsedData.normals = data.vertexNormals;
        parsedData.indices = data.indices;
        break;
    //*------------------------------------------------------------------------
    case "text":
        var lines = data.split("\n");
        var vertexCount = 0;
        parsedData.vertices = [];
        parsedData.textureCoords = [];
        parsedData.normals = [];
        parsedData.colors = [];
        for (var i in lines) {
          var vals = lines[i].replace(/^\s+/, "").split(/\s+/);
          if (vals.length >= 3 && vals[0] != "//") {
            // It is a line describing a vertex; get X, Y and Z first
            parsedData.vertices.push(parseFloat(vals[0]*(scale.x||1)+(shift.x||0)));
            parsedData.vertices.push(parseFloat(vals[1]*(scale.y||1)+(shift.y||0)));
            parsedData.vertices.push(parseFloat(vals[2]*(scale.z||1)+(shift.z||0)));

            // And then the texture coords
            parsedData.textureCoords.push(parseFloat(vals[3]||1));
            parsedData.textureCoords.push(parseFloat(vals[4]||1));

            parsedData.normals.push(parseFloat(vals[5]||1));
            parsedData.normals.push(parseFloat(vals[6]||1));
            parsedData.normals.push(parseFloat(vals[7]||1));

            parsedData.colors.push(parseFloat(vals[8]||0.5));
            parsedData.colors.push(parseFloat(vals[9]||0.5));
            parsedData.colors.push(parseFloat(vals[10]||0.5));
            parsedData.colors.push(parseFloat(vals[11]||0.5));

          }
        }
        if(parsedData.textureCoords==[])vertexTextureCoords=null;
        if(parsedData.normals==[])parsedData.normals=null;
        if(parsedData.colors==[])parsedData.colors=null;
        break;
    //*------------------------------------------------------------------------
    default:
        break;
    }
    return parsedData;
}


Obj.prototype.amountOfObjects = 0;
Obj.prototype.pickingObjectArray = [];

Obj.prototype.setObjectIndex = function(){
    Obj.prototype.amountOfObjects += 1;
    this.index = Obj.prototype.amountOfObjects;
    var i = this.index;
    var g = parseInt(i/225);
    var r = parseInt(g/225);;
    var b = i%225;
    var index = r*65536+g*256+b;
    this.color = "r: "+r+" - g: "+g+" - b:"+b;
    this.indexColorArray = [r/255,g/255,b/255];
    Obj.prototype.pickingObjectArray[index]=this;
};