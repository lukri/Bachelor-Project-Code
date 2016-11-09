var CompatibilityTester = function() {
    //////////////////////////////////////////////////////////////////////////////////
	//		Test if the browser support WebGL and getUserMedia
	//////////////////////////////////////////////////////////////////////////////////
    this.test = function(){
   		var isCompatible = true;
   		// TODO backport those 2 in Detector.js
		var hasGetUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia) ? true : false
		var hasMediaStreamTrackSources = MediaStreamTrack.getSources ? true : false
		var hasWebGL = ( function () { try { var canvas = document.createElement( 'canvas' ); return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) ); } catch ( e ) { return false; } } )()
		
		if( hasWebGL === false ){
			isCompatible = false;
			alert('your browser doesn\'t support navigator.getUserMedia()')			
		}
		if( hasMediaStreamTrackSources === false ){
			isCompatible = false;
			alert('your browser doesn\'t support MediaStreamTrack.getSources()')			
		}
		if( hasGetUserMedia === false ){
			isCompatible = false;
			alert('your browser doesn\'t support navigator.getUserMedia()')		
		}
        return isCompatible;
    }
}