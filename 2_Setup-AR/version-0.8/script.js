/*global THREE,THREEx, CompatibilityTester, Renderer, OptionPanel, VirtualContainer, Stats, location*/


var compatibilityTester = new CompatibilityTester();


compatibilityTester.test();


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
optionPanel.closeGroup();

optionPanel.openGroup({title:"Mergin"});
var mergeMarkersBox = optionPanel.makeCheckbox({value:false, labelText:"merge Markers"});
var mergeTranslationBox = optionPanel.makeCheckbox({value:false, labelText:"merge Translation"});
var mergeRotationBox = optionPanel.makeCheckbox({value:false, labelText:"merge Rotation"});
optionPanel.closeGroup();

optionPanel.openGroup({title:"Smoothing", checked:true});
var smoothMarkerBox = optionPanel.makeCheckbox({value:false, labelText:"smooth Markers", disabled:true});
var smoothTranslationBox = optionPanel.makeCheckbox({value:false, labelText:"smooth Translation", disabled:true});
var smoothRotationBox = optionPanel.makeCheckbox({value:false, labelText:"smooth Rotation", disabled:true});
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
	videoGrabbing.identically = optionPanel.makeCheckbox({value:false, labelText:"identically"});
	
	videoGrabbing.useTextureBox = optionPanel.makeCheckbox({value:false, labelText:"use texture"});
	
	videoGrabbing.reset = optionPanel.makeCheckbox({value:false, labelText:"reset"});
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
	if(isPausedCheckbox.checked)return;
	renderingLoop();
});

var windowWidth=0;
var windowHeight=0;

function renderingLoop(){
	
	if(videoGrabbing.hasAnimation){
		videoGrabbing.animate();	
	}
	
	
	//////////////////////////////////////////////////////////////////////////////////
	//		Process video source to find markers
	//////////////////////////////////////////////////////////////////////////////////
	// process the image source with the marker recognition
		
	//getRealWorldImage({source:"picture"}); //source: camera, picture, video
	var domElement	= videoGrabbing.domElement;
	if(useBinocularityCheckbox.checked){
		domElement.binocularMode();
	}else{
		domElement.normalMode();
	}
	
	var markers = [];
	if(detectMarkersEnabledCheckbox.checked){
	
		var imageData = jsArucoMarker.getImageData(domElement);//rather an input class
	
		jsArucoMarker.videoScaleDown = scaleDownSelection.value;
		jsArucoMarker.debugEnabled = markerDebugEnabledCheckbox.checked;
		jsArucoMarker.mergeMarkers = mergeMarkersBox.checked;
		jsArucoMarker.mergeTranslation = mergeTranslationBox.checked;
		jsArucoMarker.mergeRotation = mergeRotationBox.checked;
		
		jsArucoMarker.smoothMarker = smoothMarkerBox.checked;
		jsArucoMarker.smoothTranslation = smoothTranslationBox.checked;
		jsArucoMarker.smoothRotation = smoothRotationBox.checked;
		
		jsArucoMarker.applyTranslation = applyTranslationBox.checked;
		jsArucoMarker.applyRotation = applyRotationBox.checked;
		
		
		detectMarkersStats.begin();
		if(imageData){
			markers	= jsArucoMarker.detectMarkers(imageData);
		}
		detectMarkersStats.end();
	}
	
	if(markerToObject3DEnabledCheckbox.checked){
		vC.setActiveObject(activeObjectNameSelection.value);
		//jsArucoMarker.multiMarkes = multiMarkesCheckbox.checked;
		jsArucoMarker.markerToObject3D(markers, markerObject3D);
	}

    
    //get3DPosition();
    
    //get3DElements();
    
    
    
    //draw();  //merge();
    
    //////////////////////////////////////////////////////////////////////////////////
	//		render the whole thing on the page
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