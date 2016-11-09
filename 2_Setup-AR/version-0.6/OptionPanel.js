var OptionPanel = function (options) {
    options = options || {};
    
    var domElement;
    if(options.domElement){
        domElement = options.domElement;
    }else{
        domElement = document.createElement('div');
        document.body.appendChild(domElement);
    }
    domElement.style.position = "absolute"
    domElement.style.top = 0;
    domElement.style.right = 0;
    domElement.style.textAlign = "right";
    domElement.style.backgroundColor = "rgba(255,255,255,0.5)";
    domElement.style.padding = "5px"; 
    domElement.style.border = "1px solid black";
    domElement.style.zIndex = options.zIndex || 100;
    
   
    
    this.addTitle = function(text){
        var domTitle = document.createElement('h4');
        domTitle.innerHTML = text;
        domTitle.style.textAlign = "center";
        domTitle.style.margin = "5px";
        domElement.appendChild(domTitle);
        domElement.appendChild(document.createElement('hr'));
    };
    
    
    
    this.makeCheckbox = function(options){
        options = options || {};

        var label = document.createElement('label');
        label.style.display = "block";
        if(options.title)label.title = options.title;
        if(options.labelText)label.innerHTML = options.labelText;

        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.checked = options.value || false;
        

        label.appendChild(checkbox);
        domElement.appendChild(label);
        
        return checkbox;
    }
    
    this.makeSelection = function(options){
        options = options || {};
        var label = document.createElement('label');
        label.style.display = "block";
        if(options.labelText)label.innerHTML = options.labelText;
        
        var selection = document.createElement('select');
        
        label.appendChild(selection);
        domElement.appendChild(label);
        
        if(!options.optionChildren)return selection;
        
        for(var childOptionI in options.optionChildren){
            var cildOption = options.optionChildren[childOptionI] || {};
            var option = document.createElement('option');
	        option.innerHTML = cildOption.name;
	        option.value = cildOption.value || cildOption.name;
	        selection.appendChild(option);
        }
        if(options.selectedIndex>options.optionChildren.length-1)options.selectedIndex=options.optionChildren.length-1;
        selection.selectedIndex = ((options.selectedIndex=="last")?options.optionChildren.length-1:options.selectedIndex)||0;
        return selection;
    };
    
           
    
}