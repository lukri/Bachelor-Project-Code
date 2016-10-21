/*global THREE, CompatibilityTester, Initializer, VirtualContainer*/


var compatibilityTester = new CompatibilityTester();
var initializer = new Initializer();


compatibilityTester.test();



// init the marker recognition //belongs to the augmented part
var jsArucoMarker	= new THREEx.JsArucoMarker(); //is now gloabal;
jsArucoMarker.debugEnabled = true;






var detectMarkersEnabled	= true;
var markerToObject3DEnabled	= true;
var webglRenderEnabled		= true;
var useBinocularity         = false;

initializer.init();


var vE = initializer.initVirtualEnvironment();
var renderer = vE.renderer;
var scene = vE.scene;
var views = vE.views;

for (var ii =  0; ii < views.length; ++ii ) {
	var view = views[ii];
	camera = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 0.01, 10000 );
	camera.position.x = view.eye[ 0 ];
	camera.position.y = view.eye[ 1 ];
	camera.position.z = view.eye[ 2 ];
	camera.up.x = view.up[ 0 ];
	camera.up.y = view.up[ 1 ];
	camera.up.z = view.up[ 2 ];
	view.camera = camera;
}


var vC = new VirtualContainer();

//////////////////////////////////////////////////////////////////////////////////
//		create a markerObject3D
//////////////////////////////////////////////////////////////////////////////////
var markerObject3D = vC.getObject();
scene.add(markerObject3D)










// array of functions for the rendering loop
var onRenderFcts = [];




webarRun();



function toggleObj(element){
        var objName = element.value;
        vC.toggleObject(objName);
}



function webarRun(){
	
	//////////////////////////////////////////////////////////////////////////////////
	//		init Stats for detectMarkers
	//////////////////////////////////////////////////////////////////////////////////
	var detectMarkersStats = new Stats();  //is a three.js lib
	detectMarkersStats.setMode( 1 );
	document.body.appendChild( detectMarkersStats.domElement );
    detectMarkersStats.domElement.style.position = 'absolute'
	detectMarkersStats.domElement.style.bottom = '0px'
	detectMarkersStats.domElement.style.right = '0px'

	
	var renderStats = new Stats();
	renderStats.setMode( 0 );
	document.body.appendChild( renderStats.domElement );
    renderStats.domElement.style.position = 'absolute'
	renderStats.domElement.style.bottom = '0px'
	renderStats.domElement.style.left = '0px'


	
	//////////////////////////////////////////////////////////////////////////////////
	//		render the whole thing on the page
	//////////////////////////////////////////////////////////////////////////////////



	var windowWidth;
	var windowHeight;
	var cameraBak = camera.clone();
	var sceneBak = scene.clone();
	
	
	// render the scene
	onRenderFcts.push(function(){	
		renderStats.begin();
		if( webglRenderEnabled === true ){
			
			//use window width and height
			var targetWidth = window.innerWidth;
			var targetHeight = window.innerHeight
			
			//targetWidth = videoGrabbing.domElement.offsetWidth;
			//targetHeight = videoGrabbing.domElement.offsetWidth;
			
			
			
			// handle window resize
			if ( windowWidth != targetWidth || windowHeight != targetHeight ) {
					windowWidth  = targetWidth;
					windowHeight = targetHeight;
					renderer.setSize ( windowWidth, windowHeight );
					
					//renderer.domElement.width = windowWidth;
					//renderer.domElement.height = targetHeight;
					
			}
			
			/*
			windowWidth = 200;
			windowHeight = 400;
			*/
			//first view is monocular, second and third left and right for binocular
			var ii=0;
			if(useBinocularity)ii++;
		
			for ( ; ii < views.length; ++ii ) {

				view = views[ii];
				camera = view.camera;

				view.updateCamera(view.camera, scene);

				var left   = Math.floor( windowWidth  * view.left );
				var bottom = Math.floor( windowHeight * view.bottom );
				var width  = Math.floor( windowWidth  * view.width );
				var height = Math.floor( windowHeight * view.height );
				renderer.setViewport( left, bottom, width, height );
				renderer.setScissor( left, bottom, width, height );
				renderer.setScissorTest( true );
				renderer.setClearColor( view.background ,view.backgroundAlpha);

				camera.aspect = width / height;
				camera.updateProjectionMatrix();

				renderer.render( scene, camera );
				
				if(!useBinocularity)break;
			}
		
		}
		renderStats.end();
	})

	// run the rendering loop
	var previousTime = performance.now()
	requestAnimationFrame(function animate(now){

		requestAnimationFrame( animate );

		onRenderFcts.forEach(function(onRenderFct){
			onRenderFct(now, now - previousTime);
		});

		previousTime = now;
	});

	//////////////////////////////////////////////////////////////////////////////////
	//		Do the Augmented Reality part
	//////////////////////////////////////////////////////////////////////////////////


	// init the marker recognition
	//jsArucoMarker	= new THREEx.JsArucoMarker(); //is now gloabal;
	//jsArucoMarker.debugEnabled = true;

	// if no specific image source is specified, take the image by default
	if( location.hash === '' )	location.hash = '#image'

	// init the image source grabbing
	if( location.hash === '#video' ){
		var videoGrabbing = new THREEx.VideoGrabbing()
		jsArucoMarker.videoScaleDown = 2;
	}else if( location.hash === '#webcam' ){
		var videoGrabbing = new THREEx.WebcamGrabbing()
		jsArucoMarker.videoScaleDown = 2;
	}else if( location.hash === '#image' ){
		var videoGrabbing = new THREEx.ImageGrabbing()
		jsArucoMarker.videoScaleDown = 10;
	}else{
		console.assert(false, "no mapping hash");
		return;
	} 
	
	
	// attach the videoGrabbing.domElement to the body
        document.body.appendChild(videoGrabbing.domElement);

	//////////////////////////////////////////////////////////////////////////////////
	//		Process video source to find markers
	//////////////////////////////////////////////////////////////////////////////////
	// set the markerObject3D as visible
	markerObject3D.visible	= false;
	// process the image source with the marker recognition
	onRenderFcts.push(function(){
		if( detectMarkersEnabled === false )	return
		
		var domElement	= videoGrabbing.domElement;
		
		if(useBinocularity){
			domElement.binocularMode();
		}else{
			domElement.normalMode();;
		}
		
		
		detectMarkersStats.begin();
		var markers	= jsArucoMarker.detectMarkers(domElement);
		detectMarkersStats.end();
		
		if( markerToObject3DEnabled === false )	return
		markerObject3D.visible = false;

		//printXTime("markers",15,markers);
		
		// see if this.markerId has been found
		markers.forEach(function(marker){
			// if( marker.id !== 265 )	return

			jsArucoMarker.markerToObject3D(marker, markerObject3D);

			markerObject3D.visible = true;
		});
	});
}







var printedStack = {};
function printXTime(name,xTimes, printStuff){
	if(!printedStack[name])
		printedStack[name] = 0;
	
	if(printedStack[name]>=xTimes){
		return;
	}else{
		console.group(name+": "+printedStack[name]);
		printedStack[name]++;
		console.log(printStuff);
		console.groupEnd();
	}
}




function renderingLoop(){
    getRealWorldImage({source:"picture"}); //source: camera, picture, video
    
    get3DPosition();
    
        
    
    get3DElements();
    
    merge();
    
    draw();
}
