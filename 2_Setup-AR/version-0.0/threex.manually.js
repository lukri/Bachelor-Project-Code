/*global THREE, MarkerGenerator*/

var THREEx = THREEx || {}

THREEx.Manually = function(){
    var domElement	= document.createElement('img');
	domElement.src	= 'images/IMG_20150606_200552-small.jpg';
	this.domElement = domElement;
	
	
	domElement.binocularMode = function(){
		//domElement.style.left = '25%';	
	};
	domElement.normalMode = function(){
		//domElement.style.left = '50%';	
	};
	
	this.hasFakeMarkers = true;
	this.getFakeMarkers = function(){
	    return [{
	        id:001,
	        corners:[
	            {x:10, y:10},
	            {x:200, y:10},
	            {x:10, y:200},
	            {x:200, y:200},
            ]
        }];
	};
	
	
	
};
