Bridge = function (options) {
    options = options || {};

    var path = options.path || [new Vector(-6,0,-5), new Vector(0,0,0), new Vector(6,0,0)];
    var closePath = (options.closePath == true);


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
    var c; //hypotenuse
    var pi1,pi2,pi3,pi4;
    var iMethod;
    for(var i=0; i<path.length; i++){
        this.normals=[];this.textureCoords=[];this.vertices=[];this.colors=[];this.indices=[];
        pi = path[i]; pl = path[(path.length+i-1)%path.length]; pr = path[(i+1)%path.length];

        pointAngle = pi.getDifferenceVector(pl).getAngelBetween(pi.getDifferenceVector(pr));
        console.log(pointAngle/Math.PI*180);
        if((((i==0)||(i==path.length-1))&&(!closePath))||(pointAngle==Math.PI)||(pointAngle==Math.PI/2)){
            h=0
            for(var k=-1;k<=1;k+=2){
                this.vertices.push(-hpw,h,hpw, hpw,h,hpw, -hpw,h,-hpw, hpw,h,-hpw);
                this.normals.push(0,k,0, 0,k,0, 0,k,0, 0,k,0);
                h=height;
            }
            for(var k=-1;k<=1;k+=2){
                this.vertices.push(hpw*k,0,-hpw, hpw*k,0,hpw, hpw*k,h,-hpw, hpw*k,h,hpw);
                this.normals.push(k,0,0, k,0,0, k,0,0, k,0,0);
            }
            for(var k=-1;k<=1;k+=2){
                this.vertices.push(hpw,0,hpw*k, -hpw,0,hpw*k, hpw,h,hpw*k, -hpw,h,hpw*k);
                this.normals.push(0,0,k, 0,0,k, 0,0,k, 0,0,k);
            }
            pi.distanceToMiddle = hpw;
            if(i==path.length-1){
                pi.rotate = creatDirection.getAngelBetween(pl.getDifferenceVector(pi));
            }else{
                pi.rotate = -creatDirection.getAngelBetween(pi.getDifferenceVector(pr));
            }

            iMethod = 1;
        }else{
            //http://www.calculator.net/triangle-calculator.html
            //http://www.vitutor.com/geometry/vec/angle_vectors.html
            //b/sin(B) = a/sin(A) = c/sin(C)
            topAngle = Math.PI/2 - pointAngle/2;
            c = hpw/Math.sin(pointAngle/2);
            topDownVector = new Vector(0,0,postWidth);
            topDownVector.rotateAroundY(topAngle);

            pi.distanceToMiddle = 1;

            pi1 = new Vector(0,0,-c);
            pi2 = new Vector(topDownVector.x,0,topDownVector.z-c)
            pi3 = new Vector(0,0,c);
            pi4 = new Vector(-topDownVector.x,0,topDownVector.z-c);
            h=0;
            for(var k=-1;k<=1;k+=2){
              this.vertices.push(pi1.x,h,pi1.z,  pi2.x,h,pi2.z,  pi3.x,h,pi3.z,  pi4.x,h,pi4.z);
              this.normals.push(0,k,0, 0,k,0, 0,k,0, 0,k,0);
              h=height;
            }

            n = pi.getDifferenceVector(pr); n.normalize();
            this.vertices.push(pi1.x,0,pi1.z,  pi2.x,0,pi2.z,  pi2.x,h,pi2.z,  pi1.x,h,pi1.z);
            this.normals.push(n.x,n.y,n.z,n.x,n.y,n.z,n.x,n.y,n.z,n.x,n.y,n.z);

            n.rotateAroundY(-Math.PI/2);
            this.vertices.push(pi2.x,0,pi2.z,  pi3.x,0,pi3.z,  pi3.x,h,pi3.z,  pi2.x,h,pi2.z);
            this.normals.push(n.x,n.y,n.z,n.x,n.y,n.z,n.x,n.y,n.z,n.x,n.y,n.z);

            n = pi.getDifferenceVector(pl); n.normalize();
            this.vertices.push(pi4.x,0,pi4.z,  pi1.x,0,pi1.z,  pi1.x,h,pi1.z,  pi4.x,h,pi4.z);
            this.normals.push(n.x,n.y,n.z,n.x,n.y,n.z,n.x,n.y,n.z,n.x,n.y,n.z);

            n.rotateAroundY(Math.PI/2);
            this.vertices.push(pi3.x,0,pi3.z,  pi4.x,0,pi4.z,  pi4.x,h,pi4.z,  pi3.x,h,pi3.z);
            this.normals.push(n.x,n.y,n.z,n.x,n.y,n.z,n.x,n.y,n.z,n.x,n.y,n.z);



            var relationVector = new Vector(0,0,-c);
            var realVector = pl.getDifferenceVector(pr);
            realVector.divide(2);
            realVector.addVector(pl);
            console.log(realVector);
            pi.rotate = relationVector.getAngelBetween(pi.getDifferenceVector(realVector));

            if(pl.x>pr.x)pi.rotate += Math.PI;
            if(pl.z<pr.z)pi.rotate *= -1;

            iMethod = 2;
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

        var model = new Object("preloaded",{
                vertices:this.vertices,
                normals:this.normals,
                colors:this.colors,
                indices:this.indices
        })
        model.rotate({y:pi.rotate/Math.PI*180});
        model.translate({x:pi.x,z:pi.z});
        this.bridgeObject.addChild(model);
    }








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

    parts[0]=new Object();
    parts[0].addChild(model);
    parts[1]=new Object();
    parts[1].addChild(model);


    parts[1].translate({x:length/2});
    parts[1].rotate({y:90});
    parts[1].translate({x:length/2+postWidth/2,z:-postWidth/2})


    for(var i=0;i<parts.length;i++){
        //this.bridgeObject.addChild(parts[i]);
    }


    this.getObject = function(){
        return this.bridgeObject;
    };
};