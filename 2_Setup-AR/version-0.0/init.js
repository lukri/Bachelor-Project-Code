/*global THREE,THREEx, CompatibilityTester, Renderer, OptionPanel, VirtualContainer, Stats, location, MarkerHandler*/


var compatibilityTester = new CompatibilityTester();


compatibilityTester.test();

//////////////////////////////////////////////////////////////////////////////////
//		some helpers
//////////////////////////////////////////////////////////////////////////////////

function radToDeg(rad) {
	var deg = rad / Math.PI * 180;
	deg = Math.round(deg);
	return deg;
}



//////////////////////////////////////////////////////////////////////////////////
//		make fullscreen possible
//////////////////////////////////////////////////////////////////////////////////

function toggleFullScreen() {
	if (!document.fullscreenElement && // alternative standard method
		!document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
		if (document.documentElement.requestFullscreen) {
			document.documentElement.requestFullscreen();
		}
		else if (document.documentElement.msRequestFullscreen) {
			document.documentElement.msRequestFullscreen();
		}
		else if (document.documentElement.mozRequestFullScreen) {
			document.documentElement.mozRequestFullScreen();
		}
		else if (document.documentElement.webkitRequestFullscreen) {
			document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}

		optionPanel.hidePanel();

	}
	else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		}
		else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
		else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		}
		else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
		optionPanel.showPanel();
	}
}




//////////////////////////////////////////////////////////////////////////////////
//		init Stats for detectMarkers
//////////////////////////////////////////////////////////////////////////////////
var detectMarkersStats = new Stats(); //is a three.js lib
detectMarkersStats.setMode(1);
document.body.appendChild(detectMarkersStats.domElement);
detectMarkersStats.domElement.style.position = 'absolute';
detectMarkersStats.domElement.style.bottom = '0px';
detectMarkersStats.domElement.style.left = '0px';


var renderStats = new Stats();
renderStats.setMode(0);
document.body.appendChild(renderStats.domElement);
renderStats.domElement.style.position = 'absolute';
renderStats.domElement.style.bottom = '0px';
renderStats.domElement.style.right = '0px';

//////////////////////////////////////////////////////////////////////////////////
//		Handle ui button
//////////////////////////////////////////////////////////////////////////////////
var uiButtons = document.getElementById('info').getElementsByTagName('a');
for (var i = 0; i < uiButtons.length; i++) {
	uiButtons[i].addEventListener('click', function(event) {
		location.hash = '#' + event.target.className;
		location.reload();
	});
}




var renderer = new Renderer();
var scene = renderer.scene;


var vC = new VirtualContainer();

//////////////////////////////////////////////////////////////////////////////////
//		create a markerObject3D
//////////////////////////////////////////////////////////////////////////////////
var markerObject3D = vC.getObject();
markerObject3D.visible = false;
scene.add(markerObject3D);

markerObject3D.scale.x = 75;
markerObject3D.scale.y = 75;
markerObject3D.scale.z = 75;



//////////////////////////////////////////////////////////////////////////////////
//	options to enabled/disable various parts
//////////////////////////////////////////////////////////////////////////////////	
var optionPanel = new OptionPanel();
//optionPanel.addTitle("OPTIONS");

optionPanel.openGroup({
	title: "OPTIONS",
	checked: false
});
var detectMarkersEnabledCheckbox = optionPanel.makeCheckbox({
	value: true,
	labelText: "detectMarkers",
	title: "to enable/disable marker detection in video"
});
var markerToObject3DEnabledCheckbox = optionPanel.makeCheckbox({
	value: true,
	labelText: "markerToObject3D",
	title: "to enable/disable marker to object3d conversion"
});
var webglRenderEnabledCheckbox = optionPanel.makeCheckbox({
	value: true,
	labelText: "webglRender",
	title: "to enable/disable webgl rendering"
});
var markerDebugEnabledCheckbox = optionPanel.makeCheckbox({
	value: true,
	labelText: "marker debug",
	title: "to enable/disable marker debug"
});
var useBinocularityCheckbox = optionPanel.makeCheckbox({
	value: false,
	labelText: "use binocular"
});
var displayStatsBox = optionPanel.makeCheckbox({
	value: true,
	labelText: "displayStats"
});
optionPanel.closeGroup();

optionPanel.openGroup({
	title: "Mergin",
	checked: false
});
var mergeMarkersBox = optionPanel.makeCheckbox({
	value: false,
	labelText: "merge Markers"
});
var mergeTranslationBox = optionPanel.makeCheckbox({
	value: false,
	labelText: "merge Translation"
});
var mergeRotationBox = optionPanel.makeCheckbox({
	value: false,
	labelText: "merge Rotation"
});
optionPanel.closeGroup();

optionPanel.openGroup({
	title: "Smoothing",
	checked: false
});
var smoothMarkerBox = optionPanel.makeCheckbox({
	value: false,
	labelText: "smooth Markers",
	disabled: true
});
var smoothTranslationBox = optionPanel.makeCheckbox({
	value: false,
	labelText: "smooth Translation",
	disabled: false
});
var transSmoothRate = optionPanel.makeSelection({
	labelText: "translation rate:",
	optionChildren: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, "dynamic"],
	selectedIndex: "dynamic",
});
var smoothRotationMatBox = optionPanel.makeCheckbox({
	value: false,
	labelText: "smooth Rot Mat",
	disabled: false
});
var smoothRotationVecBox = optionPanel.makeCheckbox({
	value: false,
	labelText: "smooth Rot Vec",
	disabled: false
});
var altRotBox = optionPanel.makeCheckbox({
	value: false,
	labelText: "alternative Rotion"
})
var debugRotationBox = optionPanel.makeCheckbox({
	value: false,
	labelText: "debug Rotion"
})
optionPanel.closeGroup();


optionPanel.openGroup({
	title: "Applying",
	checked: true
});
var applyTranslationBox = optionPanel.makeCheckbox({
	value: true,
	labelText: "apply Translation"
});
var applyRotationBox = optionPanel.makeCheckbox({
	value: true,
	labelText: "apply Rotation"
});
optionPanel.closeGroup();

optionPanel.openGroup({
	title: "",
	checked: true
});

var activeObjectNameSelection = optionPanel.makeSelection({
	labelText: "Choose Object:",
	optionChildren: vC.getObjectsNameArray(),
	selectedIndex: "none",
});

var scaleDownSelection = optionPanel.makeSelection({
	labelText: "image Scale Down:",
	optionChildren: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
	selectedIndex: 1,
});

var isPausedCheckbox = optionPanel.makeCheckbox({
	value: false,
	labelText: "pause renderLoop"
});
optionPanel.closeGroup();



//////////////////////////////////////////////////////////////////////////////////
//		init the Augmented Reality part
//////////////////////////////////////////////////////////////////////////////////


// init the marker recognition
var jsArucoMarker = new THREEx.JsArucoMarker();
// if no specific image source is specified, take the image by default
if (location.hash === '') location.hash = '#image';

// init the image source grabbing 
var videoGrabbing;
if (location.hash === '#manually') {
	detectMarkersEnabledCheckbox.checked = false;
	videoGrabbing = new THREEx.Manually();
	scaleDownSelection.setSelectionByValue(1);

}
else if (location.hash === '#generated') {

	//detectMarkersEnabledCheckbox.checked = false;
	optionPanel.openGroup({
		title: "ANIMATION",
		checked: true
	});
	videoGrabbing = new THREEx.Generated();
	videoGrabbing.xBox = optionPanel.makeCheckbox({
		value: false,
		labelText: "turn x"
	});
	videoGrabbing.yBox = optionPanel.makeCheckbox({
		value: false,
		labelText: "turn y"
	});
	videoGrabbing.zBox = optionPanel.makeCheckbox({
		value: false,
		labelText: "turn z"
	});

	videoGrabbing.draw2Box = optionPanel.makeCheckbox({
		value: false,
		labelText: "draw 2"
	});
	videoGrabbing.identically = optionPanel.makeCheckbox({
		value: true,
		labelText: "identically"
	});

	videoGrabbing.useTextureBox = optionPanel.makeCheckbox({
		value: false,
		labelText: "use texture"
	});

	videoGrabbing.reset = optionPanel.makeCheckbox({
		value: false,
		labelText: "reset"
	});

	videoGrabbing.trackballActivationBox = optionPanel.makeCheckbox({
		value: false,
		labelText: "trackball active"
	});

	videoGrabbing.showRotBox = optionPanel.makeCheckbox({
		value: false,
		labelText: "show rot"
	});

	optionPanel.closeGroup();
	scaleDownSelection.setSelectionByValue(3);

}
else if (location.hash === '#video') {
	videoGrabbing = new THREEx.VideoGrabbing();
	scaleDownSelection.setSelectionByValue(2);
}
else if (location.hash === '#webcam') {
	videoGrabbing = new THREEx.WebcamGrabbing();
	scaleDownSelection.setSelectionByValue(2);
}
else if (location.hash === '#image') {
	videoGrabbing = new THREEx.ImageGrabbing();
	scaleDownSelection.setSelectionByValue(10);
}
else if (location.hash === '#mobiletest') {
	videoGrabbing = new THREEx.WebcamGrabbing();
	scaleDownSelection.setSelectionByValue(2);

	document.getElementById('fullscreenDom').style.display = "block";
	markerDebugEnabledCheckbox.checked = false;
	displayStatsBox.checked = false;
	document.getElementById('info').style.display = "none";
	activeObjectNameSelection.setSelectionByValue("tree");

	smoothRotationMatBox.checked = true;
	smoothTranslationBox.checked = true;


}
else {
	console.assert(false, "no mapping hash");
}


// attach the videoGrabbing.domElement to the body
document.body.appendChild(videoGrabbing.domElement);
