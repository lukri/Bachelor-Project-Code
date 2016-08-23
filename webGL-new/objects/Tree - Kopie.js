//google: fractal tree
//http://rosettacode.org/wiki/Fractal_tree#JavaScript


Tree = function (options) {
    options = options || {};
    var depth = options.depth || 6;
    var factor = 1/depth;
    var maxZAngle = 20;
    var circleN = 10;
    var cirlceAngle = Math.PI*2/(circleN);

    var radius = 0.5;
    var lenght = 1;


    var degToRad = Math.PI / 180.0;

    var vertices=[],normals=[],textureCoords=[],colors=[],indices=[];

    var object = new Object();

    var startNewObjectPart = function(){
        var part = new Object("preloaded",{
                    vertices:vertices,
                    normals:normals,
                    colors:colors,
                    indices:indices
        });
        object.addChild(part);
        vertices=[],normals=[],textureCoords=[],colors=[],indices=[];
    }


    //turn vector around line
    //http://www.blitzbasic.com/Community/posts.php?topic=57616
    //turn point orthogonal around line
    //http://inside.mines.edu/fs_home/gmurray/ArbitraryAxisRotation/
    //Rotate the point p1 a degrees around the vector p2
    rotatePointAroundVector = function(p1,p2,a){
        p2.normalize();
        var x = p1.x, y = p1.y, z = p1.z, u = p2.x, v = p2.y, w=p2.z;
        var sa = Math.sin(a*degToRad);
        var ca = Math.cos(a*degToRad);
        /*return new Vector(
            u*(u*x+v*y+w*z)+(x*(v*v+w*w)-u*(v*y+w*z))*ca+(-w*y+v*z)*sa,
            v*(u*x+v*y+w*z)+(y*(u*u+w*w)-v*(u*x+w*z))*ca+(w*x-u*z)*sa,
            w*(u*x+v*y+w*z)+(z*(u*u+v*v)-w*(u*x+v*y))*ca+(-v*x+u*y)*sa
        ) */

        return new Vector(
            u*(u*x+v*y+w*z)*(1-ca)+x*ca+(-w*y+v*z)*sa,
            v*(u*x+v*y+w*z)*(1-ca)+y*ca+(w*x-v*z)*sa,
            w*(u*x+v*y+w*z)*(1-ca)+z*ca+(-v*x+v*z)*sa
        )
    }



    drawSecment = function(startP,zAngle,turnV,turnAngle,depth){

        var endP = new Vector(0,1,0);
        endP.rotateAroundZ(zAngle*degToRad);
        endP.setLength(depth*factor*length);
        endP.addVector(startP);
        //endP = rotatePointAroundVector(endP,turnV,turnAngle);
        //endP.setLength(depth*factor*length);
        //endP.addVector(startP);
        var j=vertices.length/3;
        //65536 = 2^16
        if(j+circleN*2>65536){
            startNewObjectPart();
            j=0;
        }


        for(var i=0;i<circleN;i++){
            var p = new Vector(
                            Math.cos(cirlceAngle*i),
                            0,
                            Math.sin(cirlceAngle*i)
                        );

            p.rotateAroundZ(zAngle*degToRad);
            //p = rotatePointAroundVector(p,turnV,turnAngle);
            var sP = p.clone({length:depth*factor*radius});
            sP.addVector(startP);
            var eP = p.clone({length:(depth-1)*factor*radius});
            eP.addVector(endP);
            vertices.push(sP.x,sP.y,sP.z,eP.x,eP.y,eP.z);
            normals.push(p.x,p.y,p.z,p.x,p.y,p.z);
            if(depth==1){
                colors.push(0.1,2,0.2,1,  0.1,2,0.2,1);
            }else{
                var r = Math.random()+0.5;
                colors.push(r,r/2,0,1);
                colors.push(r,r/2,0,1);
            }
            indices.push(j+i*2,j+i*2+1,j+(i*2+2)%(circleN*2));
            indices.push(j+i*2+1,j+(i*2+2)%(circleN*2),j+(i*2+3)%(circleN*2));
        }
        return endP;
    }

    createTree = function(startP,zAngle,turnV,turnAngle,depth){
        if(depth==0)return;
        var endP = drawSecment(startP,zAngle,turnV,turnAngle,depth);
        turnAngle = 90;//Math.random()*0;
        turnV = endP.getDifferenceVector(startP);
        var lrb = Math.random();
        if((lrb>=0.1)&&(lrb<=0.9))lrb=0.5;  // 0=left, 0.5=both, 1=right
        //lrb=0.5;
        if(lrb<=0.5)createTree(endP,zAngle+20,turnV,-turnAngle,depth-1);
        if(lrb>=0.5)createTree(endP,zAngle-20,turnV,+turnAngle,depth-1);
    }


    //init tree
    var startP = new Vector();
    createTree(startP, 0, new Vector(0,1,0),0, depth);

    startNewObjectPart();

    this.getObject = function(){
        return object;
    };



};