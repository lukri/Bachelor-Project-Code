/*global THREE*/
var Renderer = function(){
    var threeRenderer = new THREE.WebGLRenderer({
    		antialias	: true,
    		alpha		: true,
    });
    
    this.domElement = threeRenderer.domElement;
    
    var canvasWrap = document.createElement("div");
	canvasWrap.style.position = "absolute";
	canvasWrap.style.top = "50%"; 
	canvasWrap.style.left = "50%"; 
	canvasWrap.style.marginRight = "50%"; 
	canvasWrap.style.transform = "translate(-50%, -50%)"; 
	canvasWrap.style.maxWidth = "100%"; 
	canvasWrap.style.maxHeight = "100%"; 
	canvasWrap.style.width = "auto"; 
	canvasWrap.style.height = "auto";
	
	canvasWrap.appendChild(threeRenderer.domElement);
	document.body.appendChild(canvasWrap);

	// init scene and camera
	this.scene = new THREE.Scene();
	
	var views = [
	    {
		    //monocular
			left: 0,
			bottom: 0,
			width: 1.0,
			height: 1.0,
			background: new THREE.Color().setRGB( 0.5, 0.5, 0.7 ),
			backgroundAlpha:0.5,
			eye: [ 0, 0, 2 ],
			up: [ 0, 1, 0 ],
			fov: 40,
			updateCamera: function ( camera, scene, mouseX, mouseY ) {
			  camera.lookAt( scene.position );
			  return;
			}
		},
			
			
		{
		    //left eye
			left: 0,
			bottom: 0,
			width: 0.5,
			height: 1.0,
			background: new THREE.Color().setRGB( 0.5, 0.5, 0.7 ),
			backgroundAlpha:0.5,
			eye: [ -0.5, 0, 2 ],
			up: [ 0, 1, 0 ],
			fov: 40,
			updateCamera: function ( camera, scene, mouseX, mouseY ) {
			  camera.lookAt( scene.position );
			  return;
			  camera.position.x += mouseX * 0.05;
			  camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), -2000 );
			  camera.lookAt( scene.position );
			}
		},
		{
		    //right eye
			left: 0.5,
			bottom: 0,
			width: 0.5,
			height: 1.0,
			background: new THREE.Color().setRGB( 0.0, 0.0, 0.0),
			backgroundAlpha:1,
			eye: [ 0.5, 0, 2 ],
			up: [ 0, 1, 0 ],
			fov: 40,
			updateCamera: function ( camera, scene, mouseX, mouseY ) {
			  camera.lookAt( scene.position );
			  return;
			  camera.position.x -= mouseX * 0.05;
			  camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), -2000 );
			  camera.lookAt( scene.position );
			  //camera.lookAt( camera.position.clone().setY( 0 ) );
			}
		},
	];
	
	for (var ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		var camera = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 0.01, 10000 );
		camera.position.x = view.eye[ 0 ];
		camera.position.y = view.eye[ 1 ];
		camera.position.z = view.eye[ 2 ];
		camera.up.x = view.up[ 0 ];
		camera.up.y = view.up[ 1 ];
		camera.up.z = view.up[ 2 ];
		view.camera = camera;
	}
    
    this.addToScene = function(options){
        this.scene.add(options.object);
    };
    
    this.setSize = function(windowWidth, windowHeight){
        threeRenderer.setSize(windowWidth, windowHeight);
    };
    
    this.render = function(options){
        options = options || {};
        var windowWidth = options.width;
        var windowHeight = options.height;
        var binocularMode = options.binocularity || false;
        
		//first view is monocular, second and third left and right for binocular
		var ii=0;
		if(binocularMode)ii++;
	
		for ( ; ii < views.length; ++ii ) {

			view = views[ii];
			camera = view.camera;

			view.updateCamera(view.camera, scene);

			var left   = Math.floor( windowWidth  * view.left );
			var bottom = Math.floor( windowHeight * view.bottom );
			var width  = Math.floor( windowWidth  * view.width );
			var height = Math.floor( windowHeight * view.height );
			threeRenderer.setViewport( left, bottom, width, height );
			threeRenderer.setScissor( left, bottom, width, height );
			threeRenderer.setScissorTest( true );
			threeRenderer.setClearColor(options.background||view.background,view.backgroundAlpha);

			camera.aspect = width / height;
			camera.updateProjectionMatrix();

			threeRenderer.render( scene, camera );
			if(!binocularMode)break;
		}
    };
        
};