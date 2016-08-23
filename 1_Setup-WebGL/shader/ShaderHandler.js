// https://developers.google.com/web/updates/2011/12/Use-mediump-precision-in-WebGL-when-possible

ShaderHandler = function () {
    this.fragmentShaderStart = "precision lowp float;";
    this.fragmentUniforms = "\
                            uniform float uAlpha;\
                            uniform sampler2D uSampler;\
                            uniform sampler2D uColorMapSampler;\
                            uniform sampler2D uShininessMapSampler;\
                            uniform vec3 uColor;\
                            uniform float uMaterialShininess;\
                            uniform bool uShowSpecularHighlights;\
                            uniform bool uUseColorMap;\
                            uniform bool uUseShininessMap;\
                            uniform bool uUseLighting;\
                            uniform bool uUseTextures;\
                            uniform lowp vec3 uAmbientColor;\
                            uniform lowp vec3 uPointLightingLocation;\
                            uniform lowp vec3 uPointLightingSpecularColor;\
                            uniform lowp vec3 uPointLightingDiffuseColor;\
                            uniform lowp vec3 uPointLightingColor;";

    this.varyings = "\
                    varying vec4 vColor;\
                    varying vec2 vTextureCoord;\
                    varying vec3 vLightWeighting;\
                    varying vec3 vTransformedNormal;\
                    varying vec4 vPosition;\
                    varying vec3 vRealPosition;\
                    varying vec4 vLightPosition;\
                    varying vec3 vPickingColor;";

    this.vAttributes = "\
                    attribute vec3 aVertexPosition;\
                    attribute vec4 aVertexColor;\
                    attribute vec3 aVertexNormal;\
                    attribute vec2 aTextureCoord;";
    this.vUniforms = "\
                    uniform mat4 uMVMatrix;\
                    uniform mat4 uPMatrix;\
                    uniform mat3 uNMatrix;\
                    uniform mat4 uCamMatrix;\
                    uniform lowp vec3 uAmbientColor;\
                    uniform lowp vec3 uLightingDirection;\
                    uniform lowp vec3 uDirectionalColor;\
                    uniform lowp vec3 uPointLightingLocation;\
                    uniform lowp vec3 uPointLightingColor;\
                    uniform bool uUseLighting;\
                    uniform bool uUseTextures;\
                    uniform vec3 uPickingColor;";

//--- actual shader---------------------------------------------------------------------------------------------------------------

    this.ShaderScriptCollection = {
        "color-fs": {
            type: "x-shader/x-fragment",
            script: "\
                void main(void) {\
                    if(vColor.rgb == vec3(0,0,0))discard;\
                    gl_FragColor = vColor;\
                    gl_FragColor = vec4(vColor.rgb * vLightWeighting, vColor.a * uAlpha);\
                }\
            ",
        },
        "pervertexlight-fs": {
            type: "x-shader/x-fragment",
            script: "\
                void main(void) {\
                    vec4 fragmentColor;\
                    if (uUseTextures) {\
                        fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\
                    } else {\
                        fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);\
                    }\
                    gl_FragColor = vec4(fragmentColor.rgb * vLightWeighting, fragmentColor.a);\
                }\
            ",
        },

        "perfraglight-fs": {
            type: "x-shader/x-fragment",
            script: "\
                void main(void) {\
                    vec3 lightWeighting;\
                    if (!uUseLighting) {\
                        lightWeighting = vec3(1.0, 1.0, 1.0);\
                    } else {\
                        vec3 lightDirection = normalize(vLightPosition.xyz - vPosition.xyz);\
                        vec3 normal = normalize(vTransformedNormal); \
                        float specularLightWeighting = 0.0;\
                        if (uShowSpecularHighlights) {\
                            float shininess = uMaterialShininess;\
                            if (uUseShininessMap) {\
                              shininess = texture2D(uShininessMapSampler, vec2(vTextureCoord.s, vTextureCoord.t)).r * 255.0;\
                            }\
                            if (shininess < 225.0) {\
                                vec3 eyeDirection = normalize(-vPosition.xyz);\
                                vec3 reflectionDirection = reflect(-lightDirection, normal);\
                                specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), shininess);\
                            }\
                        }\
                        float diffuseLightWeighting = max(dot(normal, lightDirection), 0.0);\
                        lightWeighting = uAmbientColor\
                            + uPointLightingSpecularColor * specularLightWeighting\
                            + uPointLightingDiffuseColor * diffuseLightWeighting;\
                    }\
                    vec4 fragmentColor;\
                    if (uUseTextures) {\
                        fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\
                    } else {\
                        fragmentColor = vec4(1.0, 1.0, 1.0, 1.0); \
                    } \
                    gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);\
                }\
            ",
        },


        "terrain-fs": {
            type: "x-shader/x-fragment",
            script: "\
                vec4 newColor;\
                void main(void) {\
                    if(pow(vPosition.x,2.0) + pow(vPosition.z,2.0) < 10.0)discard;\
                    gl_FragColor = vColor;\
                    newColor = vColor;\
                    gl_FragColor = vec4(newColor.rgb * vLightWeighting, newColor.a * uAlpha);\
                }\
            ",
        },



        "shader-vs": {
            type: "x-shader/x-vertex",
            script: "\
                 void main(void) {\
                     vRealPosition = aVertexPosition;\
                     vec4 mvPosition = uMVMatrix * vec4(aVertexPosition, 1.0);\
                     gl_Position = uPMatrix * mvPosition;\
                     vColor = aVertexColor;\
                     vTextureCoord = aTextureCoord;\
                     vPosition = mvPosition;\
                     vTransformedNormal = uNMatrix * aVertexNormal;\
                     vLightPosition = uCamMatrix * vec4(uPointLightingLocation, 1.0);\
                     \
                     if (!uUseLighting) {\
                        vLightWeighting = vec3(1.0, 1.0, 1.0);\
                     } else {\
                        vec3 lightDirection = normalize(vLightPosition.xyz - mvPosition.xyz);\
                        \
                        vec3 transformedNormal = uNMatrix * aVertexNormal;\
                        float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);\
                        vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;\
                        \
                        directionalLightWeighting = max(dot(transformedNormal, lightDirection), 0.0);\
                        vLightWeighting = uAmbientColor + uPointLightingColor * directionalLightWeighting;\
                        \
                     }\
                 }\
            ",
        },

        "picking-vs": {
            type: "x-shader/x-vertex",
            script: "\
                 void main(void) {\
                     vec4 mvPosition = uMVMatrix * vec4(aVertexPosition, 1.0);\
                     gl_Position = uPMatrix * mvPosition;\
                     \
                     vColor = aVertexColor;\
                     vPickingColor = uPickingColor;\
                     vTextureCoord = aTextureCoord;\
                     vPosition = mvPosition;\
                     vTransformedNormal = uNMatrix * aVertexNormal;\
                 }\
            ",
        },


        "picking-fs": {
            type: "x-shader/x-fragment",
            script: "\
                void main(void) {\
                    gl_FragColor = vec4(vPickingColor.rgb, 1.0);\
                }\
            ",
        },
    }
//--- actual shader end---------------------------------------------------------------------------------------------------------------


    this.amount = 0;
    this.shaderContainer = {};

    this.getInternShader = function(gl, id) {
        var shaderScript = this.ShaderScriptCollection[id];
        if (!shaderScript) {
            alert(id + " not found in shadercollection");
            return null;
        }

        var str = this.varyings;

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            str = this.fragmentShaderStart + this.fragmentUniforms + str;
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            str = this.vAttributes + this.vUniforms + str;
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }
        str += shaderScript.script;

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }






    this.addShader = function (name, fsName, vsName){
        if(this.shaderContainer[name]){
            alert("Shader already exists");
            return;
        }
        var fragmentShader = this.getInternShader(gl, fsName);
        var vertexShader = this.getInternShader(gl, vsName);

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);


        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shader: "+name);
            alert(gl.getProgramInfoLog(shaderProgram));
            return;
        }

        //add position to the attributes
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        //add color to the attributes
        shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute)

        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        shaderProgram.cameraMatrixUniform = gl.getUniformLocation(shaderProgram, "uCamMatrix");
        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
        shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");
        shaderProgram.showSpecularHighlightsUniform = gl.getUniformLocation(shaderProgram, "uShowSpecularHighlights");
        shaderProgram.colorMapSamplerUniform = gl.getUniformLocation(shaderProgram, "uColorMapSampler");
        shaderProgram.shininessMapSamplerUniform = gl.getUniformLocation(shaderProgram, "uShininessMapSampler");
        shaderProgram.useColorMapUniform = gl.getUniformLocation(shaderProgram, "uUseColorMap");
        shaderProgram.useShininessMapUniform = gl.getUniformLocation(shaderProgram, "uUseShininessMap");
        shaderProgram.useTexturesUniform = gl.getUniformLocation(shaderProgram, "uUseTextures");
        shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
        shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
        shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
        shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");
        shaderProgram.alphaUniform = gl.getUniformLocation(shaderProgram, "uAlpha");
        shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "uColor");

        shaderProgram.pickingColorUniform = gl.getUniformLocation(shaderProgram, "uPickingColor");


        shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
        shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingSpecularColor");
        shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor");

        //abfall von serie 13
        shaderProgram.pointLightingColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingColor");

        shaderProgram.name = name;

        this.shaderContainer[name] = shaderProgram;
        this.amount++;
    }
    this.getShader = function(name, options){
        options = options || {};
        if(options.getNthElement){
            var i=0;
            for(shaderName in this.shaderContainer){
                if(i==name)return this.shaderContainer[shaderName];
                i++;
            }
            alert("not found");
            return null;
        }

        if(this.shaderContainer[name]){
            return this.shaderContainer[name];
        }else{
            return null;
        }
    }

} //discarded

var shaderHanlder = new ShaderHandler;