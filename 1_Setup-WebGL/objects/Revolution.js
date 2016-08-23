Revolution = function (options) {
    options = options || {};
    var radius = options.radius || 0;
    var scale = options.scale || 1;
    var form = options.form || [new Vector(0,0.5,0),new Vector(1,1,0),new Vector(1,0,0),new Vector(0,-1,0)];
    var parts = options.parts || 50;

    var closeRevolution = options.closeRevolution;
    if((!closeRevolution)&&(closeRevolution!=false))closeRevolution=false;
    var shareFormPoints = options.shareFormPoints;
    if((!shareFormPoints)&&(shareFormPoints!=false))shareFormPoints=false;
    var sharePartPoints = options.sharePartPoints;
    if((!sharePartPoints)&&(sharePartPoints!=false))sharePartPoints=true;
    var invertNormals = options.invertNormals;
    if((!invertNormals)&&(invertNormals=false))invertNormals=false;

    this.normals=[];this.textureCoords=[];this.vertices=[];this.colors=[];this.indices=[];

    var angle = Math.PI*2/(parts);
    var formL = form.length;
    for(var i in form){
       form[i].x+=radius;
       form[i].x*=scale;
       form[i].y*=scale;
       form[i].z*=scale;
    }

    if(closeRevolution)parts++;

    var p1,p2,p3,p4,np1,np2,np3,np4,normal;
    var j,kfL,iShift=0;
    var fL = form.length;
    var pL = parts;

    //calculate normals in z Plane
    for(var i=0;i<form.length;i++){
        var point = form[i];
        var precursor = form[(i-1+fL)%fL];
        if((point.x==precursor.x)&&(point.y==precursor.y))precursor = form[(i-2+fL)%fL];
        var successor = form[(i+1)%fL];
        if((point.x==successor.x)&&(point.y==successor.y))successor = form[(i+2)%fL];
        point.calculateAverageNormalZPlane(precursor,successor);
    }



    for(var k=0; k<parts; k++){
       for(var i=0, m=0; i<formL; i++, m+=2){
            if(sharePartPoints){
                p1 = form[i]; p2 = form[(i+1)%formL];
                np1 = p1.getRotatedVectorAroundY(k*angle);
                np2 = p2.getRotatedVectorAroundY(k*angle);

                normal = p1.getNormal();
                if(!shareFormPoints)normal = p1.getLineNormalZPlane(p2);
                normal = normal.getRotatedVectorAroundY(k*angle);

                this.vertices.push(np1.x,np1.y,np1.z);
                if(invertNormals)normal.invert();

                this.normals.push(normal.x, normal.y, normal.z);
                this.colors.push(Math.random(),Math.random(),Math.random(),1);

                if(!shareFormPoints){
                    this.vertices.push(np2.x,np2.y,np2.z);
                    this.normals.push(normal.x, normal.y, normal.z);
                    this.colors.push(Math.random(),Math.random(),Math.random(),1);
                }

                fL = formL;
                if(!shareFormPoints)fL*=2;
                kfL = k*fL;
                j = i;
                if(!shareFormPoints)j*=2;
                this.indices.push(j+kfL,(j+1)%fL+kfL,(j+kfL+fL)%(pL*fL));
                this.indices.push((j+1)%fL+kfL,(j+kfL+fL)%(pL*fL),((j+1)%fL+kfL+fL)%(pL*fL));
            }else if(shareFormPoints){
                p1 = form[i], p2 = form[i];
                np1 = p1.getRotatedVectorAroundY(k*angle);
                np2 = p2.getRotatedVectorAroundY((k+1)*angle);
                this.vertices.push(np1.x,np1.y,np1.z);
                this.vertices.push(np2.x,np2.y,np2.z);

                normal = p1.getNormal();
                normal = normal.getRotatedVectorAroundY((k+0.5)*angle);
                if(invertNormals)normal.invert();
                this.normals.push(normal.x, normal.y, normal.z);
                this.normals.push(normal.x, normal.y, normal.z);

                this.colors.push(Math.random(),Math.random(),Math.random(),1);
                this.colors.push(Math.random(),Math.random(),Math.random(),1);

                fL = formL;
                fL*=2;
                kfL = k*fL;
                j=i;
                j*=2;
                this.indices.push(j+kfL,j+1+kfL,(j+2)%fL+kfL);
                this.indices.push(j+1+kfL,(j+2)%fL+kfL,(j+3)%fL+kfL);
            }else{
                p1 = form[i], p2 = form[i];
                p3 = form[(i+1)%formL], p4 = form[(i+1)%formL];
                np1 = p1.getRotatedVectorAroundY(k*angle);
                np2 = p2.getRotatedVectorAroundY((k+1)*angle);
                np3 = p3.getRotatedVectorAroundY(k*angle);
                np4 = p4.getRotatedVectorAroundY((k+1)*angle);
                this.vertices.push(np1.x,np1.y,np1.z);
                this.vertices.push(np2.x,np2.y,np2.z);
                this.vertices.push(np3.x,np3.y,np3.z);
                this.vertices.push(np4.x,np4.y,np4.z);


                normal = np1.getAreaNormal(np2, np3);
                if(np1.equals(np2)) normal = np1.getAreaNormal(np4, np3);


                if(invertNormals)normal.invert();
                for(var x=0;x<4;x++){
                    this.normals.push(normal.x, normal.y, normal.z);
                    this.colors.push(Math.random(),Math.random(),Math.random(),1);
                }
                fL = formL;
                fL*=4;
                kfL = k*fL;
                j=i;
                j*=4;
                this.indices.push(j+kfL,j+1+kfL,j+2+kfL);
                this.indices.push(j+1+kfL,j+2+kfL,j+3+kfL);
            }
       }
    }
};