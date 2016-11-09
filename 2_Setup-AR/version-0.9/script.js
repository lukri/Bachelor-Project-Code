/*global THREE,THREEx, CompatibilityTester, Renderer, OptionPanel, VirtualContainer, Stats, location, MarkerHandler*/


var compatibilityTester = new CompatibilityTester();


compatibilityTester.test();


//////////////////////////////////////////////////////////////////////////////////
//		make fullscreen possible
//////////////////////////////////////////////////////////////////////////////////

function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
    
    optionPanel.hidePanel();
    
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    optionPanel.showPanel();
  }
}




//////////////////////////////////////////////////////////////////////////////////
//		init Stats for detectMarkers
//////////////////////////////////////////////////////////////////////////////////
var detectMarkersStats = new Stats();  //is a three.js lib
detectMarkersStats.setMode( 1 );
document.body.appendChild( detectMarkersStats.domElement );
detectMarkersStats.domElement.style.position = 'absolute';
detectMarkersStats.domElement.style.bottom = '0px';
detectMarkersStats.domElement.style.left = '0px';


var renderStats = new Stats();
renderStats.setMode( 0 );
document.body.appendChild( renderStats.domElement );
renderStats.domElement.style.position = 'absolute';
renderStats.domElement.style.bottom = '0px';
renderStats.domElement.style.right = '0px';

//////////////////////////////////////////////////////////////////////////////////
//		Handle ui button
//////////////////////////////////////////////////////////////////////////////////
document.querySelector('#info .generated').addEventListener('click', function(event){
	location.hash	= '#generated';
	location.reload();
});


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

document.querySelector('#info .mobiletest').addEventListener('click', function(event){
	location.hash	= '#mobiletest';
	location.reload();
});

var renderer = new Renderer();
var scene = renderer.scene;


var vC = new VirtualContainer();

//////////////////////////////////////////////////////////////////////////////////
//		create a markerObject3D
//////////////////////////////////////////////////////////////////////////////////
var markerObject3D = vC.getObject();
markerObject3D.visible	= false;
scene.add(markerObject3D);

markerObject3D.scale.x = 35;
markerObject3D.scale.y = 35;
markerObject3D.scale.z = 35;



//////////////////////////////////////////////////////////////////////////////////
//	options to enabled/disable various parts
//////////////////////////////////////////////////////////////////////////////////	
var optionPanel = new OptionPanel();	
//optionPanel.addTitle("OPTIONS");

optionPanel.openGroup({title:"OPTIONS", checked:false});
var detectMarkersEnabledCheckbox = optionPanel.makeCheckbox({value:true, labelText:"detectMarkers",title:"to enable/disable marker detection in video"});
var markerToObject3DEnabledCheckbox = optionPanel.makeCheckbox({value:true, labelText:"markerToObject3D",title:"to enable/disable marker to object3d conversion"});
var webglRenderEnabledCheckbox = optionPanel.makeCheckbox({value:true, labelText:"webglRender",title:"to enable/disable webgl rendering"});
var markerDebugEnabledCheckbox = optionPanel.makeCheckbox({value:true, labelText:"marker debug",title:"to enable/disable marker debug"});
var useBinocularityCheckbox = optionPanel.makeCheckbox({value:false, labelText:"use binocular"});
var displayStatsBox = optionPanel.makeCheckbox({value:true, labelText:"displayStats"});
optionPanel.closeGroup();

optionPanel.openGroup({title:"Mergin"});
var mergeMarkersBox = optionPanel.makeCheckbox({value:false, labelText:"merge Markers"});
var mergeTranslationBox = optionPanel.makeCheckbox({value:false, labelText:"merge Translation"});
var mergeRotationBox = optionPanel.makeCheckbox({value:false, labelText:"merge Rotation"});
optionPanel.closeGroup();

optionPanel.openGroup({title:"Smoothing", checked:true});
var smoothMarkerBox = optionPanel.makeCheckbox({value:false, labelText:"smooth Markers", disabled:true});
var smoothTranslationBox = optionPanel.makeCheckbox({value:true, labelText:"smooth Translation", disabled:false});
var transSmoothRate = optionPanel.makeSelection({
			labelText:"image Scale Down:",
			optionChildren:[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0,"dynamic"],
			selectedIndex:"dynamic",
});
var smoothRotationBox = optionPanel.makeCheckbox({value:true, labelText:"smooth Rotation", disabled:false});
optionPanel.closeGroup();

optionPanel.openGroup({title:"Applying", checked:true});
var applyTranslationBox = optionPanel.makeCheckbox({value:true, labelText:"apply Translation"});
var applyRotationBox = optionPanel.makeCheckbox({value:true, labelText:"apply Rotation"});
optionPanel.closeGroup();

optionPanel.openGroup({title:"", checked:true});

var activeObjectNameSelection = optionPanel.makeSelection({
			labelText:"Choose Object:",
			optionChildren:vC.getObjectsNameArray(),
			selectedIndex:"none",
});

var scaleDownSelection = optionPanel.makeSelection({
			labelText:"image Scale Down:",
			optionChildren:[1,2,3,4,5,6,7,8,9,10],
			selectedIndex:1,
}); 

var isPausedCheckbox = optionPanel.makeCheckbox({value:false, labelText:"pause renderLoop"});
optionPanel.closeGroup();



//////////////////////////////////////////////////////////////////////////////////
//		init the Augmented Reality part
//////////////////////////////////////////////////////////////////////////////////


// init the marker recognition
var jsArucoMarker	= new THREEx.JsArucoMarker();
// if no specific image source is specified, take the image by default
if( location.hash === '' )	location.hash = '#image';

// init the image source grabbing 
var videoGrabbing;
if( location.hash === '#generated' ){
	
	//detectMarkersEnabledCheckbox.checked = false;
	optionPanel.openGroup({title:"ANIMATION", checked:true});
	videoGrabbing = new THREEx.Generated();
	videoGrabbing.xBox = optionPanel.makeCheckbox({value:false, labelText:"turn x"});
	videoGrabbing.yBox = optionPanel.makeCheckbox({value:false, labelText:"turn y"});
	videoGrabbing.zBox = optionPanel.makeCheckbox({value:false, labelText:"turn z"});
	
	videoGrabbing.draw2Box = optionPanel.makeCheckbox({value:false, labelText:"draw 2"});
	videoGrabbing.identically = optionPanel.makeCheckbox({value:true, labelText:"identically"});
	
	videoGrabbing.useTextureBox = optionPanel.makeCheckbox({value:false, labelText:"use texture"});
	
	videoGrabbing.reset = optionPanel.makeCheckbox({value:false, labelText:"reset"});
	
	
	//videoGrabbing.trackballActivationBox = optionPanel.makeCheckbox({value:false, labelText:"trackball active"});
	
	
	optionPanel.closeGroup();
	scaleDownSelection.setSelectionByValue(3);
	
}else if( location.hash === '#video' ){
	videoGrabbing = new THREEx.VideoGrabbing();
	scaleDownSelection.setSelectionByValue(2);
}else if( location.hash === '#webcam' ){
	videoGrabbing = new THREEx.WebcamGrabbing();
	scaleDownSelection.setSelectionByValue(2);
}else if( location.hash === '#image' ){
	videoGrabbing = new THREEx.ImageGrabbing();
	scaleDownSelection.setSelectionByValue(10);
}else if( location.hash === '#mobiletest' ){
	videoGrabbing = new THREEx.WebcamGrabbing();
	scaleDownSelection.setSelectionByValue(2);
	
	document.getElementById('fullscreenDom').style.display = "block";
	markerDebugEnabledCheckbox.checked = false;
	displayStatsBox.checked = false;
	document.getElementById('info').style.display = "none";
	activeObjectNameSelection.setSelectionByValue("tree");
	
}else{
	console.assert(false, "no mapping hash");
} 


// attach the videoGrabbing.domElement to the body
document.body.appendChild(videoGrabbing.domElement);




//////////////////////////////////////////////////////////////////////////////////
//		render the whole thing on the page
//////////////////////////////////////////////////////////////////////////////////


// run the rendering loop
requestAnimationFrame(function animate(now){
	//possible to calculate  passet time
	requestAnimationFrame( animate );
	if(isPausedCheckbox.checked) return;
	renderingLoop();
});

var windowWidth=0;
var windowHeight=0;

var markerHandler = new MarkerHandler();


var blankPhaseCount = 0;
var lastTranslation, newTranlation, lastRotation1,lastRotation2,lastRotation3, newRotation1,newRotation2,newRotation3;


displayStatsBox.lastState = true;
function renderingLoop(){
	
	
	if(displayStatsBox.checked != displayStatsBox.lastState){
		if(displayStatsBox.checked){
			document.body.appendChild( detectMarkersStats.domElement );
			document.body.appendChild( renderStats.domElement );	
		}else{
			document.body.removeChild( detectMarkersStats.domElement );
			document.body.removeChild( renderStats.domElement );
		}
		displayStatsBox.lastState = displayStatsBox.checked;
	}
	
	
	if(videoGrabbing.hasAnimation){
		videoGrabbing.animate();	
	}
	
	
	//////////////////////////////////////////////////////////////////////////////////
	//		Get video source
	//////////////////////////////////////////////////////////////////////////////////
	// process the image source with the marker recognition
		
	//getRealWorldImage({source:"picture"}); //source: camera, picture, video
	var domElement	= videoGrabbing.domElement;
	if(useBinocularityCheckbox.checked){
		domElement.binocularMode();
	}else{
		domElement.normalMode();
	}
	var imageData = jsArucoMarker.getImageData(domElement);//rather an input class
	
	if(imageData==null)return;
	
	//////////////////////////////////////////////////////////////////////////////////
	//		Get Markers / Process video source to find markers
	//////////////////////////////////////////////////////////////////////////////////
	
	var markers = [];
	if(detectMarkersEnabledCheckbox.checked){
	
		jsArucoMarker.videoScaleDown = scaleDownSelection.value;
		
		detectMarkersStats.begin();
		if(imageData){
			markers	= jsArucoMarker.detectMarkers(imageData);
		}
		detectMarkersStats.end();
		
		
		//???jsArucoMarker.smoothMarker = smoothMarkerBox.checked;???
		//Debugging and Merging
		
		//Adding merged Marker
		if(mergeMarkersBox.checked){markerHandler.addMergeMarker(markers);}
		
		jsArucoMarker.debugMarkers(markerDebugEnabledCheckbox.checked, imageData, markers);
		
		// Remove others, just keep last
		if(mergeMarkersBox.checked && markers.length>0){ markers = [markers[markers.length-1]];}	
	}
	

    //////////////////////////////////////////////////////////////////////////////////
	// get3DPosition(); // translate marker, convert into posiiton and rotation
	//////////////////////////////////////////////////////////////////////////////////
    
		
	jsArucoMarker.mergeTranslation = mergeTranslationBox.checked;
	jsArucoMarker.mergeRotation = mergeRotationBox.checked;
	
	var convertedMarkers = jsArucoMarker.convertMarkers(markers);
	
	//Smoothing
	if(convertedMarkers!=null){
		//translation part
		newTranlation = new THREE.Vector3().fromArray(convertedMarkers.translation);
		if(smoothTranslationBox.checked){
			if(lastTranslation){
				var distance = lastTranslation.distanceTo(newTranlation);
				if(distance>1)distance=0.9;
				if(transSmoothRate.value!="dynamic")distance = transSmoothRate.value;
				newTranlation = lastTranslation.lerp(newTranlation, distance);
			}
			lastTranslation = newTranlation.clone();

			convertedMarkers.translation = newTranlation.toArray();
		}
		//rotation part  Representation???
		if(smoothRotationBox.checked){
			newRotation1 = new THREE.Vector3().fromArray(convertedMarkers.rotation[0]);
			newRotation2 = new THREE.Vector3().fromArray(convertedMarkers.rotation[1]);
			newRotation3 = new THREE.Vector3().fromArray(convertedMarkers.rotation[2]);
			if(lastRotation1){
				newRotation1 = lastRotation1.lerp(newRotation1, 0.2);
				newRotation2 = lastRotation2.lerp(newRotation2, 0.2);
				newRotation3 = lastRotation3.lerp(newRotation3, 0.2);
			}
			lastRotation1 = newRotation1.clone();
			lastRotation2 = newRotation2.clone();
			lastRotation3 = newRotation3.clone();

			convertedMarkers.rotation[0] = newRotation1.toArray();
			convertedMarkers.rotation[1] = newRotation2.toArray();
			convertedMarkers.rotation[2] = newRotation3.toArray();
		}
	}
	
    
    //////////////////////////////////////////////////////////////////////////////////
	// get3DElements / apply it to the 3d object  
	//////////////////////////////////////////////////////////////////////////////////
  
	if(markerToObject3DEnabledCheckbox.checked && convertedMarkers!=null){
		vC.setActiveObject(activeObjectNameSelection.value);
		var rotation = convertedMarkers.rotation;
		var translation = convertedMarkers.translation;
		
		/*
		object3d.scale.x = this.modelSize;
		object3d.scale.y = this.modelSize;
		object3d.scale.z = this.modelSize;
		*/
		if(applyRotationBox.checked){
			if(true){
				markerObject3D.rotation.x = -Math.asin(-rotation[1][2]);
				markerObject3D.rotation.y = -Math.atan2(rotation[0][2], rotation[2][2]);
				markerObject3D.rotation.z =  Math.atan2(rotation[1][0], rotation[1][1]);
			}else{ // use rotation matrix and maybe quaternions;
				
			}
		}
		
		if(applyTranslationBox.checked){
			markerObject3D.position.x =  newTranlation.x;
			markerObject3D.position.y =  newTranlation.y;
			markerObject3D.position.z = -newTranlation.z;
		}
		markerObject3D.visible = true;
		blankPhaseCount=0;
	}else{
		blankPhaseCount++;
		if(blankPhaseCount>5){
			markerObject3D.visible = false;
		}
	}

   
    
    //////////////////////////////////////////////////////////////////////////////////
	//		render the whole thing on the page   / //draw();  //merge();
	//////////////////////////////////////////////////////////////////////////////////
	
	// render the scene
    renderStats.begin();
	if( webglRenderEnabledCheckbox.checked === true ){
		
		//use window width and height
		var targetWidth = window.innerWidth;
		var targetHeight = window.innerHeight;
		
		targetWidth = videoGrabbing.domElement.offsetWidth;
		targetHeight = videoGrabbing.domElement.offsetHeight;
		

		// handle window resize
		if ( windowWidth != targetWidth || windowHeight != targetHeight ) {
				windowWidth=targetWidth;
				windowHeight=targetHeight;
				renderer.setSize ( windowWidth, windowHeight );
				//renderer.domElement.width = windowWidth;
				//renderer.domElement.height = targetHeight;
				
				console.log(targetWidth +" x "+targetHeight);
		}

		renderer.render({width:windowWidth,height:windowHeight,binocularity:useBinocularityCheckbox.checked});	
	}
	renderStats.end();
}