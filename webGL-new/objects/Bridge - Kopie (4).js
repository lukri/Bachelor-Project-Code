Bridge = function (options) {
    options = options || {};

    var path = options.path || [new Vector(-3,0,0), new Vector(3,0,0)];
    var closePath = (options.closePath == true);
    var shareArchPoints = (options.shareArchPoints != false);
    var archHeight = options.archHeight || 2;
    var archWidth = options.archWidth || 0.5;
    var postWidth = options.postWidth || archWidth+0.3;
    var postLength = options.postLength || 0.5;

    var radius = options.radius || 1.5;
    var radiusX = options.radiusX || radius;
    var radiusY = options.radiusY || radius;



    var archParts = options.archParts || 10;

    var overlap = 0.2;



    var template = [];

    var archAngle = Math.PI/archParts;

    this.bridgeObject = new Object();

    //path test
    var pi,piy0, ply0, pry0, h;
    var n; //normal
    var creatDirection = new Vector(1,0,0);
    var hpw = postWidth/2;
    var pointAngle, topAngle;
    var topDownVector;
    var a,b,c;
    var iMethod;

    for(var i=0; i<path.length; i++){
        this.normals=[];this.textureCoords=[];this.vertices=[];this.colors=[];this.indices=[];
        pi = path[i]; piy0 = path[i].clone({y:0}); ply0 = path[(path.length+i-1)%path.length].clone({y:0}); pry0 = path[(i+1)%path.length].clone({y:0});
        var height = pi.y;

        pointAngle = piy0.getDifferenceVector(ply0).getAngelBetween(piy0.getDifferenceVector(pry0));
        var pA = Math.round(pointAngle/Math.PI*180);
        if((((i==0)||(i==path.length-1))&&(!closePath))||(pA==180)){
            pi.distanceToMiddle = 0;
        }else{
            topAngle = Math.PI/2 - pointAngle/2;
            c = hpw/Math.sin(pointAngle/2);
            b = hpw/Math.sin(pointAngle/2)*Math.sin(topAngle);
            a = hpw;

            pi.distanceToMiddle = b;


            //roundpost
            var postTemplate = [];
            var p = Math.round((Math.PI-pointAngle)/Math.PI*180*4);
            var PostAngle = (Math.PI-pointAngle)/p;
            for(var k=0;k<=p;k++){
                postTemplate.push(new Vector(
                    -Math.sin(k*PostAngle)*postWidth,
                    0,
                    Math.cos(k*PostAngle)*postWidth

                ));
            }

            this.normals=[];this.textureCoords=[];this.vertices=[];this.colors=[];this.indices=[];
            var j=0;
            for(var h=0;h<2;h++){
                this.vertices.push(0,h*height,0);
                this.normals.push(0,-1+(h*2),0);
                for(var k=0; k<postTemplate.length;k++){
                    var v=postTemplate[k];
                    this.vertices.push(v.x,h*height,v.z);
                    this.normals.push(0,-1+(h*2),0);
                    if(k<postTemplate.length-1)
                        this.indices.push(j,k+1+j,k+2+j);
                }
                j=this.vertices.length/3;
            }
            for(var k=0; k<postTemplate.length;k++){
                var v=postTemplate[k];
                this.vertices.push(v.x,0,v.z,   v.x,height,v.z);
                this.normals.push(v.x,0,v.z,   v.x,0,v.z);
                if(k<postTemplate.length-1){
                    this.indices.push(k+j,k+1+j,k+2+j);
                    this.indices.push(k+1+j,k+2+j,k+3+j);
                    j++;
                }
            }

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

            var leftV = piy0.getDifferenceVector(ply0);
            var rightV = piy0.getDifferenceVector(pry0);
            leftV.setLength(10);
            rightV.setLength(10);
            var middleV = leftV.getDifferenceVector(rightV);
            middleV.divide(2);
            middleV.addVector(leftV);
            middleV.setLength(10);
            var pointDirection = new Vector(10,0,0);
            var rotationAngle = middleV.getAngelBetween(pointDirection);
            if(middleV.z<=0)rotationAngle *= -1;

            model.translate({x:b,z:-hpw});
            model.rotate({y:(-pointAngle/2)/Math.PI*180});
            model.rotate({y:-rotationAngle/Math.PI*180});
            model.translate({x:pi.x,z:pi.z});
            this.bridgeObject.addChild(model);
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

        var iToLV = piy0.getDifferenceVector(ply0);
        iToLV.setLength(pi.distanceToMiddle);
        pi.leftConnector = iToLV.clone();
        pi.leftConnector.addVector(pi);
        iToLV.setLength(pi.distanceToMiddle+postLength);
        pi.leftLeftConnector = iToLV.clone();
        pi.leftLeftConnector.addVector(pi);
        var iToRV = piy0.getDifferenceVector(pry0);
        iToRV.setLength(pi.distanceToMiddle);
        pi.rightConnector = iToRV.clone();
        pi.rightConnector.addVector(pi);
        iToRV.setLength(pi.distanceToMiddle+postLength);
        pi.rightRightConnector = iToRV.clone();
        pi.rightRightConnector.addVector(pi);
    }

//---actual brigde-----------------------------------------------------------------------------------------------------

    var bridgesAmount = path.length;
    if(!closePath)bridgesAmount--;
    for(var ib=0; ib<bridgesAmount; ib++){
        pi = path[ib]; pr = path[(ib+1)%path.length];
        var height = pi.y;
        var yDiff = pr.y - pi.y;
        var bridgeVector = pi.rightConnector.clone({y:0}).getDifferenceVector(pr.leftConnector.clone({y:0}));

        length = bridgeVector.getLength();
        radiusX = (length - 2*postLength)/2;
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
        var addY=0;
        var archLength = template[template.length-1].x-template[0].x;
        var heightFactor = yDiff/archLength;
        if(!shareArchPoints)sp=2;
        for(var i=0; i<template.length-1/2*sp; i++){
            addY = (p.x+archLength/2)*heightFactor;
            normal = template[i].clone();
            normal.invert();
            for(var k=0;k<sp;k++){
                var p = template[i+k];
                if((sp==2)&&(k==0)){
                    normal.addVector(template[i+k].clone().invert())
                    normal.normalize();
                }
                this.vertices.push(p.x,p.y+addY,p.z+hw);
                this.vertices.push(p.x,p.y+addY,p.z-hw);
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

        var tn = new Vector(-yDiff,archLength,0); // top normal
        tn.normalize();
        //top and sides
        for(var i=0; i<template.length; i++){
            var p = template[i];
            addY = (p.x+archLength/2)*heightFactor;
            this.vertices.push(p.x,p.y+addY,p.z+hw);
            this.vertices.push(p.x,height+addY,p.z+hw);
            this.vertices.push(p.x,height+addY,p.z+hw);
            this.vertices.push(p.x,height+addY,p.z-hw);
            this.vertices.push(p.x,height+addY,p.z-hw);
            this.vertices.push(p.x,p.y+addY,p.z-hw);

            this.normals.push(
                0,0,1,0,0,1,
                tn.x,tn.y,tn.z,tn.x,tn.y,tn.z,
                0,0,-1,0,0,-1);

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

        //post template
        var postTamplatePi = [];
        postTamplatePi.push(new Vector(-length/2,0,0));
        postTamplatePi.push(new Vector(-radiusX+overlap,0,0));
        postTamplatePi.push(new Vector(-radiusX,pi.y-archHeight,0));
        postTamplatePi.push(new Vector(-radiusX,pi.y,0));
        postTamplatePi.push(new Vector(-length/2,pi.y,0));
        postTamplatePi.push(new Vector(-length/2,pi.y-archHeight,0));

        var postTamplatePr = [];
        postTamplatePr.push(new Vector(-length/2,0,0));
        postTamplatePr.push(new Vector(-radiusX+overlap,0,0));
        postTamplatePr.push(new Vector(-radiusX,pr.y-archHeight,0));
        postTamplatePr.push(new Vector(-radiusX,pr.y,0));
        postTamplatePr.push(new Vector(-length/2,pr.y,0));
        postTamplatePr.push(new Vector(-length/2,pr.y-archHeight,0));

        var postTamplate = postTamplatePr;
        //posts
        var hpw = postWidth/2;
        var j = archAmmount
        var p1,p2,pn;

        var addHeight = yDiff+0;
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
            for(var i=0;i<postTamplate.length;i++){
                if(postTemplate[i].y!=0){
                    postTamplate[i]=new Vector();
                }
            }
            var postTamplate = postTamplatePi;
        }
        j=this.vertices.length/3;



        //colors
        for(var c=0;c<this.vertices.length/3;c++){
                //this.colors.push(0.5,0.5,0.5,1);
                this.colors.push(Math.random(),Math.random(),Math.random(),1);
        }

        //post triangle addition
        var bridgeAngle = creatDirection.getAngelBetween(bridgeVector);
        if(pi.rightConnector.z<pr.leftConnector.z){bridgeAngle*=-1;}





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