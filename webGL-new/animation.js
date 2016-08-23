/*global VirtualJoystick*/
console.log("touchscreen is", VirtualJoystick.touchScreenAvailable() ? "available" : "not available");

//
var joystickR    = new VirtualJoystick({
    container    : document.body,
    strokeStyle    : 'cyan',
    limitStickTravel: true,
    stickRadius    : 50
});
joystickR.addEventListener('touchStartValidation', function(event){
    var touch    = event.changedTouches[0];
    if( touch.pageX < window.innerWidth/2 )    return false;
    return true;
});

// one on the right of the screen
var joystickL    = new VirtualJoystick({
    container    : document.body,
    strokeStyle    : 'orange',
    limitStickTravel: true,
    stickRadius    : 50,
});
joystickL.addEventListener('touchStartValidation', function(event){
    var touch    = event.changedTouches[0];
    if( touch.pageX >= window.innerWidth/2 )    return false;
    return true;
});
/*
joystickL.addEventListener('touchStart', function(){
    console.log('fire');
});
*/

















/*global ControlPanelHanlder*/
var cPH = new ControlPanelHanlder();

cPH.setCurrentTree("Twinkle Controls", "Twinkle", "Switch");
var twinkle = cPH.addItem("Use twinkle", "checkbox", [false]);
cPH.setCurrentTree("Twinkle Controls", "Twinkle", "Settings");
var zoom = cPH.addItem("Zoom", "numberInput", [-15, 0.05]);
var tilt = cPH.addItem("Tilt", "numberInput", [90, 0.05]);
var spin = cPH.addItem("Spin", "numberInput", [0, 0.05]);

cPH.setCurrentTree("Light Controls", "Blending", "Switch");
var blending = cPH.addItem("Use blending", "checkbox", [false]);
var alpha = cPH.addItem("Alpha level", "numberInputFree", [0.5, 0.05]);

cPH.setCurrentTree("Light Controls", "Use of Light", "Switch");
var lighting = cPH.addItem("Turn light on", "checkbox", [true]);
var specular = cPH.addItem("Show specular highlight", "checkbox", [true]);
var snininessMapUse = cPH.addItem("Use shininessMap", "checkbox", [true]);
var useTexture = cPH.addItem("Use textures", "checkbox", [true]);


cPH.setCurrentTree("Light Controls-hidden", "Directional light", "Direction");
var lightDirectionX = cPH.addItem("X", "numberInputFree", [-0.25, 0.05]);
var lightDirectionY = cPH.addItem("Y", "numberInputFree", [-0.25, 0.05]);
var lightDirectionZ = cPH.addItem("Z", "numberInputFree", [-1.0, 0.05]);
cPH.setCurrentTree("Light Controls-hidden", "Directional light", "Colour");
var directionalR = cPH.addItem("R", "numberInputFree", [0.8, 0.1]);
var directionalG = cPH.addItem("G", "numberInputFree", [0.8, 0.1]);
var directionalB = cPH.addItem("B", "numberInputFree", [0.8, 0.1]);

cPH.setCurrentTree("Light Controls", "Material", "Options");
var shininess = cPH.addItem("Shininess", "numberInput", [32, 1]);


cPH.setCurrentTree("Light Controls", "Point light", "Position");
var lightPositionX = cPH.addItem("X", "numberInputFree", [0, 0.05]);
var lightPositionY = cPH.addItem("Y", "numberInputFree", [100, 0.05]);
var lightPositionZ = cPH.addItem("Z", "numberInputFree", [0, 0.05]);
cPH.setCurrentTree("Light Controls", "Point light", "Specular colour");
var specularR = cPH.addItem("R", "numberInputFree", [1.0, 0.1]);
var specularG = cPH.addItem("G", "numberInputFree", [0.5, 0.1]);
var specularB = cPH.addItem("B", "numberInputFree", [0.1, 0.1]);
cPH.setCurrentTree("Light Controls", "Point light", "Diffuse colour");
var diffuseR = cPH.addItem("R", "numberInputFree", [0.3, 0.1]);
var diffuseG = cPH.addItem("G", "numberInputFree", [0.2, 0.1]);
var diffuseB = cPH.addItem("B", "numberInputFree", [0.1, 0.1]);

cPH.setCurrentTree("Light Controls-hidden", "Point light", "Diffuse colour");
var pointR = cPH.addItem("R", "numberInputFree", [0.2, 0.1]);
var pointG = cPH.addItem("G", "numberInputFree", [0.1, 0.1]);
var pointB = cPH.addItem("B", "numberInputFree", [0.0, 0.1]);


cPH.setCurrentTree("Light Controls", "Ambient light", "Colour");
var ambientR = cPH.addItem("R", "numberInputFree", [0.2, 0.1]);
var ambientG = cPH.addItem("G", "numberInputFree", [0.2, 0.1]);
var ambientB = cPH.addItem("B", "numberInputFree", [0.2, 0.1]);

cPH.setCurrentTree("Cube Controls", "Cube", "Speed");
var xSpeed = cPH.addItem("X", "numberInput", [0,1,-1000,1000]);
var ySpeed = cPH.addItem("Y", "numberInput", [30,1,-1000,1000]);

cPH.convertToHTML();


  var z = -10;

  var tFilter = 0;
  var sFilter = 0;



var lastTime = 0;
var rot = 0;


var moonAngle;
var cubeAngle;


var locoCam = false;



function animate() {
    var timeNow = new Date().getTime();
    if (lastTime !== 0) {
        var elapsed = timeNow - lastTime;
        loco.animate();

        camera.update(speed, yawRate, pitchRate, elapsed);
        
        camDetails = camera.getDetails();
        sky.reset();
        //cam correction in z value
        sky.translate({x:camDetails.xPos,y:camDetails.yPos,z:camDetails.zPos+10});
    }
    lastTime = timeNow;
}

var pitchRate = 0;
var yawRate = 0;
var speed = 0;


function incElementValue(element, incStep){
    element.value = parseFloat(element.value)+incStep;
}


var currentlyPressedKeys = {};

function handleKeyDown(event) {
    if(event.keyCode == 123)return;   //f12
    //if(event.target != document.body)return;
    if(event.keyCode == KeyEvent.DOM_VK_ESCAPE){
        cancel();
        return;
    }
    if(event.target.freeInput)return;

    if(event.target.incStep){
        if(event.keyCode==KeyEvent.DOM_VK_UP)
            incElementValue(event.target,event.target.incStep);
        if(event.keyCode==KeyEvent.DOM_VK_DOWN)
            incElementValue(event.target,-event.target.incStep);
        return;
    }

    if(event.keyCode == KeyEvent.DOM_VK_F5)return;
    event.preventDefault();

    if(!currentlyPressedKeys[event.keyCode])
        currentlyPressedKeys[event.keyCode] = true;

    if (String.fromCharCode(event.keyCode) == "T") {
      tFilter = ++tFilter % textureHanlder.amount;
      world.texture = textureHanlder.getTexture(tFilter,{getNthElement:true});
      teapot.texture = textureHanlder.getTexture(tFilter,{getNthElement:true});
      earth.texture = textureHanlder.getTexture(tFilter,{getNthElement:true});
    }
    if (String.fromCharCode(event.keyCode) == "Z") {
      sFilter = ++sFilter % shaderHanlder.amount;
      //world.shader = shaderHanlder.getShader("s"+sFilter);
      world.shader = shaderHanlder.getShader(sFilter,{getNthElement:true});
    }

    if (String.fromCharCode(event.keyCode) == "M") {
      moon2.setGeometry("cube");
      moon2.scale({xyz:0.2});
      moon2.saveMatrix();
    }

    if (String.fromCharCode(event.keyCode) == "P") {
      //moon.invertNormals();
      togglePause();//in script.js
    }

    if (String.fromCharCode(event.keyCode) == "U") {
      camera.setYPos(20);
    }
    if (String.fromCharCode(event.keyCode) == "N") {
      camera.setYPos(1);
    }
    
    if (String.fromCharCode(event.keyCode) == "C") {
      locoCam = !locoCam;
    }



    if(String.fromCharCode(event.keyCode)=="1"){
        cPH.show("Light Controls");
    }
    if(String.fromCharCode(event.keyCode)=="2"){
        cPH.show("Cube Controls");
    }

    if(String.fromCharCode(event.keyCode)=="3"){
        cPH.show("Twinkle Controls");
    }

}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}


function handleKeys() {

    if (currentlyPressedKeys[33]) {
      // Page Up
      z -= 0.05;
    }
    if (currentlyPressedKeys[34]) {
      // Page Down
      z += 0.05;
    }

    if (currentlyPressedKeys[KeyEvent.DOM_VK_UP]) {
      loco.drive("forward");
    }
    if (currentlyPressedKeys[KeyEvent.DOM_VK_DOWN]) {
      loco.drive("backward");
    }
    loco.controlSpeed();

    if (currentlyPressedKeys[KeyEvent.DOM_VK_LEFT]) {
      loco.steer("left");
    }
    if (currentlyPressedKeys[KeyEvent.DOM_VK_RIGHT]) {
      loco.steer("right");
    }
    loco.stop();






    pitchRate = 0;
    yawRate = 0;
    speed = 0;
    if (currentlyPressedKeys[KeyEvent.DOM_VK_I]) pitchRate = 0.1;
    if (currentlyPressedKeys[KeyEvent.DOM_VK_K]) pitchRate = -0.1;
    if (currentlyPressedKeys[KeyEvent.DOM_VK_J]) yawRate = 0.1;
    if (currentlyPressedKeys[KeyEvent.DOM_VK_L]) yawRate = -0.1;
    if (currentlyPressedKeys[KeyEvent.DOM_VK_W]) speed = 0.1;
    if (currentlyPressedKeys[KeyEvent.DOM_VK_S]) speed = -0.1;
    
    //change in navigation
    if (joystickR.up()) speed = -joystickR.deltaY()/300;
    if (joystickR.down()) speed = -joystickR.deltaY()/300;
    if (joystickR.left()) yawRate = -joystickR.deltaX()/300;
    if (joystickR.right()) yawRate = -joystickR.deltaX()/300;
    
    if (joystickL.up()) pitchRate = -joystickL.deltaY()/300;
    if (joystickL.down()) pitchRate = -joystickL.deltaY()/300;
    
    
    if (joystickL.left()) yawRate = -joystickL.deltaX()/300;
    if (joystickL.right()) yawRate = -joystickL.deltaX()/300;
    
    


    /*
    if (currentlyPressedKeys[KeyEvent.DOM_VK_A]) {
      currentlyPressedKeys[KeyEvent.DOM_VK_A]++;
      xSpeed.setValue(currentlyPressedKeys[KeyEvent.DOM_VK_A]);
    }
    */

}



function cancel(){
    cPH.show();
}




var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

function handleMouseDown(event) {
    event.preventDefault();
    mouseDown = true;
    var mousePos = getRelativeCoordinates(event, event.target);
    lastMouseX = mousePos.x;
    lastMouseY = mousePos.y;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
      return;
    }
    var camYaw = camera.getDetails().yaw;
    var rotX = Math.cos(degToRad(-camYaw));
    var rotZ = Math.sin(degToRad(-camYaw));

    var mousePos = getRelativeCoordinates(event, event.target);
    var newX = mousePos.x;
    var newY = mousePos.y;

    var deltaX = newX - lastMouseX;
    var newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);
    mat4.rotate(newRotationMatrix, degToRad(deltaX / 2), [0, 1, 0]);

    var deltaY = newY - lastMouseY;
    mat4.rotate(newRotationMatrix, degToRad(deltaY / 2), [rotX, 0, rotZ]);

    //mat4.multiply(newRotationMatrix, terrain.transformMatrix, terrain.transformMatrix);
    //mat4.multiply(newRotationMatrix, bridge.transformMatrix, bridge.transformMatrix);
    //mat4.multiply(newRotationMatrix, tree.transformMatrix, tree.transformMatrix);

    lastMouseX = newX
    lastMouseY = newY;
}
















//http://stackoverflow.com/questions/1465374/javascript-event-keycode-constants
//http://www.w3.org/TR/2001/WD-DOM-Level-3-Events-20010410/DOM3-Events.html#events-Events-KeyEvent
if (typeof KeyEvent == "undefined") {
    var KeyEvent = {
        DOM_VK_CANCEL: 3,
        DOM_VK_HELP: 6,
        DOM_VK_BACK_SPACE: 8,
        DOM_VK_TAB: 9,
        DOM_VK_CLEAR: 12,
        DOM_VK_RETURN: 13,
        DOM_VK_ENTER: 14,
        DOM_VK_SHIFT: 16,
        DOM_VK_CONTROL: 17,
        DOM_VK_ALT: 18,
        DOM_VK_PAUSE: 19,
        DOM_VK_CAPS_LOCK: 20,
        DOM_VK_ESCAPE: 27,
        DOM_VK_SPACE: 32,
        DOM_VK_PAGE_UP: 33,
        DOM_VK_PAGE_DOWN: 34,
        DOM_VK_END: 35,
        DOM_VK_HOME: 36,
        DOM_VK_LEFT: 37,
        DOM_VK_UP: 38,
        DOM_VK_RIGHT: 39,
        DOM_VK_DOWN: 40,
        DOM_VK_PRINTSCREEN: 44,
        DOM_VK_INSERT: 45,
        DOM_VK_DELETE: 46,
        DOM_VK_0: 48,
        DOM_VK_1: 49,
        DOM_VK_2: 50,
        DOM_VK_3: 51,
        DOM_VK_4: 52,
        DOM_VK_5: 53,
        DOM_VK_6: 54,
        DOM_VK_7: 55,
        DOM_VK_8: 56,
        DOM_VK_9: 57,
        DOM_VK_SEMICOLON: 59,
        DOM_VK_EQUALS: 61,
        DOM_VK_A: 65,
        DOM_VK_B: 66,
        DOM_VK_C: 67,
        DOM_VK_D: 68,
        DOM_VK_E: 69,
        DOM_VK_F: 70,
        DOM_VK_G: 71,
        DOM_VK_H: 72,
        DOM_VK_I: 73,
        DOM_VK_J: 74,
        DOM_VK_K: 75,
        DOM_VK_L: 76,
        DOM_VK_M: 77,
        DOM_VK_N: 78,
        DOM_VK_O: 79,
        DOM_VK_P: 80,
        DOM_VK_Q: 81,
        DOM_VK_R: 82,
        DOM_VK_S: 83,
        DOM_VK_T: 84,
        DOM_VK_U: 85,
        DOM_VK_V: 86,
        DOM_VK_W: 87,
        DOM_VK_X: 88,
        DOM_VK_Y: 89,
        DOM_VK_Z: 90,
        DOM_VK_CONTEXT_MENU: 93,
        DOM_VK_NUMPAD0: 96,
        DOM_VK_NUMPAD1: 97,
        DOM_VK_NUMPAD2: 98,
        DOM_VK_NUMPAD3: 99,
        DOM_VK_NUMPAD4: 100,
        DOM_VK_NUMPAD5: 101,
        DOM_VK_NUMPAD6: 102,
        DOM_VK_NUMPAD7: 103,
        DOM_VK_NUMPAD8: 104,
        DOM_VK_NUMPAD9: 105,
        DOM_VK_MULTIPLY: 106,
        DOM_VK_ADD: 107,
        DOM_VK_SEPARATOR: 108,
        DOM_VK_SUBTRACT: 109,
        DOM_VK_DECIMAL: 110,
        DOM_VK_DIVIDE: 111,
        DOM_VK_F1: 112,
        DOM_VK_F2: 113,
        DOM_VK_F3: 114,
        DOM_VK_F4: 115,
        DOM_VK_F5: 116,
        DOM_VK_F6: 117,
        DOM_VK_F7: 118,
        DOM_VK_F8: 119,
        DOM_VK_F9: 120,
        DOM_VK_F10: 121,
        DOM_VK_F11: 122,
        DOM_VK_F12: 123,
        DOM_VK_F13: 124,
        DOM_VK_F14: 125,
        DOM_VK_F15: 126,
        DOM_VK_F16: 127,
        DOM_VK_F17: 128,
        DOM_VK_F18: 129,
        DOM_VK_F19: 130,
        DOM_VK_F20: 131,
        DOM_VK_F21: 132,
        DOM_VK_F22: 133,
        DOM_VK_F23: 134,
        DOM_VK_F24: 135,
        DOM_VK_NUM_LOCK: 144,
        DOM_VK_SCROLL_LOCK: 145,
        DOM_VK_COMMA: 188,
        DOM_VK_PERIOD: 190,
        DOM_VK_SLASH: 191,
        DOM_VK_BACK_QUOTE: 192,
        DOM_VK_OPEN_BRACKET: 219,
        DOM_VK_BACK_SLASH: 220,
        DOM_VK_CLOSE_BRACKET: 221,
        DOM_VK_QUOTE: 222,
        DOM_VK_META: 224
    };
}



 /**
   * Retrieve the coordinates of the given event relative to the center
   * of the widget.
   *
   *http://acko.net/blog/mouse-handling-and-absolute-positions-in-javascript/
   *
   * @param event
   *   A mouse-related DOM event.
   * @param reference
   *   A DOM element whose position we want to transform the mouse coordinates to.
   * @return
   *    A hash containing keys 'x' and 'y'.
   */
function getRelativeCoordinates(event, reference) {
    return {
        x:event.clientX,
        y:event.clientY
    }

    //alternative event.clientY - event.target.offsetTop;


    //for future to correct scroled page
    var x, y;
    event = event || window.event;
    var el = event.target || event.srcElement;

    if (!window.opera && typeof event.offsetX != 'undefined') {
      // Use offset coordinates and find common offsetParent
      var pos = { x: event.offsetX, y: event.offsetY };

      // Send the coordinates upwards through the offsetParent chain.
      var e = el;
      while (e) {
        e.mouseX = pos.x;
        e.mouseY = pos.y;
        pos.x += e.offsetLeft;
        pos.y += e.offsetTop;
        e = e.offsetParent;
      }

      // Look for the coordinates starting from the reference element.
      var e = reference;
      var offset = { x: 0, y: 0 };
      while (e) {
        if (typeof e.mouseX != 'undefined') {
          x = e.mouseX - offset.x;
          y = e.mouseY - offset.y;
          break;
        }
        offset.x += e.offsetLeft;
        offset.y += e.offsetTop;
        e = e.offsetParent;
      }

      // Reset stored coordinates
      e = el;
      while (e) {
        e.mouseX = undefined;
        e.mouseY = undefined;
        e = e.offsetParent;
      }
    }
    else {
      // Use absolute coordinates
      var pos = getAbsolutePosition(reference);
      x = event.pageX  - pos.x;
      y = event.pageY - pos.y;
    }
    // Subtract distance to middle
    return { x: x, y: y };
}