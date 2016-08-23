var scene, camera, renderer;
var geometry, mesh;

var man, textureMaterial;



function init() {
        addInfo("creat");
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 1000;

        
        var loadingManager = new THREE.LoadingManager();
		loadingManager.onProgress = function ( item, loaded, total ) {
			console.log( item, loaded, total );
		};
		var onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				console.log( Math.round(percentComplete, 2) + '% downloaded' );
			}
		};
		var onError = function ( xhr ) {
		    alert("a file was not loaded correctly");
		    //console.log(xhr.srcElement);
		};
        
        
        
        var texture = new THREE.Texture();
        var loader = new THREE.ImageLoader(loadingManager);
		loader.load( 'textures/UV_Grid_Sm.jpg', function ( image ) {
			texture.image = image;
			texture.needsUpdate = true;
		}, onProgress, onError );

        textureMaterial = new THREE.MeshBasicMaterial();
        textureMaterial.map = texture;
        
        // instantiate a loader
        loader = new THREE.OBJLoader(loadingManager);
        
        // load a resource
        loader.load(
        	// resource URL
        	'obj/male02.obj',
        	// Function when resource is loaded
        	function ( object ) {
        		object.traverse( function ( child ) {
						if ( child instanceof THREE.Mesh ) {
							child.material = textureMaterial;
						}
				} );
				
				man = object;
				man.scale.x = 3;
				man.scale.y = 3;
				man.scale.z = 3;
				
        		scene.add( man );
        	}
        	, onProgress, onError
        );
        
        
        geometry = new THREE.BoxGeometry( 200, 200, 200 );

        mesh = new THREE.Mesh( geometry, textureMaterial );
        mesh.position.y = - 90;
        scene.add( mesh );

        
        
        
        
        
        
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        document.body.appendChild( renderer.domElement );

}