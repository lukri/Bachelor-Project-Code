/*global THREE, Marker*/

var THREEx = THREEx || {}

THREEx.Generated = function(){
        //example from http://jsfiddle.net/mdAb7/11/
        //http://stackoverflow.com/questions/11709760/how-can-i-put-two-different-textures-on-the-front-and-back-of-a-plane
        
        
        // renderer
        var rendererNew = new THREE.WebGLRenderer({
    		antialias	: true,
    		alpha		: true,
        });
        rendererNew.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( rendererNew.domElement );
        
        var domElement = rendererNew.domElement;
        
        // scene
        var sceneNew = new THREE.Scene();
        
        // camera
        var cameraNew = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
        cameraNew.position.z = 300;
        cameraNew.lookAt( sceneNew.position );
        
        // geometry //target texture is 278x306 -> 90x99
        var geometry1 = new THREE.PlaneGeometry( 90, 99, 1, 1 );            
        var geometry2 = new THREE.PlaneGeometry( 90, 99, 1, 1 );            
        geometry2.applyMatrix( new THREE.Matrix4().makeRotationY( Math.PI ) );
        
        // textures
        //old version
        //var textureFront = new THREE.ImageUtils.loadTexture( 'images/image-marker-265.png' );      
        //var textureBack = new THREE.ImageUtils.loadTexture( 'images/image-marker-265.png' );
        
        var loader = new THREE.TextureLoader();
        var textureFront = loader.load('images/image-marker-265.png');
        var textureBack = loader.load('images/image-marker-265.png');
        
        
        
        // material
        var material1 = new THREE.MeshBasicMaterial( { color: 0xffffff, map: textureFront } );
        var material2 = new THREE.MeshBasicMaterial( { color: 0xffffff, map: textureBack } );
        // CORS is a problem. Do this instead, so the Fiddle will run...
        //var material1 = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        //var material2 = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
        
        // mesh
        var meshFront = new THREE.Mesh( geometry1, material1 );
        var meshBack = new THREE.Mesh( geometry2, material2 );
       
       
        var cardHolder = new THREE.Object3D();
        sceneNew.add( cardHolder );
        
        // card
        var card1 = new THREE.Object3D();
        cardHolder.add( card1 );
        
        var card1Tex = new THREE.Object3D();
        card1Tex.add( meshFront );
        card1Tex.add( meshBack );
        card1.add(card1Tex);
         
        var marker1 = new Marker({pattern:[
                [1,0,1,1,1],
                [0,1,0,0,1],
                [1,0,0,0,0],
                [0,1,0,0,1],
                [1,0,1,1,1],
        ]});
        
        card1.add(marker1.marker3D);
         
        var meshFront2 = new THREE.Mesh( geometry1, material1 );
        var meshBack2 = new THREE.Mesh( geometry2, material2 ); 
         
         
        var card2 = new THREE.Object3D();
        cardHolder.add( card2 ); 
            
        var card2Tex = new THREE.Object3D();
        card2Tex.add( meshFront2 );
        card2Tex.add( meshBack2 );
        card2.add( card2Tex );
        
        card2.position.x = 50;
        
        
        var marker2 = new Marker({pattern:[
                [1,0,1,1,1],
                [1,0,0,0,0],
                [1,0,0,0,0],
                [0,1,0,0,1],
                [1,0,1,1,1],
        ]});
        
        card2.add(marker2.marker3D);
        
        
        
        
        
        
        
     
	domElement.style.zIndex = -1;
        domElement.style.position = 'absolute';

	this.domElement = domElement;
	
	domElement.binocularMode = function(){
		//domElement.style.left = '25%';	
	};
	domElement.normalMode = function(){
		//domElement.style.left = '50%';	
	};
	
	
	
        rendererNew.setClearColor("black",1);


        var controls = new THREE.TrackballControls( cameraNew );

	controls.rotateSpeed = 2.0;
	controls.zoomSpeed = 0.4;
	controls.panSpeed = 0.8;

	controls.noZoom = false;
	controls.noPan = false;

	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

        this.hasAnimation = true;

        this.animate = function() {
            
            //useTexture
            card1Tex.visible = this.useTextureBox.checked;
            marker1.marker3D.visible = !this.useTextureBox.checked;
            card2Tex.visible = this.useTextureBox.checked;
            marker2.marker3D.visible = !this.useTextureBox.checked;
            
            
            if(this.draw2Box.checked){
                card2.visible = true;
                card1.position.x = -50;
            }else{
                card2.visible = false; 
                card1.position.x = 0;
            }
            
            if(this.identically.checked){
                card2.rotation.z = 0;
                card2.scale.set(1,1,1);
            }else{
                card2.rotation.z = Math.PI/4;
                card2.scale.set(0.5,0.5,1);     
            }
            
            
            
            
            
            
            if(this.xBox.checked)cardHolder.rotation.x += 0.01;
            if(this.yBox.checked)cardHolder.rotation.y += 0.01;
            if(this.zBox.checked)cardHolder.rotation.z += 0.01;
            controls.update();
            
            
            if(this.reset.checked){
                cardHolder.rotation.x = 0;  
                cardHolder.rotation.y = 0;
                cardHolder.rotation.z = 0;
                
                cameraNew.position.x = 0;
                cameraNew.position.y = 0;
                cameraNew.position.z = 300;
                cameraNew.up.x = 0;
                cameraNew.up.y = 1;
                cameraNew.up.z = 0;
                cameraNew.lookAt( sceneNew.position );
            }
            
            rendererNew.render( sceneNew, cameraNew );
            
        };

	
        	
	
	this.domElement = domElement;
	
	
	
};
