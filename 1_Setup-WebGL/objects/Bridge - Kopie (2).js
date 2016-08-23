Bridge = function (options) {
    options = options || {};

    var path = options.path || [new Vector(0,0,0), new Vector(7,0,0)];

    if(true){
        path = [];
        var k=10, angle = Math.PI*2/k, rad=10;
        for(var i=0;i<k; i++){
            rad += (Math.random()-0.5)*4;
            //alert(rad);
            path.push(new Vector(
                Math.sin(i*angle)*rad,
                0,
                Math.cos(i*angle)*rad
            ));
        }
    }

    path.push(new Vector(0,0,2));


    var closePath = (options.closePath == true);

    closePath=true;

    var radius = options.radius || 2;
    var radiusX = options.radiusX || radius;
    var radiusY = options.radiusY || radius;
    var archHeight = options.archHeight || radiusY+0.5;
    if(archHeight<radiusY)archHeight = radiusY;

    var archParts = options.archParts || 10;
    var archWidth = options.archWidth || 0.5;
    var postWidth = options.postWidth || archWidth+1;
    var overlap = 0.2;
    var shareArchPoints = (options.shareArchPoints == true);

    var length = options.length || radiusX*2+1;
    var height = options.height || radiusY*2.5;
    var template = [];

    var archAngle = Math.PI/archParts;

    this.bridgeObject = new Object();

    //path test
    var pi, pl, pr, h;
    var n; //normal
    var creatDirection = new Vector(1,0,0);
    var hpw = postWidth/2;
    var pointAngle, topAngle;
    var topDownVector;
    var a,b,c, ba,bb,bc;
    var pi1,pi2,pi3,pi4;
    var iMethod;
    for(var i=0; i<path.length; i++){
        this.normals=[];this.textureCoords=[];this.vertices=[];this.colors=[];this.indices=[];
        pi = path[i]; pl = path[(path.length+i-1)%path.length]; pr = path[(i+1)%path.length];

        pointAngle = pi.getDifferenceVector(pl).getAngelBetween(pi.getDifferenceVector(pr));
        var pA = Math.round(pointAngle/Math.PI*180);
        if((((i==0)||(i==path.length-1))&&(!closePath))||(pA==180)||(pA==90)){
            pi.distanceToMiddle = hpw;
            pi.sidelengthTriangle = hpw;
        }else{
            //http://www.calculator.net/triangle-calculator.html
            //http://www.vitutor.com/geometry/vec/angle_vectors.html
            //b/sin(B) = a/sin(A) = c/sin(C)
            //pointAngle = pointAngle/180*Math.PI;
            topAngle = Math.PI/2 - pointAngle/2;
            c = hpw/Math.sin(pointAngle/2);
            b = hpw/Math.sin(pointAngle/2)*Math.sin(topAngle);
            a = hpw;
            bc = a*2;
            bb = bc/c*b;
            ba = bc/c*a;

            pi.distanceToMiddle = b;
            pi.sidelengthTriangle = bb;
            //alert(bb);
        }

        var j=0;
        for(var c=0;c<this.vertices.length/3/4;c++){
            if(iMethod==1)this.indices.push(j,j+1,j+2, j+1,j+2,j+3);
            if(iMethod==2)this.indices.push(j,j+1,j+2, j,j+2,j+3);
            j+=4;
        }
        for(var c=0;c<this.vertices.length/3;c++){
            this.colors.push(Math.random(),Math.random(),Math.random(),1);
        }

        pi.leftConnector = pi.getDifferenceVector(pl);
        pi.leftConnector.setLength(pi.distanceToMiddle)
        pi.leftConnector.addVector(pi);
        pi.rightConnector = pi.getDifferenceVector(pr);
        pi.rightConnector.setLength(pi.distanceToMiddle)
        pi.rightConnector.addVector(pi);
    }



    var bridgesAmount = path.length;
    if(!closePath)bridgesAmount--;
    for(var iBridge=0; iBridge<bridgesAmount; iBridge++){
        pi = path[iBridge]; pl = path[(path.length+iBridge-1)%path.length]; pr = path[(iBridge+1)%path.length];
        var bridgeVector = pi.rightConnector.getDifferenceVector(pr.leftConnector);
        length = bridgeVector.getLength();

        for(var i=0; i<=archParts; i++){
            var archPoint = new Vector(
                Math.cos(Math.PI-i*archAngle)*radiusX,
                Math.sin(archAngle*i)*radiusY + height - archHeight,
                0
            );
            template[i] = archPoint;
        }



        this.normals=[];this.textureCoords=[];this.vertices=[];this.colors=[];this.indices=[];

        var hw = archWidth/2;


        //bottom
        var j,sp=1;
        var normal;
        if(!shareArchPoints)sp=2;
        for(var i=0; i<template.length-1/2*sp; i++){
            normal = template[i].clone();
            normal.invert();
            for(var k=0;k<sp;k++){
                var p = template[i+k];
                if((sp==2)&&(k==0)){
                    normal.addVector(template[i+k].clone().invert())
                    normal.normalize();
                }
                this.vertices.push(p.x,p.y,p.z+hw);
                this.vertices.push(p.x,p.y,p.z-hw);
                this.normals.push(normal.x,normal.y,normal.z);
                this.normals.push(normal.x,normal.y,normal.z);
            }

            if(i<template.length-1){
                j=i*2*sp;
                this.indices.push(j,j+1,j+2);
                this.indices.push(j+1,j+3,j+2);
            }
        }

        var bottomAmount = this.vertices.length/3;

        //top and sides
        for(var i=0; i<template.length; i++){
            var p = template[i];
            this.vertices.push(p.x,p.y,p.z+hw);
            this.vertices.push(p.x,height,p.z+hw);
            this.vertices.push(p.x,height,p.z+hw);
            this.vertices.push(p.x,height,p.z-hw);
            this.vertices.push(p.x,height,p.z-hw);
            this.vertices.push(p.x,p.y,p.z-hw);

            this.normals.push(0,0,1,0,0,1, 0,1,0,0,1,0, 0,0,-1,0,0,-1);

            if(i<template.length-1){
                j=i*6+bottomAmount;
                for(var k=0;k<3;k++){
                  this.indices.push(j,j+1,j+6);
                  this.indices.push(j+1,j+7,j+6);
                  j+=2;
                }
            }
        }

        var archAmmount = this.vertices.length/3;

        //post template left (will be used for right too)
        var postTamplate = [];
        postTamplate.push(new Vector(-length/2,0,0));
        postTamplate.push(new Vector(-radiusX+overlap,0,0));
        postTamplate.push(new Vector(-radiusX,height-archHeight,0));
        postTamplate.push(new Vector(-radiusX,height,0));
        postTamplate.push(new Vector(-length/2,height,0));
        postTamplate.push(new Vector(-length/2,height-archHeight,0));


        //posts
        var hpw = postWidth/2;
        var j = archAmmount
        var p1,p2,pn;


        for(var k=-1;k<=1;k+=2){ //-1 left, 1 right

            for(var i=0;i<postTamplate.length;i++){
                p1 = postTamplate[i];
                p2 = postTamplate[(i+1)%postTamplate.length];
                pn = new Vector((p1.y-p2.y)*k,p1.x-p2.x,0);
                this.vertices.push(p1.x*k,p1.y,p1.z+hpw);
                this.vertices.push(p1.x*k,p1.y,p1.z-hpw);
                this.vertices.push(p2.x*k,p2.y,p2.z+hpw);
                this.vertices.push(p2.x*k,p2.y,p2.z-hpw);
                for(c=0;c<4;c++)this.normals.push(pn.x,pn.y,pn.z);
                this.indices.push(j,j+1,j+2);
                this.indices.push(j+1,j+2,j+3);
                j+=4;
            }

            for(var h=1;h>=-1;h-=2){
                for(var i=0;i<postTamplate.length;i++){
                    p1 = postTamplate[i];
                    this.vertices.push(p1.x*k,p1.y,p1.z+hpw*h);
                    this.normals.push(0,0,h);
                }
                this.indices.push(j,j+1,j+2);
                this.indices.push(j,j+2,j+5);
                this.indices.push(j+5,j+2,j+3);
                this.indices.push(j+5,j+3,j+4);
                j+=6;
            }
        }
        j=this.vertices.length/3;

        //post triangle addition
        var bridgeAngle = creatDirection.getAngelBetween(bridgeVector);
        if(pi.rightConnector.z<pr.leftConnector.z){bridgeAngle*=-1;}


        /*
        for(var k=-1;k<=1;k+=2){//left right addition
            if(pi.sidelengthTriangle){

                var fob = 1; //front or back 1=front -1=back  (fob*hpw=front)

                var addLeftFront = pi.sidelengthTriangle;
                var addRightFront = 0;
                var addLeftBack = 0;
                var addRightBack = 0;
                var addFront = 0, addBack = 0;
                this.vertices.push((length/2+addLeftFront)*k,0,fob*hpw);
                this.vertices.push((length/2)*k,0,fob*hpw);
                this.vertices.push((length/2+addLeftFront)*k,height,fob*hpw);
                this.vertices.push((length/2)*k,height,fob*hpw);
                this.normals.push(0,0,1);
                this.indices.push(j,j+1,j+2,  j+1, j+2, j+3); j+=4;

                this.vertices.push((length/2)*k,height,fob*hpw);
                this.vertices.push((length/2+addLeftFront)*k,height,fob*hpw);
                this.vertices.push((length/2)*k,height,-fob*hpw);
                this.normals.push(0,1,0);
                this.indices.push(j,j+1,j+2);  j+=3;


                this.vertices.push((length/2)*k,0,fob*hpw);
                this.vertices.push((length/2+addLeftFront)*k,0,fob*hpw);
                this.vertices.push((length/2)*k,0,-fob*hpw);
                this.normals.push(0,-1,0);
                this.indices.push(j,j+1,j+2); j+=3;

            }
        }
        */


        //colors
        for(var c=0;c<this.vertices.length/3;c++){
                //this.colors.push(0.5,0.5,0.5,1);
                this.colors.push(Math.random(),Math.random(),Math.random(),1);
        }







        var model = new Object("preloaded",{
                    vertices:this.vertices,
                    normals:this.normals,
                    colors:this.colors,
                    indices:this.indices
                })
        var parts = [];
        model.translate({x:length/2});
        model.rotate({y:bridgeAngle/Math.PI*180});
        model.translate({x:pi.rightConnector.x,z:pi.rightConnector.z});
        this.bridgeObject.addChild(model);
    }


    this.getObject = function(){
        return this.bridgeObject;
    };
};