Vertex = function(options){
    options = options||{};
    
    this.position =  new Vec([0,0,0]);
    this.normal = new Vec(0,1,0);

    //colors
    this.color = {};
    this.color.r = 1;
    this.color.g = 1;
    this.color.b = 1;
    this.color.a = 1;

};