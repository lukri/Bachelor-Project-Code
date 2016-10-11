/*global CompatibilityTester, Initializer*/


var compatibilityTester = new CompatibilityTester();
var initializer = new Initializer();


compatibilityTester.test();


var detectMarkersEnabled	= true;
var markerToObject3DEnabled	= true;
var webglRenderEnabled		= true;

initializer.init();


var vE = initializer.initVirtualEnvironment();
var renderer = vE.renderer;
var scene = vE.scene;
var camera = vE.camera;


// array of functions for the rendering loop
var onRenderFcts = [];




webarRun();


function renderingLoop(){
    getRealWorldImage({source:"picture"}); //source: camera, picture, video
    
    get3DPosition();
    
        
    
    get3DElements();
    
    merge();
    
    draw();
}
