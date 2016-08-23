LoadManager = function () {
    var isFinishedBool = false;
    var loadingBox = document.createElement("div");
    //loadingBox.style.display = "none";
    loadingBox.style.position = "absolute";
    loadingBox.style.left = "10px";
    loadingBox.style.top = "250px";
    loadingBox.style.width = "500px";
    //loadingBox.style.padding = "10px";
    loadingBox.style.color = "white";
    //loadingBox.style.opacity = 0.5;
    //loadingBox.style.filter = "alpha(opacity=50)";
    loadingBox.style.fontSize = "2em";
    loadingBox.style.textAlign = "center";
    loadingBox.innerHTML = "Loading...";

    document.body.appendChild(loadingBox);

    this.loadingTasks = {};
    this.addLoadingTask = function(taskName){
        if(this.loadingTasks[taskName]){
            alert("task with same name already existing");
            return false;
        }
        isFinishedBool = false;
        this.loadingTasks[taskName]={};
        return true;
    };
    this.removeLoadingTask = function(taskName){
        delete this.loadingTasks[taskName];
    }
    this.isFinished = function(){
        if(isFinishedBool)return true;
        var obj = this.loadingTasks;
        // null and undefined are "empty"
        if (obj == null) return this.setFinish();

        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return this.setFinish();

        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return this.setFinish();
    }

    this.setFinish = function(){
        loadingBox.style.display = "none";
        //document.getElementById("loading").style.display = "none";
        isFinishedBool = true;
        return true;
    }
}


var loadManager = new LoadManager();