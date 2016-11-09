/*global HTMLVideoElement,HTMLImageElement,HTMLCanvasElement*/
var THREEx = THREEx || {};

/**
 * Handle jsaruco markers
 * @constructor
 */
THREEx.JsArucoMarker = function(){
	var _this = this;

	this.debugEnabled = false;
	this.videoScaleDown = 2;
	this.modelSize = 35.0; // millimeter

	var canvasElement = document.createElement('canvas');
	var context = canvasElement.getContext("2d");

	// create debug element
	var debugElement	= document.createElement('div');
	debugElement.appendChild(canvasElement);
	debugElement.style.position = 'absolute';
	debugElement.style.top = '0px';
	debugElement.style.left = '0px';
	debugElement.style.opacity = 1; //0.2
	
	var debugInfoElement	= document.createElement('div');
	debugElement.appendChild( debugInfoElement );
	debugInfoElement.classList.add('info');
	debugInfoElement.innerHTML = ''
		+ '<div>canvasSize: <span class="canvasSize">n/a</span></div>'
		+ '<div>videoScaleDown: <span class="videoScaleDown">n/a</span></div>'
		+ '<div>videoSize: <span class="videoSize">n/a</span></div>';
	
	/**
	 * Detect Marker in a videoElement or imageElement
	 *
	 * @param {HTMLVideoElement|HTMLImageElement} videoElement - the source element
	 * @return {Object[]} - array of found markers
	 */
	this.detectMarkers	= function(videoElement){
		// if domElement is a video
		var width, height;
		if( videoElement instanceof HTMLVideoElement ){
			// if no new image for videoElement do nothing
			if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA){
				return [];
			}
			width = videoElement.videoWidth;
			height = videoElement.videoHeight;
		// if domElement is a image
		}else if( videoElement instanceof HTMLImageElement ){
			if( videoElement.naturalWidth === 0 ){
				return [];
			}
			width = videoElement.naturalWidth;
			height = videoElement.naturalHeight;
		}else if(videoElement instanceof HTMLCanvasElement ){
			width = videoElement.width;
			height = videoElement.height;
		}else {
			console.assert(false, "input type is not handeld");
			return [];
		}

		canvasElement.width = width/_this.videoScaleDown;
		canvasElement.height = height/_this.videoScaleDown;	


		// get imageData from videoElement
		context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
		var imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);

		// detect markers
		var detector = new AR.Detector();
		var markers = detector.detect(imageData);

		//////////////////////////////////////////////////////////////////////////////////
		//		update debug
		//////////////////////////////////////////////////////////////////////////////////

		// TODO put that in a special class ?

		var debugAttached = debugElement.parentNode !== null ? true : false;

		if( this.debugEnabled === true && debugAttached === false ){
			document.body.appendChild(debugElement);
		}

		if( this.debugEnabled === false && debugAttached === true ){
			debugElement.parentNode.removeChild( debugElement );
		}

		// display markers on canvas for debug
		if( this.debugEnabled === true ){
			debugElement.querySelector('.info .canvasSize').innerHTML = canvasElement.width + 'x' + canvasElement.height;
			debugElement.querySelector('.info .videoScaleDown').innerHTML = this.videoScaleDown;
			debugElement.querySelector('.info .videoSize').innerHTML = width + 'x' + height;				
			drawDebug(markers, canvasElement);
		}

		//////////////////////////////////////////////////////////////////////////////////
		//		TO COMMENT
		//////////////////////////////////////////////////////////////////////////////////

		// return the result
		return markers
	}


	//homography transformation
	//perspective rendering

	/**
	 * convert a jsaruco marker to a THREE.Object3D
	 *
	 * @param {Object[]} marker   - a found marker
	 * @param {THREE.Object3D} object3d - the object3d to move
	 */
	var blankPhaseCount = 0;
	this.markerToObject3D = function(markers, object3d){
		// convert corners coordinate - not sure why
		
		//console.log(markers.length);
		
		if(!markers.length>0){
			blankPhaseCount++;
			//console.log("no markers found, blindPhase");
			if(blankPhaseCount>5)object3d.visible = false;
			return;
		}
		blankPhaseCount=0;
		object3d.visible = true;
		
		
		var marker = markers[0];
		var corners = [];//marker.corners;
		for (var i = 0; i < marker.corners.length; ++ i){
			corners.push({
				x : marker.corners[i].x - (canvasElement.width / 2),
				y : (canvasElement.height / 2) - marker.corners[i].y,
			});
		}
		// compute the pose from the canvas
		var posit = new POS.Posit(this.modelSize, canvasElement.width);
		var pose = posit.pose(corners);
		// console.assert(pose !== null)
		if( pose === null )	return;

		//console.log(pose);

		//////////////////////////////////////////////////////////////////////////////////
		//		Translate pose to THREE.Object3D
		//////////////////////////////////////////////////////////////////////////////////
		var rotation = pose.bestRotation;
		console.log(rotation);
		var translation = pose.bestTranslation;
		
		/*
		object3d.scale.x = this.modelSize;
		object3d.scale.y = this.modelSize;
		object3d.scale.z = this.modelSize;
		*/
		//object3d.rotation.x = -Math.asin(-rotation[1][2]);
		object3d.rotation.y = -Math.atan2(rotation[0][2], rotation[2][2]);
		//object3d.rotation.z =  Math.atan2(rotation[1][0], rotation[1][1]);
		
		var asdlkfj=0;
		if(asdlkfj==0){
			asdlkfj++;
			object3d.position.x =  translation[0];
			object3d.position.y =  translation[1];
			object3d.position.z = -translation[2];
		}
		
	};

	return;

	//////////////////////////////////////////////////////////////////////////////////
	//		Comments
	//////////////////////////////////////////////////////////////////////////////////

	/**
	* draw corners on a canvas - useful to debug
	*
	* @param {Object[]} markers - array of found markers
	*/
	function drawDebug(markers, canvasElement){
		var context = canvasElement.getContext("2d");
		context.lineWidth = 3;

		for (var i = 0; i < markers.length; ++ i){
			var marker = markers[i]
			var corners = marker.corners;

			context.strokeStyle = "red";
			context.beginPath();

			for (var j = 0; j < corners.length; ++ j){
				var corner = corners[j];
				context.moveTo(corner.x, corner.y);
				corner = corners[(j + 1) % corners.length];
				context.lineTo(corner.x, corner.y);
			}

			context.stroke();
			context.closePath();

			context.strokeStyle = "green";
			context.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
			// console.log('marker', marker.id)

			context.fillStyle = "blue";
			context.font = "bold 10px Arial";
			context.fillText("id: "+marker.id, corners[0].x, corners[0].y);
		}
	};
}
