TextureHandler = function () {
    this.amount = 0;
    this.textureContainer = {};

    this.getTexture = function(name, options){
        options = options || {};
        if(options.getNthElement){
            var i=0;
            for(textureName in this.textureContainer){
                if(i==name)return this.textureContainer[textureName].texture;
                i++;
            }
            alert("not found");
            return null;
        }

        if(this.textureContainer[name]){
            return this.textureContainer[name].texture;
        }else{
            return null;
        }
    }

    this.getTextureCollection = function(){
        return this.textureContainer;
    }

    this.handleLoadedTexture = function(){
        if(this.lastName == "")return;

    }


    this.addTexture = function (name, imageSrc, method, options){
        options = options || {};
        if(this.textureContainer[name]){
            alert("Texture already exists");
            return;
        }
        this.amount++;
        this.textureContainer[name] = new Image();
        this.textureContainer[name].taskname = "texture"+this.amount;
        loadManager.addLoadingTask(this.textureContainer[name].taskname);
        this.textureContainer[name].texture = gl.createTexture();
        this.textureContainer[name].texture.name = name;
        this.textureContainer[name].texture.shininess = options.shininess;
        this.textureContainer[name].texture.shininessMap = null;
        this.textureContainer[name].method = method;
        this.textureContainer[name].onload = function(imageEvent){
            var image = imageEvent.target;
            var texture = imageEvent.target.texture;
            var method = imageEvent.target.method;
            var taskname = imageEvent.target.taskname;
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            switch(method) {
                case "nearest":
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    break;
                case "linear":
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    break;
                case "mipmap":
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                    gl.generateMipmap(gl.TEXTURE_2D);
                    break;
                default:
                    alert("There was no method found for: "+method);
                    break;
            }
            gl.bindTexture(gl.TEXTURE_2D, null);
            loadManager.removeLoadingTask(taskname);
        }
        this.textureContainer[name].src = imageSrc;
    }
}

var textureHanlder = new TextureHandler;