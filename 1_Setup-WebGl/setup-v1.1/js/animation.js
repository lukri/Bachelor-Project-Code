var firstTime = true;
function animate() {
        if(firstTime){
            addInfo("cs-v-2");
            firstTime = false;
        }
        
        
        
        requestAnimationFrame( animate );

        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.02;
        
        if(man){
            man.rotation.y += 0.02;
        }

        renderer.render( scene, camera );

}