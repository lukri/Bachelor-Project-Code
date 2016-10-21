/*global THREE, CompatibilityTester, Initializer, VirtualContainer*/


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
var views = vE.views;

for (var ii =  0; ii < views.length; ++ii ) {
	var view = views[ii];
	camera = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.x = view.eye[ 0 ];
	camera.position.y = view.eye[ 1 ];
	camera.position.z = view.eye[ 2 ];
	camera.up.x = view.up[ 0 ];
	camera.up.y = view.up[ 1 ];
	camera.up.z = view.up[ 2 ];
	view.camera = camera;
}


var vC = new VirtualContainer();

//////////////////////////////////////////////////////////////////////////////////
//		create a markerObject3D
//////////////////////////////////////////////////////////////////////////////////
var markerObject3D = vC.getObject();
scene.add(markerObject3D)










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
