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
    
    	document.querySelector('#markerDebugEnabled input').checked	= false;
    	document.querySelector('#markerDebugEnabled input').addEventListener('change', function(){
    		jsArucoMarker.debugEnabled = document.querySelector('#markerDebugEnabled input').checked
    	});
    	
    	//////////////////////////////////////////////////////////////////////////////////
    	//		Handle ui button
    	//////////////////////////////////////////////////////////////////////////////////
    	document.querySelector('#info .webcam').addEventListener('click', function(event){
    		location.hash	= '#webcam'
    		location.reload()
    	});
    
    	document.querySelector('#info .image').addEventListener('click', function(event){
    		location.hash	= '#image'
    		location.reload()
    	});
    
    	document.querySelector('#info .video').addEventListener('click', function(event){
    		location.hash	= '#video'
    		location.reload()
    	});

    	
    	
    };
    
    
    this.initVirtualEnvironment = function(renderer, scene, camera){
        // init renderer
    	var renderer	= new THREE.WebGLRenderer({
    		antialias	: true,
    		alpha		: true,
    	});
    	renderer.setSize( window.innerWidth, window.innerHeight );
    	document.body.appendChild( renderer.domElement );
    
    	// init scene and camera
    	var scene = new THREE.Scene();
    	var camera	= new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 1000);
    	camera.position.z = 2; 
    	
    	return {renderer:renderer,camera:camera,scene:scene};
    };
    
    
};