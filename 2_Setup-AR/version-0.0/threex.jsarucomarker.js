/*global HTMLVideoElement,HTMLImageElement,HTMLCanvasElement, AR*/
var THREEx = THREEx || {};

/**
 * Handle jsaruco markers
 * @constructor
 */
THREEx.JsArucoMarker = function(){
	var _this = this;

	this.debugEnabled = false;
	this.videoScaleDown = 2;
	this.modelSize = 75;//35.0; // millimeter

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
	
	
	this.getImageData = function(videoElement){
		// if domElement is a video
		var width, height;
		if( videoElement instanceof HTMLVideoElement ){
			// if no new image for videoElement do nothing
			if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA){
				return null;
			}
			width = videoElement.videoWidth;
			height = videoElement.videoHeight;
		// if domElement is a image
		}else if( videoElement instanceof HTMLImageElement ){
			if( videoElement.naturalWidth === 0 ){
				return null;
			}
			width = videoElement.naturalWidth;
			height = videoElement.naturalHeight;
		}else if(videoElement instanceof HTMLCanvasElement ){
			width = videoElement.width;
			height = videoElement.height;
		}else {
			console.assert(false, "input type is not handeld");
			return null;
		}

		canvasElement.width = width/_this.videoScaleDown;
		canvasElement.height = height/_this.videoScaleDown;	


		// get imageData from videoElement
		context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
		var imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);	
		imageData.orinalWidth = width;
		imageData.orinalHeight = height;
		return imageData;
	};
	

	this.detectMarkers	= function(imageData){
		// detect markers
		var detector = new AR.Detector();
		var markers = detector.detect(imageData);
		return markers;
	};



	this.convertMarkers = function(markers){
		
		if(!(markers.length>0))return null;
		
		var rotation;
		var rotations = [];
		var translation;
		var translations = [];
		
		
		for(var mI in markers){
			var marker = markers[mI];
			var corners = [];//marker.corners;
			
			
			// convert corners coordinate	
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
			if( pose === null )	return null;
	
			//console.log(pose);
	
			//////////////////////////////////////////////////////////////////////////////////
			//		Translate pose to THREE.Object3D
			//////////////////////////////////////////////////////////////////////////////////
			if(this.useAlternativeRotation){
				rotation = pose.alternativeRotation;
			}else{
				rotation = pose.bestRotation;
			}
			rotations.push(rotation);
			//console.log(rotation);
			translation = pose.bestTranslation;
			translations.push(translation);
		}
		
		
		if(this.mergeTranslation)translation = merge(translations);
		if(this.mergeRotation)rotation = merge(rotations);
		
		return {translation:translation, rotation:rotation};		
	};
	
	
	//////////////////////////////////////////////////////////////////////////////////
	//		Comments
	//////////////////////////////////////////////////////////////////////////////////
	
	this.debugMarkers = function(debugEnabled, imageData, markers){
		//////////////////////////////////////////////////////////////////////////////////
		//		update debug
		//////////////////////////////////////////////////////////////////////////////////
		var debugAttached = debugElement.parentNode !== null ? true : false;

		if( debugEnabled === true && debugAttached === false ){
			document.body.appendChild(debugElement);
		}

		if( debugEnabled === false && debugAttached === true ){
			debugElement.parentNode.removeChild( debugElement );
		}

		// display markers on canvas for debug
		if( debugEnabled === true ){
			debugElement.querySelector('.info .canvasSize').innerHTML = canvasElement.width + 'x' + canvasElement.height;
			debugElement.querySelector('.info .videoScaleDown').innerHTML = this.videoScaleDown;
			debugElement.querySelector('.info .videoSize').innerHTML = imageData.orinalWidth + 'x' + imageData.orinalHeight;				
			drawDebug(markers, canvasElement);
		}	
	};

	function drawDebug(markers, canvasElement, options){
		options = options || {};

		var context = canvasElement.getContext("2d");
		context.lineWidth = 3;

		for (var i = 0; i < markers.length; ++ i){
			var marker = markers[i];
			var corners = marker.corners;

			context.strokeStyle = marker.strokeStyle || "red";
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
	}
	
	
	function merge(mergArray, target, options){
		options = options || {};
		if(!mergArray.length>0)return null;
		if(mergArray.length==1)return mergArray[0];
		
		target = mergArray[0];
		
		for(var i in mergArray){
			var mai = mergArray[i];
			for(var key in target){
				if(target[key] instanceof Array){
					for(var key2 in target[key]){
						target[key][key2] += (mai[key][key2]-target[key][key2])/2;
					}	
				}else{
					target[key] += (mai[key]-target[key])/2;}
			}
		}
			
		return target;	
	}
};
