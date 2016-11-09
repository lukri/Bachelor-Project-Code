/*global THREE*/

var MarkerHandler = function(options){
    
    this.addMergeMarker = function(markers){
        
        if(!(markers.length>0))return;
        
        var mergedMarker = {};
		mergedMarker.id = "merged";
		mergedMarker.strokeStyle = "green";
		mergedMarker.corners=[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}];
		var mmc = mergedMarker.corners;
		if(markers.length>0){
			for(var i=0;i<4;i++){
					mmc[i].x = markers[0].corners[i].x;
					mmc[i].y = markers[0].corners[i].y;
			}
		}
		//mergedMarker = merge(markers, mergedMarker);
		
		for(var m in markers){
			var mc = markers[m].corners;
			for(var i=0;i<4;i++){
				mmc[i].x = (mc[i].x-mmc[i].x)/2+mmc[i].x;
				mmc[i].y = (mc[i].y-mmc[i].y)/2+mmc[i].y;
			}
		}
		// return the result
		//if(this.mergeMarkers&&(markers.length>0))markers=[mergedMarker];   
        markers.push(mergedMarker);		
		//return markers;
    };
    
};