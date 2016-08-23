var scene, camera, renderer;
var geometry, material, mesh;

var man, objMeshMaterial;


function init() {
        addInfo("cs-v-2");
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 1000;

        
        
        // instantiate a loader
        var loader = new THREE.OBJLoader();
        
        // load a resource
        loader.load(
        	// resource URL
        	'obj/male02.obj',
        	// Function when resource is loaded
        	function ( object ) {
        		man = object;
        		objMeshMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
        		object.traverse( function ( child ) {
						if ( child instanceof THREE.Mesh ) {
							child.material = objMeshMaterial;
						}
				} );
				man.scale.x = 2;
				man.scale.y = 2;
				man.scale.z = 2;
        		scene.add( man );
        	}
        );
        
        
        
        geometry = new THREE.BoxGeometry( 200, 200, 200 );
        material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

        mesh = new THREE.Mesh( geometry, material );
        //scene.add( mesh );

        
        
        
        
        
        
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        document.body.appendChild( renderer.domElement );

}