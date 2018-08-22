//some stuff around the actual app, that helps to devlope or which is not directly linked to the main features

/*global awe, location */

// do some stuff after tab was changed
//http://stackoverflow.com/questions/3478654/browser-event-for-window-focus
//the reload prevents endless unused filming and provide newest version
var reloadOnTabChange = true;
window.onfocus = function () {
  if(reloadOnTabChange)
    location.reload();
};
window.onblur = function () {
  if(reloadOnTabChange)
    location.reload();
};


if (window.addEventListener) 
  window.addEventListener("keydown", keycodes, false);
else if (window.attachEvent)
  window.attachEvent("onkeydown", keycodes);
 
function keycodes (e) {
    switch(e.key) {
      case "1":
          awe.plugins.view('jsartoolkit').register();
          console.log("register");
          break;
      case "2":
          awe.plugins.view('jsartoolkit').enable();
          console.log("enable");
          break;
      case "3":
          awe.plugins.view('jsartoolkit').disable();
          console.log("disable");
          break;
      case "4":
          awe.plugins.view('jsartoolkit').unregister();
          console.log("unregister");
          break;
      default:
          reloadOnTabChange = !reloadOnTabChange;
          console.log('reloadOnTabChange = '+ reloadOnTabChange);
    }
}


