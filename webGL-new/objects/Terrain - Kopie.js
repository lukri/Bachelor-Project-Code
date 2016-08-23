Terrain = function (options) {
    options = options || {};
    var sideLength = options.sideLength || 4;
    var n = options.resolution || 7;
    var randomRange = options.randomRange || 2;
    var repeatX = options.repeatX || 1;
    var repeatZ = options.repeatZ || 1;
    n = Math.pow(2,n)+1;
    m = n-1;

    var grid = new Array(n*repeatZ);
    for (var i = 0; i < grid.length; i++) {
        grid[i] = new Array(n*repeatX);
    }

    grid[0][0] = new Vector({y:0});
    grid[0][m] = new Vector({y:0});
    grid[m][0] = new Vector({y:0});
    grid[m][m] = new Vector({y:0});


    /*
      0,0......0,x
      .          .
      .          .
      z,0......z,x
    */







    var check = function(array, z, x){
        if(z<0)return null;
        if(z>=array.length)return null;
        if(x<0)return null;
        if(x>=array.length)return null;
        if(array[z][x])return array[z][x];
        return true;
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







    var step = m;
    var hs; //half step
    while(step>=2){
        hs = step/2;
        for(var z=0;z<=m;z+=step){
            for(var x=0;x<=m;x+=step){

                //square
                if(check(grid,z+hs,x+hs)){
                    var vMiddle = new Vector();
                    vMiddle.setYAverage([
                        grid[z][x],
                        grid[z][x+step],
                        grid[z+step][x],
                        grid[z+step][x+step]
                    ]);
                    vMiddle.y += (Math.random()-0.5)*randomRange;
                    grid[z+hs][x+hs] = vMiddle;
                }

                //diamond
                if(check(grid,z,x+hs)){
                    var vRight = new Vector();
                    vRight.setYAverage([
                        grid[z][x],
                        grid[z][x+step],
                        check(grid,z-hs,x+hs),
                        check(grid,z+hs,x+hs)
                    ]);
                    vRight.y += (Math.random()-0.5)*randomRange;
                    grid[z][x+hs] = vRight;
                }
                if(check(grid,z+hs,x)){
                    var vBelow = new Vector();
                    vBelow.setYAverage([
                        grid[z][x],
                        grid[z+step][x],
                        check(grid,z+hs,x-hs),
                        check(grid,z+hs,x+hs)
                    ]);
                    vBelow.y += (Math.random()-0.5)*randomRange;
                    grid[z+hs][x] = vBelow;
                }
            }
        }
        step /= 2;
        randomRange /= 2;
    }


    var maxY=0,minY=0;
    for(var z=0;z<n;z++){
        for(var x=0;x<n;x++){
            var v = grid[z][x];
            if(v.y>maxY)maxY=v.y;
            if(v.y<minY)minY=v.y;
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



        vector.color = c;
    };







    var nLength = sideLength/n;
    for(var z=0;z<n;z++){
        for(var x=0;x<n;x++){
            var v = grid[z][x];
            v.x = x*nLength-sideLength/2;
            v.z = z*nLength-sideLength/2;
            v.y -= minY;
            setYRelatedColor(v);
            v.y -= seaLevel;
            //flatt seaLevel
            if(v.y<0)v.y=0;
        }
    }

    for(var z=0;z<n;z++){
        for(var x=0;x<n;x++){
            var v = grid[z][x];

            setAverageNormal(grid,z,x);
        }
    }




    //convert into object
    this.normals=[];this.textureCoords=[];this.vertices=[];this.colors=[];this.indices=[];
    var i=0;
    for(var z=0;z<n;z++){
        for(var x=0;x<n;x++){
            var v = grid[z][x];
            this.vertices.push(v.x, v.y, v.z);

            var normal = v.getNormal();
            this.normals.push(normal.x,normal.y,normal.z);

            this.colors.push(v.color.r,v.color.g,v.color.b,v.color.a);

            if((z<m)&&(x<m)){
                this.indices.push(i,i+1,i+1+n);
                this.indices.push(i,i+1+n,i+n);
            }
            i++;
        }
    }
};