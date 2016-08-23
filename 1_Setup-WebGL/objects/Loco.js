var Loco = function (options) {
    options = options || {};
    var scale = options.scale || 1;
    var startPosition = options.startPosition || {x:0,y:0,z:0};
    var initialSpeed = 0.01*scale;
    var locoSpeed = initialSpeed;
    var maxSpeed = 0.7*scale;
    var accelerate = false;
    var accelerateRate = 0.001*scale;
    var gear = 0;

    var path = null;




    var locoPlace = new Obj();
    var locoGrounding = new Obj();
    var loco = new Obj();
    //loco.shader = shaderHanlder.getShader("color-shader");
    var wheel = new Obj("cylinder");
    //wheel = new Obj("revolution");


    var axleTemplate = new Obj("cylinder",{
        radius:0.048,
        height:0.6});
    axleTemplate.rotate({x:90});

    var wheelRadius = 0.2;
    var wheelTemplate = new Obj("cylinder",{
        radius:wheelRadius,
        innerRadius:0.05,
        height:0.1});
    wheelTemplate.rotate({x:90});


    var tank = new Obj("cylinder",{radius:0.22,height:0.8});
    tank.rotate({z:90});
    tank.translate({y:0.25,x:-0.22});

    var base = new Obj("cuboid", {x:1.3,y:0.12,z:0.48});
    base.translate({y:0.05});
    base.vTexBuffer = null;

    var cabin = new Obj("cuboid", {x:0.5,y:0.7,z:0.48});
    cabin.translate({y:0.45, x:0.38});
    cabin.vTexBuffer = null;

    var funnel = new Obj("revolution",{
        form:[new Vector(0.4,1),new Vector(0.8,1.5),new Vector(0.8,2),new Vector(1,2),new Vector(1,1.5),new Vector(0.5,1),new Vector(0.5,0),new Vector(0.4,0)],
        scale:0.2,});
    funnel.translate({x:-0.3,y:0.4});
    //funnel.shader =  shaderHanlder.getShader("color-shader");

    var axleF = new Obj();
    axleF.translate({x:-0.5});
    axleF.addChild(axleTemplate);

    var axleB = new Obj();
    axleB.translate({x:0.5});
    axleB.addChild(axleTemplate);

    var wheelFL = new Obj();
    wheelFL.translate({x:-0.5,z:0.3});
    wheelFL.addChild(wheelTemplate);
    var wheelFR = new Obj();
    wheelFR.translate({x:-0.5,z:-0.3});
    wheelFR.addChild(wheelTemplate);
    var wheelBL = new Obj();
    wheelBL.translate({x:0.5,z:0.3});
    wheelBL.addChild(wheelTemplate);
    var wheelBR = new Obj();
    wheelBR.translate({x:0.5,z:-0.3});
    wheelBR.addChild(wheelTemplate);


    //wheel.texture = textureHanlder.getTexture("moon");

    //wheel.rotate({x:45});

    loco.addChild(base);
    loco.addChild(tank);
    loco.addChild(cabin);
    loco.addChild(funnel);

    loco.addChild(axleF);
    loco.addChild(axleB);


    loco.addChild(wheelFL);
    loco.addChild(wheelFR);
    loco.addChild(wheelBL);
    loco.addChild(wheelBR);


    loco.scale({xyz:scale});
    locoGrounding.addChild(loco);
    locoGrounding.translate({y:(wheelRadius-0.01)*scale});
    locoPlace.addChild(locoGrounding);
    locoPlace.translate({
        x:startPosition.x||0,
        y:startPosition.y||0,
        z:startPosition.z||0
    });

    var locoDirectionVector = new Vector(-1,0,0);


    this.getObject = function(){
        return locoPlace;
    };

    this.rotate = function(angle){
        loco.rotate({y:angle});
        locoDirectionVector.rotateAroundY(angle,{degToRad:true});
    };

    this.steer = function(direction){
        var d=0;
        if(direction=="left")d=1;
        if(direction=="right")d=-1;
        if(gear){
            this.rotate(d*1*gear);
        }
    };

    this.stop = function(){
        gear=0;
    };
    this.controlSpeed = function(){
        if(accelerate){
            if(locoSpeed<maxSpeed)locoSpeed += accelerateRate;
            accelerate=false;
        }else{
            locoSpeed = initialSpeed;
        }
    };

    this.drive=function(direction){
        accelerate = true;
        if(direction=="forward")gear = 1;
        if(direction=="backward")gear = -1;
        var lDV = locoDirectionVector;
        locoPlace.translate({x:lDV.x*gear*locoSpeed,z:lDV.z*gear*locoSpeed});
    };


    this.setAnimationPath = function(pathToSet){
        path = pathToSet;
        var start = path[0].rightConnector;
        locoPlace.translate({x:start.x,y:start.y,z:start.z});
    };

    var animationSpeed = 0.02;
    var animationV;
    var orientationV = new Vector(1,0,0);
    var angleY = 0;
    var angleZ = 0;
    var nextPoint = 1;
    var nextPointV;
    var leftMiddleRight = 0;
    var actualPos = new Vector();
    var pTM = locoPlace.transformMatrix;
    loco.saveMatrix();
    var lTM = loco.transformMatrix;
    var wheelRotation = 0;
    this.animate = function(){
        actualPos.x = pTM[12];
        actualPos.y = pTM[13];
        actualPos.z = pTM[14];

        if(leftMiddleRight==0)nextPointV = path[nextPoint].leftLeftConnector;
        if(leftMiddleRight==1)nextPointV = path[nextPoint].leftConnector;
        if(leftMiddleRight==2)nextPointV = path[nextPoint].rightConnector;
        if(leftMiddleRight==3)nextPointV = path[nextPoint].rightRightConnector;

        animationV = actualPos.getDifferenceVector(nextPointV);
        if(animationV.getLength()>animationSpeed){
            animationV.setLength(animationSpeed);
        }else{
            leftMiddleRight = (++leftMiddleRight)%4;
            if(leftMiddleRight==0)
                nextPoint = (++nextPoint+path.length)%path.length;
        }
        angleY = animationV.clone({y:0}).getAngelBetween(orientationV);
        if(animationV.z>0)angleY *= -1;
        angleY += Math.PI;
        angleZ = Math.asin(-animationV.clone({x:1,z:0, length:1}).y*50);
        loco.reset();
        loco.rotate({y:angleY/Math.PI*180, z:angleZ/Math.PI*180});

        wheelRotation = animationV.getLength()/(wheelRadius*2*Math.PI)*360;

        wheelTemplate.rotate({z:wheelRotation});
        locoPlace.translate({x:animationV.x,y:animationV.y,z:animationV.z});
        //camera.translate({x:animationV.x,y:animationV.y,z:animationV.z});
    };
    
    this.getPosition = function(){
        return {x:pTM[12],y:pTM[13],z:pTM[14]};  
    };


};