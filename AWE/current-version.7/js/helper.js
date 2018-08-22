function doOnMarkerDetection2(mesh) {
    return;
    /*global THREE, globalVariables*/
    /*global infoBox, idleRotQuat, r2d,round, device, markerQuat*/
    
    //http://stackoverflow.com/questions/21557341/three-js-get-world-rotation-from-matrixworld
    var position = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    mesh.matrixWorld.decompose( position, quaternion, scale );
    var rotation =  new THREE.Euler().setFromQuaternion( quaternion );
    
    board.update({position: {x:position.x,y:position.y,z:-position.z}});
    board.update({rotation: {x:-rotation.x,y:rotation.y,z:rotation.z}});
    
    var quat = mesh.getWorldQuaternion();
    
    
    
    
    
    //find real angle of marker to steer;
    
    
    //(set marker lying on the table is idle at device looking topDown)
    //like set on calibration
    quat.multiply(markerQuat);
    
    
    infoBox.innerHTML = 'marker info -------------------';
    infoBox.innerHTML += '<br>x: '
    +round(position.x)+' y:'+round(position.y)+' z:'+round(position.z)
    +'<br>'
    //+round(scale.x)+' y:'+round(scale.y)+' z:'+round(scale.z)
    +quat.equals(quaternion);
    +'';
    
    var rotS0 =  new THREE.Euler().setFromQuaternion( quat );
    infoBox.innerHTML += "<br>original rotS0:"+"<br>x: "+r2d(rotS0.x) + "<br>y: "+r2d(rotS0.y) + "<br>z: "+r2d(rotS0.z);
    
    
    
    var rotS1 =  new THREE.Euler().setFromQuaternion( quat );
    infoBox.innerHTML += "<br>rotS1:"+"<br>x: "+r2d(rotS1.x) + "<br>y: "+r2d(rotS1.y) + "<br>z: "+r2d(rotS1.z);
    
    
    
    //undo device rotation
    var deviceQuat = getDeviceQuat({inversed:true});
    quat.multiply(deviceQuat);
    var rotS2 =  new THREE.Euler().setFromQuaternion( quat );
    infoBox.innerHTML += "<br>rotS2:"+"<br>x: "+r2d(rotS2.x) + "<br>y: "+r2d(rotS2.y) + "<br>z: "+r2d(rotS2.z);
    
    
    //handle dimension z of marker: can be turned around z
    var rotZ = new THREE.Quaternion().setFromAxisAngle ( new THREE.Vector3( 1, 1, 1 ), rotS2.z );
    rotZ.inverse();
    // quat.multiply(rotZ);
    var rotS3 = new THREE.Euler().setFromQuaternion( quat );
    infoBox.innerHTML += "<br>rotS3:"+"<br>x: "+r2d(rotS3.x) + "<br>y: "+r2d(rotS3.y) + "<br>z: "+r2d(rotS3.z);
    
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
    
    marker.update({visible:true})
    crosshair.update({visible:true})
    
    marker.get_mesh().visible = true;    
}


//this is called everytime but after marker if occurs
function doEveryTime2(){
    //this is execute each time
    var devRot = getDeviceEuler();
    info.innerHTML = "device:" + "<br>x: "+r2d(devRot.x) + "<br>y: "+r2d(devRot.y) + "<br>z: "+r2d(devRot.z);
    
    
    if (poi_to_hide.length) {
      
      var p = awe.pois.view(poi_to_hide);
      // console.log(p);
      
      
      awe.pois.update({
        data: {
          visible: false
        },
        where: { id: poi_to_hide }
      });
      
      marker.update({visible: false})
      crosshair.update({visible: false})
      
    }    
}