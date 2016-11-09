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



//////////////////////////////////////////////////////////////////////////////////
//	options to enabled/disable various parts
//////////////////////////////////////////////////////////////////////////////////	
var optionPanel = new OptionPanel();	
optionPanel.addTitle("OPTIONS");
var detectMarkersEnabledCheckbox = optionPanel.makeCheckbox({value:true, labelText:"detectMarkers",title:"to enable/disable marker detection in video"});
var markerToObject3DEnabledCheckbox = optionPanel.makeCheckbox({value:true, labelText:"markerToObject3D",title:"to enable/disable marker to object3d conversion"});
var webglRenderEnabledCheckbox = optionPanel.makeCheckbox({value:true, labelText:"webglRender",title:"to enable/disable webgl rendering"});
var markerDebugEnabledCheckbox = optionPanel.makeCheckbox({value:true, labelText:"marker debug",title:"to enable/disable marker debug"});
var useBinocularityCheckbox = optionPanel.makeCheckbox({value:false, labelText:"use binocular"});
var isPausedCheckbox = optionPanel.makeCheckbox({value:false, labelText:"pause renderLoop"});

var multiMarkesCheckbox = optionPanel.makeCheckbox({value:false, labelText:"multiMarkes"});

var activeObjectNameSelection = optionPanel.makeSelection({
			labelText:"Choose Object:",
			optionChildren:vC.getObjectsNameArray(),
			selectedIndex:"last",
});




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
	
	detectMarkersEnabledCheckbox.checked = false;
	
	optionPanel.addTitle("ANIMATION");
	videoGrabbing = new THREEx.Generated();
	videoGrabbing.xBox = optionPanel.makeCheckbox({value:false, labelText:"turn x"});
	videoGrabbing.yBox = optionPanel.makeCheckbox({value:false, labelText:"turn y"});
	videoGrabbing.zBox = optionPanel.makeCheckbox({value:false, labelText:"turn z"});
	
	videoGrabbing.draw2Box = optionPanel.makeCheckbox({value:true, labelText:"draw 2"});
	videoGrabbing.identically = optionPanel.makeCheckbox({value:true, labelText:"identically"});
	
	videoGrabbing.reset = optionPanel.makeCheckbox({value:false, labelText:"reset"});
	
	jsArucoMarker.videoScaleDown = 4;
}else if( location.hash === '#video' ){
	videoGrabbing = new THREEx.VideoGrabbing();
	jsArucoMarker.videoScaleDown = 2;
}else if( location.hash === '#webcam' ){
	videoGrabbing = new THREEx.WebcamGrabbing();
	jsArucoMarker.videoScaleDown = 2;
}else if( location.hash === '#image' ){
	videoGrabbing = new THREEx.ImageGrabbing();
	jsArucoMarker.videoScaleDown = 10;
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



function renderingLoop(){
	
	if(videoGrabbing.hasAnimation){
		videoGrabbing.animate();	
	}
	
	
	//////////////////////////////////////////////////////////////////////////////////
	//		Process video source to find markers
	//////////////////////////////////////////////////////////////////////////////////
	// process the image source with the marker recognition
	// (set the markerObject3D as visible???? is a comment from last programmer)
    if( detectMarkersEnabledCheckbox.checked === false )	return;
		
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
	
	if( markerToObject3DEnabledCheckbox.checked === false )	return;
	markerObject3D.visible = false;

	
	vC.setActiveObject(activeObjectNameSelection.value);
	
	// see if this.markerId has been found
	markers.forEach(function(marker){
		// if( marker.id !== 265 )	return
		
		jsArucoMarker.markerToObject3D(marker, markerObject3D);

		markerObject3D.visible = true;
	});

    
    //getRealWorldImage({source:"picture"}); //source: camera, picture, video
    
    //get3DPosition();
    
        
    
    //get3DElements();
    
    //merge();
    
    //draw();
    
    //////////////////////////////////////////////////////////////////////////////////
	//		render the whole thing on the page
	//////////////////////////////////////////////////////////////////////////////////
    var windowWidth;
	var windowHeight;
	
	
	// render the scene
    renderStats.begin();
	if( webglRenderEnabledCheckbox.checked === true ){
		
		//use window width and height
		var targetWidth = window.innerWidth;
		var targetHeight = window.innerHeight;
		
		targetWidth = videoGrabbing.domElement.offsetWidth;
		targetHeight = videoGrabbing.domElement.offsetHeight;
		
		console.log(targetWidth +" x "+targetHeight);
		
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
		renderer.render({width:windowWidth,height:windowHeight,binocularity:useBinocularityCheckbox.checked});	
	}
	renderStats.end();
}