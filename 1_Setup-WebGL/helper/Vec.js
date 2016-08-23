Vec = function(x,y,z){
    this.x = x||0;
    this.y = y||0;
    this.z = z||0;
    if(x !== null && typeof x === 'object'){
      options = x;
      this.x = options.x||0;
      this.y = options.y||0;
      this.z = options.z||0;
    }
};

Vec.prototype.getLength = function(){
    return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
};