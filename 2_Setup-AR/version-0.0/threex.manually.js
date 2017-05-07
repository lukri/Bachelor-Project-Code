/*global THREE, MarkerGenerator*/

var THREEx = THREEx || {}

THREEx.Manually = function(){
    var rendererNew = new THREE.WebGLRenderer({
		antialias	: true,
		alpha		: true,
    });
    rendererNew.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( rendererNew.domElement );
    
    var domElement = rendererNew.domElement;
	this.domElement = domElement;
	
	
	var debugBox = document.createElement('div');
	/*global optionPanel*///defined in ini
	optionPanel.openGroup({title:"Debug Points", checked:true});
	optionPanel.appendCompleteDomElement(debugBox); 
	optionPanel.closeGroup();

	var debugTable = document.createElement('table');
	debugBox.appendChild(debugTable);
	var cornerDoms = [];
	for (var i = 0; i < 5; i++) {
	    var corner = document.createElement('div');
	    corner.style.position = "absolute";
	    corner.style.background = "red";
	    corner.style.width = "10px";
	    corner.style.height = "10px";
	    corner.style.cursor = "pointer"
	    corner.style.zIndex = 100000;
	    
	    corner.innerHTML = i;
	    
	
	    if(i==0){
	    	corner.style.top = "100px";
	    	corner.style.left = "100px";
	    }
	    if(i==1){
	    	corner.style.top = "100px";
	    	corner.style.left = "200px";
	    }
	    if(i==2){
	    	corner.style.top = "200px";
	    	corner.style.left = "200px";
	    }
	    if(i==3){
	    	corner.style.top = "200px";
	    	corner.style.left = "100px";
	    }
	    
	    if(i==4){
	    	corner.style.top = "150px";
	    	corner.style.left = "150px";
	    	corner.className = "center"
	    	
	    	corner.addEventListener('dragstart', function(event){
				lastRefX = parseInt(event.target.style.left);
				lastRefY = parseInt(event.target.style.top);
			});
			
			corner.addEventListener('drag', function(event){
				for (var i = 0; i<4; i++ ) {
					cornerDoms[i].style.left = (parseInt(cornerDoms[i].style.left)+(parseInt(event.target.style.left)-lastRefX)) + "px";
					cornerDoms[i].style.top = (parseInt(cornerDoms[i].style.top)+(parseInt(event.target.style.top)-lastRefY)) + "px";
					event.target.updateDebug(cornerDoms[i]);
				}
				lastRefX = parseInt(event.target.style.left);
				lastRefY = parseInt(event.target.style.top);
			});
			
			
			corner.addEventListener('dragend', function(event){
				cornerDoms[4].style.top = parseInt((parseInt(cornerDoms[0].style.top)
											+parseInt(cornerDoms[1].style.top)
											+parseInt(cornerDoms[2].style.top)
											+parseInt(cornerDoms[3].style.top))/4) + "px";
				cornerDoms[4].style.left = parseInt((parseInt(cornerDoms[0].style.left)
											+parseInt(cornerDoms[1].style.left)
											+parseInt(cornerDoms[2].style.left)
											+parseInt(cornerDoms[3].style.left))/4) + "px";
				for (var i = 0; i<4; i++ ) {
					cornerDoms[i].style.left = parseInt(cornerDoms[i].style.left)+(parseInt(event.target.style.left)-lastRefX) + "px";
					cornerDoms[i].style.top = parseInt(cornerDoms[i].style.top)+(parseInt(event.target.style.top)-lastRefY) + "px";
					event.target.updateDebug(cornerDoms[i]);
				}
				event.target.updateDebug(event.target);
			});
	    	
	    }
	    
	    var lastRefX = 0;
	    var lastRefY = 0;
	    
	    
	    
	    corner.addEventListener('drag', function(event){
			event.target.style.top = event.y+"px";
			event.target.style.left = event.x+"px";
			event.target.updateDebug(event.target);
		});
		
		if(i!=4){
			corner.addEventListener('dragend', function(event){
				event.target.style.top = event.y+"px";
				event.target.style.left = event.x+"px";
				
				cornerDoms[4].style.top = parseInt((parseInt(cornerDoms[0].style.top)
											+parseInt(cornerDoms[1].style.top)
											+parseInt(cornerDoms[2].style.top)
											+parseInt(cornerDoms[3].style.top))/4) + "px";
				cornerDoms[4].style.left = parseInt((parseInt(cornerDoms[0].style.left)
											+parseInt(cornerDoms[1].style.left)
											+parseInt(cornerDoms[2].style.left)
											+parseInt(cornerDoms[3].style.left))/4) + "px";
				event.target.updateDebug(event.target);
				event.target.updateDebug(cornerDoms[4]);
			});
		}
		
		corner.setAttribute('draggable',true);
	   
	    
	    
	    cornerDoms[i] = corner;
	    document.body.appendChild(corner);
	    
	    var debugRow = document.createElement('tr');
	    debugTable.appendChild(debugRow);
	    var debugICell = document.createElement('td');
	    debugICell.innerHTML = i;
	    debugRow.appendChild(debugICell);
	    corner.xCell = document.createElement('td');
	    corner.xCell.innerHTML = corner.style.left;
	    debugRow.appendChild(corner.xCell);
	    corner.yCell = document.createElement('td');
	    corner.yCell.innerHTML = corner.style.top;
	    debugRow.appendChild(corner.yCell);
	    
	    corner.updateDebug = function(corner){
		    corner.xCell.innerHTML = corner.style.left;
		    corner.yCell.innerHTML = corner.style.top;
	    };
	    
	}
	
	
	
	domElement.binocularMode = function(){
		//domElement.style.left = '25%';	
	};
	domElement.normalMode = function(){
		//domElement.style.left = '50%';	
	};
	
	this.hasFakeMarkers = true;
	this.getFakeMarkers = function(){
	    return [{
	        id:"fm",
	        corners:[
	            {x:parseInt(cornerDoms[0].style.left)+5, y:parseInt(cornerDoms[0].style.top)+5},
	            {x:parseInt(cornerDoms[1].style.left)+5, y:parseInt(cornerDoms[1].style.top)+5},
	            {x:parseInt(cornerDoms[2].style.left)+5, y:parseInt(cornerDoms[2].style.top)+5},
	            {x:parseInt(cornerDoms[3].style.left)+5, y:parseInt(cornerDoms[3].style.top)+5},
            ]
        }];
	};
	
	
	
};
