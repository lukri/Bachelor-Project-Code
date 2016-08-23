//add controls
var speed = 1;
var controlbox = document.getElementById("controls");
controlbox.innerHTML += '<button onclick="changeSpeed(-1)">-</button>';
controlbox.innerHTML += '<button onclick="resetSpeed()">0</button>';
controlbox.innerHTML += '<button onclick="changeSpeed(1)">+</button>';
var caption = document.createElement("span");
controlbox.appendChild(caption);
changeSpeed(0);
function changeSpeed(value){
    speed += value;
    caption.innerHTML = "Speed: "+speed;
}
function resetSpeed(value){
    speed = 0;
    if(value)speed=value;
    changeSpeed(0);
}


var firstTime = true;
var date, milsec, lastTime=0, timeNow=0, elapsed=0;
function animate() {
        if(firstTime){
            addInfo("anim-loaded");
            firstTime = false;
        }
        requestAnimationFrame( animate );

        /* trick to get more or less same rate and results on every machine */
        date = new Date();
        milsec = date.getMilliseconds();
        timeNow = date.getTime();
        if (lastTime !== 0) {elapsed = timeNow - lastTime}
        lastTime = timeNow;
        

        //mesh.rotation.x += 0.01;
        mesh.rotation.y += elapsed/1000*speed;

        if(man){   //make sure object already exists
            man.rotation.y += elapsed/1000*speed;
            //man.scale.y = Math.abs(Math.cos(milsec/10));
        }

        renderer.render( scene, camera );

}