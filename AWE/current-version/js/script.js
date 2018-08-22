/*global awe, THREEx */
//DEBUG = true;

var globVars = {};
var globOpts = {};


globVars.marker = {};

//workoround to get device orientaion, since I struggeld to find the gyro api to access
//http://learningthreejs.com/blog/2011/09/20/lets-make-a-3D-game-device-orientation/
globVars.device = new THREEx.DeviceOrientationState();



function showOptionStart(){
  //https://developer.mozilla.org/de/docs/Web/API/Document/hasFocus
  if(document.hasFocus()){
    document.getElementById('buttons').style.display = "block";
  }  
}





//here are some global variable, which going to be used;
var idleRotQuat, deviceIdleQuat, markerQuat; 


//will be called, when all libraries are loaded
function setGlobalVariables(){
    var idleRot = new THREE.Euler(0,0,Math.PI, 'ZXY');
    idleRotQuat = new THREE.Quaternion().setFromEuler( idleRot ); 
    
    //Calibrate Device
    calibrateDevice();
    calibrateMarker(); 
    
    console.log(JSON.stringify(globOpts));
    
}

function calibrateDevice(){
    var deviceRot = new THREE.Euler( globVars.device.angleX(),globVars.device.angleY(),globVars.device.angleZ(), 'XYZ' );
    deviceIdleQuat = new THREE.Quaternion().setFromEuler ( deviceRot );
    deviceIdleQuat.inverse();
    console.log('deivce rotation calibrated');
}

function getDeviceQuat(options){
    options = options || {};
    var deviceRot = new THREE.Euler( globVars.device.angleX(),globVars.device.angleY(),globVars.device.angleZ(), 'XYZ' );
    var deviceQuat = new THREE.Quaternion().setFromEuler ( deviceRot );
    deviceQuat.multiply(deviceIdleQuat);
    if(options.doInvertQuat)
      deviceQuat.inverse();
    return deviceQuat;
}

function getDeviceEuler(){
    return new THREE.Euler().setFromQuaternion( getDeviceQuat() );  
}



function calibrateMarker(){
  var mesh = marker.get_mesh();
  markerQuat = mesh.getWorldQuaternion();
  markerQuat.inverse();
  console.log('marker rotation calibrated');
}



function r2d(rad){
  var deg = Math.round((rad/Math.PI*180)*100);
  deg = deg/100;
  return deg;
}
function round(n){
  return Math.round(n*100)/100;
}



var marker, markerPosition, board, ball, aim, crosshair, crosshairCenter, crosshairNeedle;


window.addEventListener('load', function() {
  //activate the start buttons
  showOptionStart();
  // document.getElementById('buttons').style.display = "block";
  // document.getElementById('startButton').disabled = false; 
  // document.getElementById('startButton2').disabled = false;
  
  globVars.marker.debugBox = document.getElementById('markerDebugBox');
  globVars.marker.debugBox.count = 0;
  globVars.device.debugBox = document.getElementById('deviceDebugBox');
});


//TODO Quelle toogleFullScreen: findend

var  toggleFullScreen = function() {
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
  }
};


var lastClickedElement = null;  



var startAWE = function(options){  
    options = options || {};
    
    
    if(options.createFromElement){
      var optionContainer = options.createFromElement;
      var inputs = optionContainer.getElementsByTagName('input');
      for (var i = 0; i < inputs.length; i++) {
        var item = inputs[i];
        if(item.type == 'checkbox')
          options[item.name] = item.checked;
      }
    
    }
    
    Object.assign(globOpts, options);

    if(globOpts.showDeviceDebug){
      globVars.device.debugBox.style.display = "block";
    }else{
      globVars.device.debugBox.style.display = "none";
    }  
    
    if(globOpts.showMarkerDebug){
      globVars.marker.debugBox.style.display = "block";
    }else{
      globVars.marker.debugBox.style.display = "none";
    }  

    if(globOpts.fullscreen)
      toggleFullScreen();
      
    
    document.getElementById('intro').style.display = "none";
    document.getElementById('loadingInfo').style.display = "block";

  window.awe.init({
    device_type: awe.AUTO_DETECT_DEVICE_TYPE,
    settings: {
  	    container_id: 'container',
        default_camera_position: { x:0, y:0, z:0 },
        default_lights:[
        {
            id: 'hemi',
            type: 'hemisphere',
            color: 0xAAAAAA,
        },
        ],
    },
    ready: function() {
        awe.util.require([
        {
            capabilities: ['gum','webgl'],
            files: [ 
                [ '../third-party/js/awe-standard-dependencies.js',
                '../third-party/js/awe-standard.js'],
                // plugin dependencies
                [
                '../third-party/js/plugins/awe-jsartoolkit-dependencies.js',
                '../third-party/js/plugins/awe.marker_ar.js',
                '../third-party/js/plugins/StereoEffect.js',
                '../third-party/js/plugins/VREffect.js'
                ],
                // plugins
                [
                '../third-party/js/plugins/awe.rendering_effects.js', 
                '../third-party/js/plugins/awe-standard-object_clicked_or_focused.js', 
                '../third-party/js/plugins/awe.gyro.js',
                ]
            ],
            success: function() { 
		        document.getElementById('loadingInfo').style.display = "none";
    			// setup and paint the scene
				awe.setup_scene();
				
				// object clicked is not set to auto-register
				var click_plugin = awe.plugins.view('object_clicked');
  				if (click_plugin) {
				    click_plugin.register();
					click_plugin.enable();
  				}
  				var gyro_plugin = awe.plugins.view('gyro');
  				if (gyro_plugin) {
					// gyro_plugin.enable();
  				}
  				var mouse_plugin = awe.plugins.view('mouse');
  				if (mouse_plugin) {
					mouse_plugin.enable();
  				}
  					
  				// object clicked is not set to auto-register
  				var plugin = awe.plugins.view('object_clicked');
  				if (plugin) {
					plugin.register();
					plugin.enable();
  				}
  					
  					
                awe.settings.update({data:{value: 'ar'}, where:{id: 'view_mode'}});
  				var render_effects_plugin = awe.plugins.view('render_effects');
  				if (render_effects_plugin) {
					render_effects_plugin.enable();
  				}

                // awe.plugins.view('render_effects').disable();
		        awe.plugins.view('jsartoolkit').enable();
		        
		        
		        if(options.stereo){
                    setTimeout(function() { awe.plugins.view('jsartoolkit').unregister(); }, 8000);
                    // awe.plugins.view('jsartoolkit').unregister();
                    // awe.plugins.view('jsartoolkit').register();
  	            }else{
		         
		        } 
		        
					
		        // 'ar' will not do anything if gum is unavailable
    				awe.settings.update({data:{value: 'ar'}, where:{id: 'view_mode'}});
    				// stereo setting will only work if a vr/stereo plugin is available and supported by the device
    				awe.settings.update({data:{value: 'stereo'}, where:{id: 'view_count'}});
          
          
          
            createAweScene();
        
		        //needs THREE js to be ready, which is given at this point of executiontime
		        setGlobalVariables();  
		        
		    },
        },
        { // else create a fallback
            capabilities: [],
            success: function() { 
    	          document.body.innerHTML = '<p>Try this demo in the latest version of Chrome or Firefox on a PC or Android device</p>';
            },
        },
    ]);
  }
});
};



function createAweScene(options){
  options = options || {};
  //add_pois();
  /*
  Binding a POI to a jsartoolkit marker is easy
  - First add the awe-jsartoolkit-dependencies.js plugin (see above)
  - Then select a marker image you'd like to use
  - Then add the matching number as a suffix for your POI id (e.g. _64)
  NOTE: See 64.png in this directory or https://github.com/kig/JSARToolKit/blob/master/demos/markers
  This automatically binds your POI to that marker id - easy!
  */
  awe.pois.add([
    { id:'jsartoolkit_marker_64', visible: false },
    { id:'crosshair_poi', position: { x:0, y:50, z:-100 }, visible: false}, 
    //test poi
    { id:'fixed_poi', position: { x:100, y:0, z:-250 }, visible: false},
    { id:'south', position: { x:0, y:0, z:-200 } },
    { id:'origin', position: { x:0, y:0, z:0 }, visible: true}
  ]);

  // the visibile:flase does not work in the first place
  // TODO awe
  //workaround, set it later to visible false
  marker = awe.pois.view('jsartoolkit_marker_64');
  marker.update({visible:false});
  crosshair = awe.pois.view('crosshair_poi');
  crosshair.update({visible: false});
  markerPosition = awe.pois.view('origin');
  markerPosition.update({visible: false});
		        
  
  
  awe.projections.add(
    { id:'upAxisRotProjection', 
		  geometry: { shape: 'cube', x:100, y:5, z:50 },
      material: { type: 'phong', color: 0xFFFFFF }, 
      rotation: {x:0, y:0, z:0},
      visible: true 
    },
    { poi_id: 'origin' }
  );
  
  globVars.upAxisRotProjection = awe.projections.view('upAxisRotProjection');
  
  
  if(globOpts.compareToNative){
    awe.projections.add(
      { id:'board_projection_native', 
  		  geometry: { shape: 'cube', x:100, y:5, z:50 },
        material: { type: 'phong', color: 0xFFFFFF }, 
        rotation: {x:-90, y:0, z:0},
        visible: true 
      },
      { poi_id: 'jsartoolkit_marker_64' }
    );
  }
  
  awe.projections.add(
    { id:'board_projection', 
		  geometry: { shape: 'cube', x:100, y:5, z:50 },
      material: { type: 'phong', color: 0xFFFFFF }, 
      rotation: {x:-90, y:0, z:0},
      visible: true 
    },
    { parent: {object_type: 'projection', object_id: 'upAxisRotProjection'}}
    // { poi_id: 'origin' }
  );
  
 
  board = awe.projections.view('board_projection');
  board.limit = {x: 45, z: 20};
      
  //see also https://threejs.org/docs/#api/geometries/SphereGeometry
  awe.projections.add(
    { id:'ball_projection', 
	    geometry: { shape: 'sphere', 
	                radius:10, 
	                widthSegments:20, 
	                heightSegments:20
	    },
      material: { type: 'phong', color: 0x1B46B1 }, 
      position: { x:0, y:12.5, z:0 }
    }, 
    { parent: {object_type: 'projection', object_id: 'board_projection'}}
  );
    
  ball = awe.projections.view('ball_projection');
    
  
  //compare https://threejs.org/docs/#api/geometries/CylinderGeometry
  awe.projections.add(
    { id:'aim_projection', 
	    geometry: { shape:'cylinder',
                  radiusTop:8,
                  radiusBottom:10,
                  height: 0.001,
                  radiusSegments:20,
                  openEnded: true
	    },
      material:{ type: 'phong', color: 0x22ff22 }, 
      position: { x:-20, y:4, z:0 },
    }, 
    {parent: {object_type: 'projection', object_id: 'board_projection'}}
  );
    
  aim = awe.projections.view('aim_projection');
    
    
  awe.projections.add(
    { id:'crosshairCenter_projection', 
	    geometry: { shape:'cylinder',
                  radiusTop:8,
                  radiusBottom:10,
                  height: 0.001,
                  radiusSegments:20,
                  openEnded: true
	    },
      material:{ type: 'phong', color: 0x000000 }, 
      position: { x:0, y:0, z:0 },
      rotation: {x:-90, y:0, z:0},
      visible: true
    },
    { poi_id: 'crosshair_poi' }
  );
  
  crosshairCenter = awe.projections.view('crosshairCenter_projection');
    
  awe.projections.add(
    { id:'crosshairNeedle_projection', 
      geometry: { shape:'cylinder',
                  radiusTop:8,
                  radiusBottom:10,
                  height: 0.001,
                  radiusSegments:20,
                  openEnded: true
      },
      material:{ type: 'phong', color: 0x22ff22 }, 
      position: { x:0, y:0, z:0 },
      visible: true
    },
    { parent: {object_type: 'projection', object_id: 'crosshairCenter_projection'}}
  );
  
  crosshairNeedle = awe.projections.view('crosshairNeedle_projection');
}		  



function doOnMarkerDetection(poi, marker_transform_matrix){
              
              //console.log(poi.id);
              poi = marker;
              
              
              var mesh = poi.get_mesh();
              
              // console.log(mesh);
              // console.log(detected_marker_id);
              
              var m = new THREE.Matrix4().fromArray(marker_transform_matrix);
              //console.log(m);
              
              var position = new THREE.Vector3();
              var quaternion = new THREE.Quaternion();
              var scale = new THREE.Vector3();
              m.decompose( position, quaternion, scale );
              var rotation =  new THREE.Euler().setFromQuaternion( quaternion );
              
              //position.z = position.z/2; 
              
              m.compose( position, quaternion, scale );
              
              mesh.matrixAutoUpdate = false;
              mesh.matrix.setFromArray(Object.asCopy(m.elements));
              mesh.matrixWorldNeedsUpdate = true;
              
              
              // var boardMesh = board.get_mesh();
              // boardMesh.matrixAutoUpdate = false;
              // boardMesh.matrix.setFromArray(Object.asCopy(m.elements));
              // boardMesh.matrixWorldNeedsUpdate = true;
              
              if(globOpts.compareToNative){
                position.x += 40;
                position.y += 40;
              }
              
              
              markerPosition.update({rotation: { x: 90, y:0, z:0}});
              markerPosition.update({position: {x:position.x,y:position.y,z:-position.z}});

              globVars.upAxisRotProjection.update({rotation: {x:0, y:0, z:r2d(rotation.y)}});

              board.update({rotation: { x: r2d(-rotation.x) ,y:r2d(rotation.z),z:r2d(rotation.y)}});
              
              
              
              
              /*global THREE, globalVariables*/
              /*global infoBox, idleRotQuat, r2d,round, device, markerQuat*/
              
              var quat = mesh.getWorldQuaternion();
             
             
              //http://stackoverflow.com/questions/21557341/three-js-get-world-rotation-from-matrixworld
              var position2 = new THREE.Vector3();
              var quaternion2 = new THREE.Quaternion();
              var scale2 = new THREE.Vector3();
              mesh.matrixWorld.decompose( position2, quaternion2, scale2 );
              
              
              
              
              
              //find real angle of marker to steer;
              
              
              //(set marker lying on the table is idle at device looking topDown)
              //like set on calibration
              quat.multiply(markerQuat);
              
              
              globVars.marker.debugBox.innerHTML = 'marker info -------------------';
              globVars.marker.debugBox.innerHTML += '<br>x: '
              +round(position.x)+' y:'+round(position.y)+' z:'+round(position.z)
              +'<br>'
              //+round(scale.x)+' y:'+round(scale.y)+' z:'+round(scale.z)
              +quat.equals(quaternion);
              +'';
              
              var rotS0 =  new THREE.Euler().setFromQuaternion( quat );
              globVars.marker.debugBox.innerHTML += "<br>original rotS0:"+"<br>x: "+r2d(rotS0.x) + "<br>y: "+r2d(rotS0.y) + "<br>z: "+r2d(rotS0.z);
              
              
              
              var rotS1 =  new THREE.Euler().setFromQuaternion( quat );
              globVars.marker.debugBox.innerHTML += "<br>rotS1:"+"<br>x: "+r2d(rotS1.x) + "<br>y: "+r2d(rotS1.y) + "<br>z: "+r2d(rotS1.z);
              
              
              
              //undo device rotation
              var deviceQuat = getDeviceQuat({doInvertQuat:true});
              quat.multiply(deviceQuat);
              var rotS2 =  new THREE.Euler().setFromQuaternion( quat );
              globVars.marker.debugBox.innerHTML += "<br>rotS2:"+"<br>x: "+r2d(rotS2.x) + "<br>y: "+r2d(rotS2.y) + "<br>z: "+r2d(rotS2.z);
              
              
              //handle dimension z of marker: can be turned around z
              var rotZ = new THREE.Quaternion().setFromAxisAngle ( new THREE.Vector3( 1, 1, 1 ), rotS2.z );
              rotZ.inverse();
              // quat.multiply(rotZ);
              var rotS3 = new THREE.Euler().setFromQuaternion( quat );
              globVars.marker.debugBox.innerHTML += "<br>rotS3:"+"<br>x: "+r2d(rotS3.x) + "<br>y: "+r2d(rotS3.y) + "<br>z: "+r2d(rotS3.z);
             
              // if(Math.abs(rotation.z)>2)
              //   rotation.y = -rotation.y;
             
              var xPos = ball.position.x+(-rotS3.y); 
              var zPos = ball.position.z+(-rotS3.x); 
              if((xPos>-board.limit.x)&&(xPos<board.limit.x))
                ball.update({position:{ x: xPos}});
              if((zPos>-board.limit.z)&&(zPos<board.limit.z))
                ball.update({position:{ z: zPos}});
              
              crosshairNeedle.update({position:{x:-rotS3.y*10}})
              crosshairNeedle.update({position:{z:rotS3.x*10}})
              crosshairCenter.update({rotation:{y:r2d(-rotS2.z)}})
              
              
              poi.update({
                visible: true
              });
              
              marker.update({visible:true});
              markerPosition.update({visible:true});
              crosshair.update({visible:true});
              
              // marker.get_mesh().visible = true;
              // markerPosition.get_mesh().visible = true;  
}



//this is called everytime but after marker if occurs
function doEveryTime(){
  var devRot = getDeviceEuler();
  globVars.device.debugBox.innerHTML = "device:" + "<br>x: "+r2d(devRot.x) + "<br>y: "+r2d(devRot.y) + "<br>z: "+r2d(devRot.z);
}


function doOnMarkerDetectionEnd(){
  marker.update({visible: false});
  markerPosition.update({visible: false});
  crosshair.update({visible: false});
}