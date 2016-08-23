Tree = function (options) {
    
 	startLength = 5;
	startRadius = 0.5;
	maxDepth = 14; //13   max possible 18 and 15 would be nice

	gR = (1+Math.sqrt(5))/2; //golden Ratio
	lFactor = 0.7;
	rFactor = 0.7;
	parts = 5; //10 min 3
	
	vStep = (Math.PI*2)/parts; //textCoord
	
	
	var vertices=[],normals=[],textureCoords=[],colors=[],indices=[];
    
    var object = new Obj();
    var origin = new Vec();
	
	var trunk = new Obj();
	var leaves = new Obj();
	
	
	object.addChild(trunk);
	object.addChild(leaves);
	
	
	
	leafType = "RANDOM"; //"DREADS"LEAF""RANDOM"

	makeDoubleLeaf = true;
	

	angle = (Math.PI*2)/parts;
	vStep = (Math.PI*2)/parts; //textCoord
	
	var startNewObjectPart = function(){
        var part = new Obj("preloaded",{
                    vertices:vertices,
                    normals:normals,
                    colors:colors,
                    indices:indices
        });
        object.addChild(part);
        vertices=[],normals=[],textureCoords=[],colors=[],indices=[];
    };
	
	
	originRing = [];	
	for(var i=0; i<=parts; i++){
		v = new vec3.create([Math.sin(angle*i)*startRadius,0,Math.cos(angle*i)*startRadius]);	
		originRing.push(v);
	}
	
	

	
	
	buildBranch = function(baseTransformM, spreadAngle, branchRotAngle, depth) {
		if(depth >= maxDepth){
			addLeaf(baseTransformM, depth);
			return;
		}
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
		
		fixPart = Math.PI/7;
		randomPart = Math.PI/7;
		
		//left
		spreadAngle = (randomPart*getRandom(0,1) + fixPart);
		buildBranch(transform, spreadAngle , branchRotAngle, depth+1);
		
		//right
		spreadAngle = -(randomPart*getRandom(0,1) + fixPart);
		buildBranch(transform, spreadAngle , branchRotAngle, depth+1);
	};


	
	getRandom = function(from, to) {
		r = Math.random()*(to-from)+from;
		r = Math.round(r*1000)/1000.0;
		return r;
	};

	addLeaf = function(baseTransformM, depth) {
		var transformM = mat4.create();
		
		leafTypeS = leafType;
		
		if(leafType=="RANDOM"){
		    leafTypeS="DREADS";
		    if(Math.random()<=0.5)leafTypeS="LEAF";
		    makeDoubleLeaf = Math.random()<=0.2;
		}
		
		
		switch (leafTypeS) {
		case "LEAF":
			mat4.identity(transformM);
			s = 20;
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
	
	addBranch = function(baseTransformM, transformM, depth) {
		
		
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
		
		amountTriangle = vertices.length/3;
		//65536 = 2^16
        if(amountTriangle+originRing.length*2>65536){
            startNewObjectPart();
            amountTriangle=0;
        }
		
		
		
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
			j = i*2+amountTriangle;
			indices.push(j,j+1,j+2);
			indices.push(j+1,j+2,j+3);
		}
		
	}
	
	
	
	var baseTrans = mat4.create();
    mat4.identity(baseTrans);
	buildBranch(baseTrans,0,0,0);
	
	startNewObjectPart();

    this.getObject = function(){
        return object;
    };
	
	
};
