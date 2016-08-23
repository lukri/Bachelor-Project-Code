//http://www.euclideanspace.com/maths/algebra/vectors/angleBetween/
//http://www.vitutor.com/geometry/vec/angle_vectors.html
Vector = function(x,y,z){
    this.x = x||0;
    this.y = y||0;
    this.z = z||0;
    if(x !== null && typeof x === 'object'){
      options = x;
      this.x = options.x||0;
      this.y = options.y||0;
      this.z = options.z||0;
    }
    //normal
    this.nx = 0;
    this.ny = 1;
    this.nz = 0;

    //colors
    this.color = {};
    this.color.r = 1;
    this.color.g = 1;
    this.color.b = 1;
    this.color.a = 1;

};

Vector.prototype.getLength = function(){
    return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
};


Vector.prototype.getAreaNormal = function(vector1, vector2){
        if(vector1==null)return null;
        if(vector2==null)return null;
        var a = this.getDifferenceVector(vector1);
        var b = this.getDifferenceVector(vector2);
        return b.getCrossProductVector(a);
};
Vector.prototype.getLineNormalZPlane = function(vector){
        var p = new Vector(
            this.x-vector.x,
            this.y-vector.y,
            0 );
        return p.getRotatedVectorAroundZ(Math.PI/2);
};
Vector.prototype.rotateAroundY = function(angle, options){
        options = options || {};
        if(options.degToRad)angle=degToRad(angle);
        this.x = this.z*Math.sin(angle)+this.x*Math.cos(angle);
        this.z = this.z*Math.cos(angle)-this.x*Math.sin(angle);

};

Vector.prototype.rotateAroundZ = function(angle, options){
        options = options || {};
        if(options.degToRad)angle=degToRad(angle);
        this.x = this.y*Math.sin(angle)+this.x*Math.cos(angle);
        this.y = this.y*Math.cos(angle)-this.x*Math.sin(angle);
};



Vector.prototype.getRotatedVectorAroundY = function(angle){
        return new Vector(
          this.z*Math.sin(angle)+this.x*Math.cos(angle),
          this.y,
          this.z*Math.cos(angle)-this.x*Math.sin(angle)
        );
};
Vector.prototype.getRotatedVectorAroundZ = function(angle){
        return new Vector(
          this.y*Math.sin(angle)+this.x*Math.cos(angle),
          this.y*Math.cos(angle)-this.x*Math.sin(angle),
          this.z
        );
};
Vector.prototype.getNormal = function(){
        return new Vector(
          this.nx,
          this.ny,
          this.nz
        );
};

Vector.prototype.setNormal = function(x,y,z){
        this.nx = x;
        this.ny = y;
        this.nz = z;
};

Vector.prototype.calculateAverageNormalZPlane = function(precursor,successor){
        var n1=precursor.getLineNormalZPlane(this);
        var n2=this.getLineNormalZPlane(successor);
        this.nx = (n1.x+n2.x)/2;
        this.ny = (n1.y+n2.y)/2;
        this.nz = (n1.z+n2.z)/2;
};
Vector.prototype.invert = function(){
        this.x *= -1;
        this.y *= -1;
        this.z *= -1;
};

Vector.prototype.getDifferenceVector = function(vector){
        return new Vector(
            vector.x-this.x,
            vector.y-this.y,
            vector.z-this.z
        );
};

Vector.prototype.getCrossProductVector = function(b){
        var a = this;
        return new Vector(
            a.y*b.z-a.z*b.y,
            a.z*b.x-a.x*b.z,
            a.x*b.y-a.y*b.x
        );
};

Vector.prototype.getDotProduct = function(b){
        var a = this;
        return a.x*b.x+a.y*b.y+a.z*b.z;
};


Vector.prototype.getAngelBetween = function(b){
        var a = this;
        if(a.getLength()*b.getLength()==0){
            console.error("division by 0");
            //alert(arguments.callee.caller.toString());
            return null;
        };
        return Math.acos(a.getDotProduct(b)/(a.getLength()*b.getLength()));
};


Vector.prototype.isZeroVector = function(){
        return((this.x==0)&&(this.y==0)&&(this.z==0));
}
Vector.prototype.equals = function(vector){
        return((this.x==vector.x)&&(this.y==vector.y)&&(this.z==vector.z));
}
Vector.prototype.setYAverage= function(vectorArray){
        var n = 0;
        for(var i=0;i<vectorArray.length;i++){
            if(vectorArray[i]){
                this.y += vectorArray[i].y;
                n++
            };
        };
        if(n!=0)this.y /= n;
};
Vector.prototype.addVector = function(vector){
        if(vector==null)return null;
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
};

Vector.prototype.subtractVector = function(vector){
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
};

Vector.prototype.divide = function(div){
        this.x /= div;
        this.y /= div;
        this.z /= div;
};

Vector.prototype.normalize = function(){
        var length = this.getLength();
        if(length!=0)this.divide(length);
};


Vector.prototype.setLength = function(length){
        this.normalize();
        this.multiply(length);
};



Vector.prototype.multiply = function(mult){
        this.x *= mult;
        this.y *= mult;
        this.z *= mult;
};

Vector.prototype.clone = function(options){
        options = options||{};
        var nV = new Vector(this.x,this.y,this.z);
        if(options.x||options.x==0)nV.x = options.x;
        if(options.y||options.y==0)nV.y = options.y;
        if(options.z||options.z==0)nV.z = options.z;
        if(options.length)nV.setLength(options.length);
        nV.setNormal(this.nx,this.ny,this.nz);
        return nV;
}