/*global THREE,THREEx, CompatibilityTester, Initializer, OptionPannel, VirtualContainer, Stats*/


var compatibilityTester = new CompatibilityTester();
var initializer = new Initializer();


compatibilityTester.test();


//////////////////////////////////////////////////////////////////////////////////
//		init Stats for detectMarkers
//////////////////////////////////////////////////////////////////////////////////
var detectMarkersStats = new Stats();  //is a three.js lib
detectMarkersStats.setMode( 1 );
document.body.appendChild( detectMarkersStats.domElement );
detectMarkersStats.domElement.style.position = 'absolute';
detectMarkersStats.domElement.style.bottom = '0px';
detectMarkersStats.domElement.style.right = '0px';


var renderStats = new Stats();
renderStats.setMode( 0 );
document.body.appendChild( renderStats.domElement );
renderStats.domElement.style.position = 'absolute';
renderStats.domElement.style.bottom = '0px';
renderStats.domElement.style.left = '0px';



initializer.init();


var vE = initializer.initVirtualEnvironment();
var renderer = vE.renderer;
var scene = vE.scene;
var views = vE.views;


var vC = new VirtualContainer();

//////////////////////////////////////////////////////////////////////////////////
//		create a markerObject3D
//////////////////////////////////////////////////////////////////////////////////
var markerObject3D = vC.getObject();
scene.add(markerObject3D);




//////////////////////////////////////////////////////////////////////////////////
//	options to enabled/disable various parts
//////////////////////////////////////////////////////////////////////////////////	
var optionPannel = new OptionPannel();	
var detectMarkersEnabledCheckbox = optionPannel.makeCheckbox({value:true, labelText:"detectMarkers",title:"to enable/disable marker detection in video"});
var markerToObject3DEnabledCheckbox = optionPannel.makeCheckbox({value:true, labelText:"markerToObject3D",title:"to enable/disable marker to object3d conversion"});
var webglRenderEnabledCheckbox = optionPannel.makeCheckbox({value:true, labelText:"webglRender",title:"to enable/disable webgl rendering"});
var markerDebugEnabledCheckbox = optionPannel.makeCheckbox({value:true, labelText:"marker debug",title:"to enable/disable marker debug"});
var useBinocularityCheckbox = optionPannel.makeCheckbox({value:false, labelText:"use binocular"});
var isPausedCheckbox = optionPannel.makeCheckbox({value:false, labelText:"pause renderLoop"});

var activeObjectNameSelection = optionPannel.makeSelection({
			labelText:"Choose Object:",
			optionChildren:vC.getObjectsNameArray(),
			selectedIndex:"last",
});







// array of functions for the rendering loop
var onRenderFcts = [];




webarRun();






function webarRun(){
	
	//////////////////////////////////////////////////////////////////////////////////
	//		render the whole thing on the page
	//////////////////////////////////////////////////////////////////////////////////
	var windowWidth;
	var windowHeight;
	
	
	// render the scene
	onRenderFcts.push(function(){	
		renderStats.begin();
		if( webglRenderEnabledCheckbox.checked === true ){
			
			//use window width and height
			var targetWidth = window.innerWidth;
			var targetHeight = window.innerHeight;
			
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
			if(useBinocularityCheckbox.checked)ii++;
		
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
				
				if(!useBinocularityCheckbox.checked)break;
			}
		
		}
		renderStats.end();
	});

	// run the rendering loop
	var previousTime = performance.now();
	requestAnimationFrame(function animate(now){

		requestAnimationFrame( animate );
		if(isPausedCheckbox.checked)return;
		onRenderFcts.forEach(function(onRenderFct){
			onRenderFct(now, now - previousTime);
		});

		previousTime = now;
	});

	//////////////////////////////////////////////////////////////////////////////////
	//		Do the Augmented Reality part
	//////////////////////////////////////////////////////////////////////////////////
	// init the marker recognition
	var jsArucoMarker	= new THREEx.JsArucoMarker(); //is now gloabal;	
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
		if( detectMarkersEnabledCheckbox.checked === false )	return
		
		var domElement	= videoGrabbing.domElement;
		
		if(useBinocularityCheckbox.checked){
			domElement.binocularMode();
		}else{
			domElement.normalMode();
		}
		
		jsArucoMarker.debugEnabled = markerDebugEnabledCheckbox.checked;
		detectMarkersStats.begin();
		var markers	= jsArucoMarker.detectMarkers(domElement);
		detectMarkersStats.end();
		
		if( markerToObject3DEnabledCheckbox.checked === false )	return
		markerObject3D.visible = false;

		//printXTime("markers",15,markers);
		
		vC.setActiveObject(activeObjectNameSelection.value);
		
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
