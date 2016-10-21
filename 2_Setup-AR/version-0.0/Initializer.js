/*global THREE*/

var Initializer = function(){
    
    
    this.init = function(){
    	//////////////////////////////////////////////////////////////////////////////////
    	//		Handle ui button
    	//////////////////////////////////////////////////////////////////////////////////
    	document.querySelector('#info .webcam').addEventListener('click', function(event){
    		location.hash	= '#webcam';
    		location.reload();
    	});
    
    	document.querySelector('#info .image').addEventListener('click', function(event){
    		location.hash	= '#image';
    		location.reload();
    	});
    
    	document.querySelector('#info .video').addEventListener('click', function(event){
    		location.hash	= '#video';
    		location.reload();
    	});

    	
    	
    };
    
    
    this.initVirtualEnvironment = function(renderer, scene, camera){
        // init renderer
    	var renderer	= new THREE.WebGLRenderer({
    		antialias	: true,
    		alpha		: true,
    	});
    	renderer.setSize( window.innerWidth, window.innerHeight ); //original code
    	//renderer.setSize( 400, window.innerHeight );
    	
		var canvasWrap = document.createElement("div");
		canvasWrap.style.position = "absolute";
		canvasWrap.style.width = "100%";
		canvasWrap.style.height = "100%";
		canvasWrap.style.display = "table-cell";
		canvasWrap.style.verticalAlign = "middle";
		canvasWrap.style.textAlign = "center";
		
    	canvasWrap.appendChild(renderer.domElement)
    	document.body.appendChild( renderer.domElement );
    
    	// init scene and camera
    	var scene = new THREE.Scene();
    	
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
    	
    	return {renderer:renderer,scene:scene, views: views};
    };
    
    
};