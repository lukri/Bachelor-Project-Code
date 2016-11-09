/*global Obj, vec3, mat4, THREE*/

var Tree = function (options) {
    
    var geometryT = new THREE.Geometry();  //Trunk
    var geometryL = new THREE.Geometry();  //Leaves
    
 	var startLength = 5;
	var startRadius = 0.5;
	var maxDepth = 14; //13   max possible 18 and 15 would be nice

	var gR = (1+Math.sqrt(5))/2; //golden Ratio
	var lFactor = 0.7;
	var rFactor = 0.7;
	var parts = 5; //10 min 3
	
	var vStep = (Math.PI*2)/parts; //textCoord
	
	
	
	var vertices,normals,textureCoords,colors,indices;
	var verticesT=[],normalsT=[],textureCoordsT=[],colorsT=[],indicesT=[];
	var verticesL=[],normalsL=[],textureCoordsL=[],colorsL=[],indicesL=[];
	

	
	
	var leafType = "RANDOM"; //"DREADS"LEAF""RANDOM""NONE"

	var makeDoubleLeaf = true;
	

	var angle = (Math.PI*2)/parts;
	vStep = (Math.PI*2)/parts; //textCoord
	
	
	
	
	var originRing = [];	
	for(var i=0; i<=parts; i++){
		var v = new vec3.create([Math.sin(angle*i)*startRadius,0,Math.cos(angle*i)*startRadius]);	
		originRing.push(v);
	}
	
	

	
	
	var buildBranch = function(baseTransformM, spreadAngle, branchRotAngle, depth) {
		if(depth >= maxDepth){
			addLeaf(baseTransformM, depth);
			return;
		}
		
		//change context
		vertices = verticesT;
		normals = normalsT;
		textureCoords = textureCoordsT;
		colors = colorsT;
		indices = indicesT;
		
		
		
		var transform = mat4.create();
        mat4.identity(transform);
		mat4.translate(transform, [0,startLength*Math.pow(lFactor,depth),0]);  //move length up
		
		var spreadMatrix = mat4.create();
		mat4.identity(spreadMatrix);
        mat4.rotate(spreadMatrix, spreadAngle, [0,0,1]); //rotZ
		mat4.multiply(spreadMatrix, transform, transform);
		
		var branchRotMatrix = mat4.create();
		mat4.identity(branchRotMatrix);
		mat4.rotate(branchRotMatrix, branchRotAngle, [0,1,0]); //rotY
		mat4.multiply(branchRotMatrix, transform, transform);
		
		//first do the new transformation and then all the former onces
		mat4.multiply(baseTransformM, transform, transform);
		
		
		
		addBranch(baseTransformM, transform, depth);
		
		branchRotAngle = Math.PI/2*getRandom(0,1); 
		
		var fixPart = Math.PI/7;
		var randomPart = Math.PI/7;
		
		//left
		spreadAngle = (randomPart*getRandom(0,1) + fixPart);
		buildBranch(transform, spreadAngle , branchRotAngle, depth+1);
		
		//right
		spreadAngle = -(randomPart*getRandom(0,1) + fixPart);
		buildBranch(transform, spreadAngle , branchRotAngle, depth+1);
	};


	
	var getRandom = function(from, to) {
		var r = Math.random()*(to-from)+from;
		r = Math.round(r*1000)/1000.0;
		return r;
	};

	var addLeaf = function(baseTransformM, depth) {
		//change context
		vertices = verticesL;
		normals = normalsL;
		textureCoords = textureCoordsL;
		colors = colorsL;
		indices = indicesL;
		
		var transformM = mat4.create();
		
		var leafTypeS = leafType;
		if(leafType=="NONE")return;
		
		if(leafType=="RANDOM"){
		    leafTypeS="DREADS";
		    if(Math.random()<=0.5)leafTypeS="LEAF";
		    makeDoubleLeaf = Math.random()<=0.2;
		}
		
		
		switch (leafTypeS) {
		case "LEAF":
			mat4.identity(transformM);
			var s = 20;
			mat4.scale(transformM,[s,s,s]);
			mat4.translate(transformM,[0,0.01,0]);
			mat4.multiply(baseTransformM, transformM, transformM);
			addBranch(baseTransformM, transformM, depth);
		
			if(makeDoubleLeaf){
				mat4.identity(transformM);
				s = 20;
			    mat4.scale(transformM,[s,s,s]);
				mat4.translate(transformM,[0,0.02,0]);
				mat4.multiply(baseTransformM, transformM, transformM);
				addBranch(baseTransformM, transformM, depth);
			}
			
			break;
		case "DREADS":	
			mat4.set(baseTransformM, transformM);
			transformM[13] -= 2;
			addBranch(baseTransformM, transformM, depth);
			break;
		default:
			break;
		}
	};
	
	var addBranch = function(baseTransformM, transformM, depth) {
		
		var shrink1 = mat4.create();
		mat4.identity(shrink1);
		var s1 = Math.pow(rFactor,depth-1);
		mat4.scale(shrink1,[s1,s1,s1]);
		
		
		var shrink2 = mat4.create();
		mat4.identity(shrink2);
		var s2 = Math.pow(rFactor,depth);
		mat4.scale(shrink2,[s2,s2,s2]);
		
		
		
		//Vector3f v, v1,v2, mp1, mp2;
		var v1 = vec3.create();
		var v2 = vec3.create();
		var mp1 = vec3.create([baseTransformM[12],baseTransformM[13],baseTransformM[14]]);
		var mp2 = vec3.create([transformM[12],transformM[13],transformM[14]]);
		
		var amountTriangle = vertices.length/3;
		
		for(var i=0; i<originRing.length;i++){
			v = originRing[i]; 
			//base ring
			
			mat4.multiplyVec3(shrink1,v,v1);
			
			if(depth===0)mat4.multiplyVec3(shrink2,v,v1);
			
			mat4.multiplyVec3(baseTransformM,v1,v1);
			
			
			vertices.push(v1[0],v1[1],v1[2]);
			
		
			vec3.subtract(v1,mp1,v1);
			vec3.normalize(v1);
			normals.push(v1[0],v1[1],v1[2]);
			textureCoords.push(0, vStep*i);
			
			//upper ring
			mat4.multiplyVec3(shrink2,v,v2);
			if(depth==maxDepth)mat4.multiplyVec3(shrink1,v,v1);
			mat4.multiplyVec3(transformM,v2,v2);
			vertices.push(v2[0],v2[1],v2[2]);
			vec3.subtract(v2,mp2,v2);
			vec3.normalize(v2);
			normals.push(v2[0],v2[1],v2[2]);
			textureCoords.push(1, vStep*i);
			
			if(depth==maxDepth){ //leaf color
                colors.push(0.1,1,0.2,1,  0.1,1,0.2,1);
                //colors.push(Math.random(),Math.random(),Math.random(),1,Math.random(),Math.random(),Math.random(),1);
                /*
                if(Math.random()>0.5){
                    colors.push(0.1,1,0.2,1,  0.1,1,0.2,1);
                }else{
                    //colors.push(0.1,2,0.2,1,  0.1,2,0.2,1);
                    colors.push(2,1,0,1,  2,1,0,1);
                }
                */
            }else{ //trunk color
                var r = 0.6;//Math.random()+0.5;
                colors.push(r,r/2,0,1);
                colors.push(r,r/2,0,1);
            }
			
			if(i==originRing.length-1)continue;
			var j = i*2+amountTriangle;
			indices.push(j+1,j,j+2);  // order important to satisfy the counterclockwise connvention, this is why j is in the middle
			indices.push(j+1,j+2,j+3);
			//http://stackoverflow.com/questions/15795348/generate-mesh-faces-for-vertices-in-three-js
		}
		
	};
	
	var baseTrans = mat4.create();
    mat4.identity(baseTrans);
	buildBranch(baseTrans,0,0,0);
	
    /*
    var trunk = new Obj("preloaded",{
    	vertices:verticesT,
    	normals:normalsT,
    	colors:colorsT,
    	indices:indicesT
    });
    
    
    var leaves = new Obj("preloaded",{
    	vertices:verticesL,
    	normals:normalsL,
    	colors:colorsL,
    	indices:indicesL
    });
    
	*/
	
	
	//translate to three.js
	for (var i = 0; i<verticesT.length; i) {
	    var v1 = new THREE.Vector3(verticesT[i++],verticesT[i++],verticesT[i++]);
        var v2 = new THREE.Vector3(verticesT[i++],verticesT[i++],verticesT[i++]);
        var v3 = new THREE.Vector3(verticesT[i++],verticesT[i++],verticesT[i++]);
        
        geometryT.vertices.push(v1);
        geometryT.vertices.push(v2);
        geometryT.vertices.push(v3);

	}
	
	for (var i = 0; i<indicesT.length; i) {
	    geometryT.faces.push( new THREE.Face3( indicesT[i++], indicesT[i++], indicesT[i++] ) );
	}
	
	
	for (var i = 0; i<verticesL.length; i) {
	    var v1 = new THREE.Vector3(verticesL[i++],verticesL[i++],verticesL[i++]);
        var v2 = new THREE.Vector3(verticesL[i++],verticesL[i++],verticesL[i++]);
        var v3 = new THREE.Vector3(verticesL[i++],verticesL[i++],verticesL[i++]);
        
        geometryL.vertices.push(v1);
        geometryL.vertices.push(v2);
        geometryL.vertices.push(v3);

	}
	
	for (var i = 0; i<indicesL.length; i) {
	    geometryL.faces.push( new THREE.Face3( indicesL[i++], indicesL[i++], indicesL[i++] ) );
	}
	
	
	
	


    
    this.getGeometry = function(){
        return {trunk:geometryT,leaves:geometryL};
    };
	
	
};
