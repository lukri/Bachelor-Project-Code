/*global THREE*/

var Initializer = function(){
    
    
    this.init = function(){
        //////////////////////////////////////////////////////////////////////////////////
	    //		enabled/disable various parts
	    //////////////////////////////////////////////////////////////////////////////////
        
    	document.querySelector('#detectMarkersEnabled input').checked	= detectMarkersEnabled;
    	document.querySelector('#detectMarkersEnabled input').addEventListener('change', function(){
    		detectMarkersEnabled = document.querySelector('#detectMarkersEnabled input').checked 
    	});
    
    	document.querySelector('#markerToObject3DEnabled input').checked= markerToObject3DEnabled;
    	document.querySelector('#markerToObject3DEnabled input').addEventListener('change', function(){
    		markerToObject3DEnabled = document.querySelector('#markerToObject3DEnabled input').checked 
    	});
    
    	document.querySelector('#webglRenderEnabled input').checked	= webglRenderEnabled;
    	document.querySelector('#webglRenderEnabled input').addEventListener('change', function(){
    		webglRenderEnabled = document.querySelector('#webglRenderEnabled input').checked
    		// clear the webgl canvas - thus the last webgl rendering disapears
    		renderer.clear();
    	});
    
    	document.querySelector('#markerDebugEnabled input').checked	= jsArucoMarker.debugEnabled;
    	document.querySelector('#markerDebugEnabled input').addEventListener('change', function(){
    		jsArucoMarker.debugEnabled = document.querySelector('#markerDebugEnabled input').checked
    	});
    	
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
    	document.body.appendChild( renderer.domElement );
    
    	// init scene and camera
    	var scene = new THREE.Scene();
    	var camera	= new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 1000);
    	camera.position.z = 2; 
    	
    	
    	
    	
    	var views = [
				{
				    //left eye
					left: 0,
					bottom: 0,
					width: 0.5,
					height: 1.0,
					background: new THREE.Color().setRGB( 0.5, 0.5, 0.7 ),
					eye: [ 500, 0, 1800 ],
					up: [ 0, 1, 0 ],
					fov: 30,
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
					background: new THREE.Color().setRGB( 0.7, 0.5, 0.5 ),
					eye: [ -500, 0, 1800 ],
					up: [ 0, 1, 0 ],
					fov: 30,
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
    	
    	
    	
    	return {renderer:renderer,camera:camera,scene:scene, views: views};
    };
    
    
};