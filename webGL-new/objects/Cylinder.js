Cylinder = function (options) {
    options = options || {};
    var radius = options.radius || 1;
    var innerRadius = options.innerRadius || 0;
    var height = options.height || 1;
    var parts = options.parts || 50;
    var center = options.center || {x:0,y:0,z:0};
    var isClosed = options.isClosed;
    if((!isClosed) && (isClosed!=false))isClosed=true;

    this.normals=[];this.textureCoords=[];this.vertices=[];this.colors=[];this.indices=[];

    var ring = [];
    var innerRing = [];
    var angle = Math.PI*2/(parts);

    if(!isClosed)parts++;

    hasInnerRing = innerRadius>0;
    if(innerRadius>radius){
        var r = radius;
        radius = innerRadius;
        innerRadius = r;
    }

    //template ring
    for(var i=0; i<parts; i++){
        var point = new Vector();
        var innerPoint = new Vector();
        point.x = Math.cos(i*angle)*radius+center.x;
        point.y = center.y;
        point.z = Math.sin(i*angle)*radius+center.z;
        innerPoint.x = Math.cos(i*angle)*innerRadius+center.x;
        innerPoint.y = center.y;
        innerPoint.z = Math.sin(i*angle)*innerRadius+center.z;
        ring[i] = point;
        ring[i+parts] = innerPoint;
    }

    //mantel
    var j, iShift = 0, n=1;
    for(var m=0;m<=1;m++){  //outer/inner
      for(var k=0;k<=1;k++){ //bottom / up
        for(var i=0; i<parts; i++){
            this.vertices.push(
                ring[i+m*parts].x,
                ring[i+m*parts].y + (k*0.5*height || (-0.5)*height),
                ring[i+m*parts].z);
            this.normals.push(ring[i].x*n, 0, ring[i].z*n);
            this.colors.push(Math.random(),Math.random(),Math.random(),1);
            j = i+iShift;
            if(k==0)this.indices.push(j,(j+1)%parts+parts+iShift,(j+1)%parts+iShift);
            if(k==1)this.indices.push(j,(j+1)%parts+parts+iShift, j+parts);
        }
      }
      if(!hasInnerRing)break;
      iShift = 2*parts;
      n = -1;
    }

    //deckel
    n = -1;
    for(var k=0;k<=1;k++){ //bottom / up
      iShift = this.vertices.length/3;
      for(var m=0;m<=1;m++){  //outer/inner
        for(var i=0; i<parts; i++){
            this.vertices.push(
                ring[i+m*parts].x,
                ring[i+m*parts].y + (k*0.5*height || (-0.5)*height),
                ring[i+m*parts].z);
            this.normals.push(0, n, 0);
            this.colors.push(Math.random(),Math.random(),Math.random(),1);
            j = i+iShift;
            if(m==0)this.indices.push(j,(j+1)%parts+parts+iShift,(j+1)%parts+iShift);
            if(m==1)this.indices.push(j,(j+1)%parts+parts+iShift, j+parts);
        }
      }
      n = 1;
    }
};