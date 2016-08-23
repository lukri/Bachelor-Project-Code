Terrain = function (options) {
    console.log("start terrain");
    options = options || {};
    var sideLength = options.sideLength || 4;
    var n = options.resolution || 8;
    n = Math.pow(2,n)+1;


    var randomRange = options.randomRange || 2;
    if(options.randomRange==0)randomRange=0;

    var repeatX = options.repeatX || 1;
    var repeatZ = options.repeatZ || 1;
    var drawGrid = (options.drawGrid>0);
    var gridSize = Math.round(options.drawGrid);


    var nX = n*repeatX;
    var nZ = n*repeatZ;


    //object can have 2^16 vertices
    var maxN = 256; //x^2 = 2^16 -> x=2^8=256
    var pZn,pXn;
    this.terrainObject = new Object();
    var drawObjectGrid = (options.drawObjectGrid == true);


    var grid = new Array(nZ);
    for (var i = 0; i < grid.length; i++) {
        grid[i] = new Array(nX);
    }
    for(var z=0;z<nZ;z++){
        for(var x=0;x<nX;x++){
            grid[z][x] = new Vector();
        }
    }
    /*
    grid[0][0] = new Vector({y:0});
    grid[0][m] = new Vector({y:0});
    grid[m][0] = new Vector({y:0});
    grid[m][m] = new Vector({y:0});
    */

    /*
      0,0......0,x
      .          .
      .          .
      z,0......z,x
    */







    var check = function(array, z, x, options){
        options = options || {};
        var zlength = options.length || array.length;
        var xlength = options.length || array[0].length;
        var zShift = options.zShift || 0;
        var xShift = options.xShift || 0;
        if(z<(zShift))return null;
        if(z>=(zlength+zShift))return null;
        if(x<(xShift))return null;
        if(x>=(xlength+xShift))return null;
        if(array[z][x])return array[z][x];
        return "isEmpty";
    }





    setAverageNormalAlt = function(grid, z, x){
        var mVector = grid[z][x];
        var normal = new Vector();
        var surroundVector, lineNormal,a,b,angleY,angleZ;
        var count = 0;
        for(var k=z-1;k<=z+1;k++){
            for(var i=x-1;i<=x+1;i++){
                if(!((k==z)&&(i==x)))
                    if(surroundVector = check(grid,k,i)){
                        lineNormal = surroundVector.getDifferenceVector(mVector);
                        a = mVector.x-surroundVector.x;
                        b = mVector.z-surroundVector.z;
                        angleY = Math.atan(b/a);
                        lineNormal.rotateAroundY(angleY);
                        angleZ = Math.PI/2;
                        if(a<0)angleZ*=-1;
                        lineNormal.rotateAroundZ(angleZ);
                        lineNormal.rotateAroundY(-angleY);
                        lineNormal.normalize();
                        normal.addVector(lineNormal);
                        count++;
                    };
            }
        }
        if(count>0)normal.divide(count);
        normal.normalize();
        if(normal.y<0)normal.invert();
        mVector.nx = normal.x;
        mVector.ny = normal.y;
        mVector.nz = normal.z;
    };


    setAverageNormal = function(grid, z, x){
        var v = grid[z][x];
        var normal = new Vector();
        normal.addVector(v.getAreaNormal(check(grid,z-1,x-1),check(grid,z-1,x)));
        normal.addVector(v.getAreaNormal(check(grid,z-1,x),check(grid,z,x+1)));
        normal.addVector(v.getAreaNormal(check(grid,z,x+1),check(grid,z+1,x+1)));
        normal.addVector(v.getAreaNormal(check(grid,z+1,x+1),check(grid,z+1,x)));
        normal.addVector(v.getAreaNormal(check(grid,z+1,x),check(grid,z,x-1)));
        normal.addVector(v.getAreaNormal(check(grid,z,x-1),check(grid,z-1,x-1)));
        normal.normalize();
        v.nx = normal.x;
        v.ny = normal.y;
        v.nz = normal.z;
    }



    //start

    console.log("\t generate terrain");
    var o = {};
    o.length = n;
    var step, hs; //half step
    var rR; //randomRange
    for(var repZ=0;repZ<repeatZ;repZ++){
        for(var repX=0;repX<repeatX;repX++){
            console.log("\t\t field z:"+repZ+" x:"+repX);
            o.xShift = n*repX;
            o.zShift = n*repZ;
            step = n-1;
            hs = step/2;
            rR = randomRange;

            while(step>=2){
                for(var z=o.zShift;z<(n+o.zShift);z+=step){
                    for(var x=o.xShift;x<(n+o.xShift);x+=step){

                        //square
                        if(check(grid,z+hs,x+hs,o)&&!grid[z+hs][x+hs].isSet){
                            var vMiddle = grid[z+hs][x+hs];
                            vMiddle.setYAverage([
                                grid[z][x],
                                grid[z][x+step],
                                grid[z+step][x],
                                grid[z+step][x+step]
                            ]);
                            vMiddle.y += (Math.random()-0.5)*rR;
                        }

                        //diamond
                        if(check(grid,z,x+hs,o)&&!grid[z][x+hs].isSet){
                            var vRight = grid[z][x+hs];
                            vRight.setYAverage([
                                grid[z][x],
                                grid[z][x+step],
                                check(grid,z-hs,x+hs,o),
                                check(grid,z+hs,x+hs,o)
                            ]);
                            vRight.y += (Math.random()-0.5)*rR;
                            //copie border to bottom
                            if((z == n+o.zShift-1)&&check(grid,z+1,x+hs)){
                                grid[z+1][x+hs].y = vRight.y;
                                grid[z+1][x+hs].isSet = true;
                            }
                        }
                        if(check(grid,z+hs,x,o)&&!grid[z+hs][x].isSet){
                            var vBelow = grid[z+hs][x];
                            vBelow.setYAverage([
                                grid[z][x],
                                grid[z+step][x],
                                check(grid,z+hs,x-hs,o),
                                check(grid,z+hs,x+hs,o)
                            ]);
                            vBelow.y += (Math.random()-0.5)*rR;
                            //copie border to right
                            if((x == n+o.xShift-1)&&check(grid,z+hs,x+1)){
                                grid[z+hs][x+1].y = vBelow.y;
                                grid[z+hs][x+1].isSet = true;
                            }
                        }
                    }
                }
                step /= 2;
                hs /= 2;
                rR /= 2;
            }
        }
    }

    console.log("\t evaluate terrain height");
    var maxY=0,minY=0;
    for(var z=0;z<nZ;z++){
        for(var x=0;x<nX;x++){
            var v = grid[z][x];
            if(v){
                if(v.y>maxY)maxY=v.y;
                if(v.y<minY)minY=v.y;
            }
        }
    }
    //min-----|------------max
    maxY -= minY;


    var partHeight = maxY / 100;
    var seaLevel = partHeight * 50;
    var peekLevel = partHeight * 60;


    var setYRelatedColor = function(vector){
        var c = {r:0,g:0,b:0,a:1};

        if(vector.y < seaLevel){
            c.b = (vector.y+0.1)/seaLevel;
        }
        if(vector.y >= seaLevel){
            c.g = (vector.y + 0.2)-seaLevel;
        }
        if(vector.y >= peekLevel){
            c.r = c.g = c.b = (vector.y+1)-peekLevel;
        }

        //isobars
        if((vector.y%(partHeight*5))<0.02){
            //c.r = c.g = c.b = 0;
        }


        if(false){
            c.r = Math.random();
            c.g = Math.random();
            c.b = Math.random();
        }
        vector.color = c;
    };


    console.log("\t set rest");
    var nLength = sideLength/(n-1);
    for(var z=0;z<nZ;z++){
        for(var x=0;x<nX;x++){
            var v = grid[z][x];
            v.x = x*nLength-(sideLength*repeatX)/2.0;
            v.z = z*nLength-(sideLength*repeatZ)/2.0;
            v.y -= minY;
            setYRelatedColor(v);
            if(drawGrid){
                if(((z%gridSize)==0)||((x%gridSize)==0)){
                    v.color.r = 1-v.color.r;
                    v.color.g = 1-v.color.g;
                    v.color.b = 1-v.color.b;
                }
            }
            v.y -= seaLevel;
            //flatt seaLevel
            if(v.y<0)v.y=0;

            //alert(v.x);
        }
    }

    console.log("\t set normals");
    for(var repZ=0;repZ<repeatZ;repZ++){
        for(var repX=0;repX<repeatX;repX++){
            console.log("\t\t field z:"+repZ+" x:"+repX);
            o.xShift = n*repX;
            o.zShift = n*repZ;
            for(var z=o.zShift;z<(n+o.zShift);z++){
                for(var x=o.xShift;x<(n+o.xShift);x++){
                    setAverageNormal(grid,z,x);
                }
            }
        }
    }

    console.log("\t convert into object");
    var i=0;
    for(var pZ=0;pZ<nZ;pZ+=maxN-1){
        for(var pX=0;pX<nX;pX+=maxN-1){
            this.normals=[];this.textureCoords=[];this.vertices=[];this.colors=[];this.indices=[];
            i=0;
            if((nX-pX)<maxN){pXn=(nX-pX);}else{pXn=maxN;}
            if((nZ-pZ)<maxN){pZn=(nZ-pZ);}else{pZn=maxN;}

            for(var z=0;z<pZn;z++){
                for(var x=0;x<pXn;x++){
                    var v = grid[z+pZ][x+pX];
                    if(!v)alert(""+
                        "z:"+z+
                        "pZ:"+pZ+
                        "x:"+x+
                        "pX:"+pX);
                    this.vertices.push(v.x, v.y, v.z);

                    var normal = v.getNormal();
                    this.normals.push(normal.x,normal.y,normal.z);

                    if(((z==0)||(x==0))&&drawObjectGrid){
                        this.colors.push(1-v.color.r,1-v.color.g,1-v.color.b,v.color.a);
                    }else{
                        this.colors.push(v.color.r,v.color.g,v.color.b,v.color.a);
                    }
                    if((z<(pZn-1))&&(x<(pXn-1))){
                        this.indices.push(i,i+1,i+1+pXn);
                        this.indices.push(i,i+1+pXn,i+pXn);
                    }
                    i++;
                }
            }

            var terrainPart = new Object("preloaded",{
                vertices:this.vertices,
                normals:this.normals,
                colors:this.colors,
                indices:this.indices
            })
            this.terrainObject.addChild(terrainPart);
        }
    }
    console.log("end terrain");

    this.getObject = function(){
        return this.terrainObject;
    };

};



var terrainLoadingInfo = document.createElement("div");
terrainLoadingInfo.style.position = "absolute";
terrainLoadingInfo.style.left = "10px";
terrainLoadingInfo.style.top = "10px";
terrainLoadingInfo.style.background = "#fff";
terrainLoadingInfo.setInfo = function(info){
    this.innerHTML = info+" ";
}
//document.body.appendChild(terrainLoadingInfo);