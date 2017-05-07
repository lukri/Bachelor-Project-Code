/*global THREE,THREEx, CompatibilityTester, Renderer, OptionPanel, VirtualContainer, Stats, location, MarkerHandler*/

//the init part is invoked automatically when loaded

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
var lastTranslation, newTranlation, 
lastRotVec, newRotVec = new THREE.Vector3(),
lastRotation1,lastRotation2,lastRotation3, newRotation1,newRotation2,newRotation3;


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
	
	jsArucoMarker.videoScaleDown = scaleDownSelection.value;
	var markers = [];
	if(detectMarkersEnabledCheckbox.checked){
		detectMarkersStats.begin();
		if(imageData){
			markers	= jsArucoMarker.detectMarkers(imageData);
		}
		detectMarkersStats.end();
	}
		
	if(videoGrabbing.hasFakeMarkers)
		markers = videoGrabbing.getFakeMarkers();
	
	
	if(markers.length>0){	
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
    
	jsArucoMarker.useAlternativeRotation = altRotBox.checked;
		
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
		if(smoothRotationMatBox.checked){
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
		
		var rotation = convertedMarkers.rotation;
		newRotVec.x = -Math.asin(-rotation[1][2]);
		newRotVec.y = -Math.atan2(rotation[0][2], rotation[2][2]);
		newRotVec.z =  Math.atan2(rotation[1][0], rotation[1][1]);
		
		
		
		if(smoothRotationVecBox.checked){
			if(lastRotVec){
				newRotVec = lastRotVec.lerp(newRotVec, 0.2);
			}
			lastRotVec = newRotVec.clone();
		}
		
		
		if(debugRotationBox.checked)
			console.log("%c rot.x "+radToDeg(newRotVec.x)+" y "+radToDeg(newRotVec.y)+" z "+radToDeg(newRotVec.z), 'color: #ff5555');
	}
	
    
    //////////////////////////////////////////////////////////////////////////////////
	// get3DElements / apply it to the 3d object  
	//////////////////////////////////////////////////////////////////////////////////
  
	if(markerToObject3DEnabledCheckbox.checked && convertedMarkers!=null){
		vC.setActiveObject(activeObjectNameSelection.value);
		var translation = convertedMarkers.translation;
		
		/*
		object3d.scale.x = this.modelSize;
		object3d.scale.y = this.modelSize;
		object3d.scale.z = this.modelSize;
		*/
		if(applyRotationBox.checked){
			if(true){
				markerObject3D.rotation.x = newRotVec.x;
				markerObject3D.rotation.y = newRotVec.y;
				markerObject3D.rotation.z = newRotVec.z;
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