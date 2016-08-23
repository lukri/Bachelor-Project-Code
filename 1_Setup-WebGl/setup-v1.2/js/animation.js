var firstTime = true;
var date, milsec, lastTime=0, timeNow, elapsed;
function animate() {
        if(firstTime){
            addInfo("anim-v-1");
            firstTime = false;
        }
        requestAnimationFrame( animate );

        /* trick to get more or less same rate and results on every machine */
        date = new Date();
        milsec = date.getMilliseconds();
        timeNow = date.getTime();
        if (lastTime !== 0) {elapsed = timeNow - lastTime}
        lastTime = timeNow;
        

        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.02;
        
        if(man){   //make sure object already exists
            man.rotation.y += elapsed/1000;
            //man.scale.y = Math.abs(Math.cos(milsec/10));
        }

        renderer.render( scene, camera );

}