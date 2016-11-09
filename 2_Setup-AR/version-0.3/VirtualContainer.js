/*global THREE*/
var VirtualContainer = function() {
	var obj = new THREE.Object3D();    
   
	var objList = {};
	var lastActivatedObj = null;
	
	this.addToObjList = function(newObj){
	        objList[newObj.name] = newObj;
	};
	
	this.setActiveObject = function(objName){
		var objToActivate = objList[objName];
        if(lastActivatedObj){
            if(lastActivatedObj.name==objName)return;
            lastActivatedObj.visible=false;
            obj.remove(objToActivate);
        }
        obj.add(objToActivate);
        objToActivate.visible = true;
        lastActivatedObj = objToActivate;
		
		return;
	};	
	

	//////////////////////////////////////////////////////////////////////////////////
	//		add an object in the markerObject3D
	//////////////////////////////////////////////////////////////////////////////////
    


	// ground mesh and axes are added for debuggin
	var geometry = new THREE.PlaneGeometry(1,1,10,10);
	var material = new THREE.MeshBasicMaterial( {
		wireframe : true
	});
	var mesh = new THREE.Mesh(geometry, material);
	obj.add( mesh );

	mesh = new THREE.AxisHelper;
	obj.add( mesh );

	
	// add some other objects, which also can be changend 
	var nullMesh = new THREE.Mesh();
	nullMesh.name = "none";
	this.addToObjList(nullMesh);
	
	material = new THREE.SpriteMaterial({
		map: THREE.ImageUtils.loadTexture( 'images/awesome.png' ),
	});
	
	var object3d = new THREE.Sprite(material );
	object3d.scale.set( 2, 2, 1 );
	//markerObject3D.add(object3d)
	//markerObject3D.remove(object3d);
	object3d.name = "awesome";
	
	this.addToObjList(object3d);	 
	
	
	geometry = new THREE.BoxGeometry(1,1,1);
	material = new THREE.MeshBasicMaterial( {
		wireframe : true
	});
	
	
	mesh = new THREE.Mesh(geometry, material);
	//markerObject3D.add( mesh );
	mesh.name = "box";
	this.addToObjList(mesh);
	
	console.time("tree");
	var tree = new Tree();
	var treeObject = new THREE.Object3D(); 
	
	geometry = tree.getGeometry().trunk;
	//geometry.computeFaceNormals ();
	//geometry.computeVertexNormals ();
	material = new THREE.MeshNormalMaterial();
	mesh = new THREE.Mesh( geometry, material );
	mesh.scale.set( 0.1, 0.1, 0.1 );
	mesh.rotation.x = Math.PI / 2;
	
	treeObject.add(mesh);
	
	geometry = tree.getGeometry().leaves;
	//geometry.computeFaceNormals ();
	//geometry.computeVertexNormals ();
	material = new THREE.MeshNormalMaterial();
	mesh = new THREE.Mesh( geometry, material );
	mesh.scale.set( 0.1, 0.1, 0.1 );
	mesh.rotation.x = Math.PI / 2;
	
	treeObject.add(mesh);
	
	treeObject.name = "tree";
	this.addToObjList(treeObject);
	console.timeEnd("tree");
	
	
	
	geometry = new THREE.SphereGeometry( 1, 16, 16 );
    //material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    material = new THREE.MeshBasicMaterial( {
		wireframe : true
	});
	
	//material = new THREE.MeshNormalMaterial();
    var sphere = new THREE.Mesh( geometry, material );
    sphere.name = "sphere";
    this.addToObjList(sphere);
		
	
	
	this.getObjectsNameArray = function(){
		var names = [];
		for(var k in objList) names.push({name:k});
		return names;
	};
	
	
	
	this.getObject = function(){
		return obj;
	};
};