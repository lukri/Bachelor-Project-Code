var OptionPanel = function (options) {
    options = options || {};
    
    
    
    var domElement;
    if(options.domElement){
        domElement = options.domElement;
    }else{
        domElement = document.createElement('div');
        document.body.appendChild(domElement);
    }
    domElement.className = "option-panel";
    domElement.style.position = "absolute";
    domElement.style.top = 0;
    domElement.style.width = "150px";
    domElement.style.right = 0;
    domElement.style.textAlign = "right";
    domElement.style.backgroundColor = "rgba(255,255,255,0.5)";
    domElement.style.padding = "5px"; 
    domElement.style.border = "1px solid black";
    domElement.style.zIndex = options.zIndex || 100;
    
    var activeGroupDom = domElement;
    
    this.addTitle = function(text){
        var domTitle = document.createElement('h4');
        domTitle.innerHTML = text;
        domTitle.style.textAlign = "center";
        domTitle.style.margin = "5px";
        activeGroupDom.appendChild(domTitle);
        activeGroupDom.appendChild(document.createElement('hr'));
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
        checkbox.disabled = options.disabled || false;
        

        label.appendChild(checkbox);
        activeGroupDom.appendChild(label);
        
        return checkbox;
    }
    
    this.makeSelection = function(options){
        options = options || {};
        var label = document.createElement('label');
        label.style.display = "block";
        if(options.labelText)label.innerHTML = options.labelText;
        
        var selection = document.createElement('select');
        
        label.appendChild(selection);
        activeGroupDom.appendChild(label);
        
        if(!options.optionChildren)return selection;
        
        var selectionChildArray = [];
        for(var childOptionI in options.optionChildren){
            var cildOption = options.optionChildren[childOptionI] || {};
            var option = document.createElement('option');
	        option.innerHTML = cildOption.name || cildOption.value || cildOption;
	        option.value = cildOption.value || option.innerHTML;
	        if(cildOption.value===false)option.value = false;
	        if(options.selectedIndex==option.value)options.selectedIndex=childOptionI;
	        selection.appendChild(option);
	        selectionChildArray.push(option);
        }
        
        if(options.selectedIndex){
            if(options.selectedIndex>options.optionChildren.length-1)options.selectedIndex=options.optionChildren.length-1;
            selection.selectedIndex = ((options.selectedIndex=="last")?options.optionChildren.length-1:options.selectedIndex)||0;
        }
        
        selection.setSelectionByValue = function(value){
            for(var i in selectionChildArray){
                if(value==selectionChildArray[i].value)selection.selectedIndex = i;
            }
        };
        
        
        return selection;
    };
    
    this.addHr = function(){
        activeGroupDom.appendChild(document.createElement('hr'));    
    };
    
   
    var groupStack = [domElement];
    var groupI = 0;
    this.openGroup = function(options) {
        options = options || {};
        var parentGroup = document.createElement('div');
        parentGroup.style.paddingBottom = "5px";
        parentGroup.style.position = "relative";
        
        var line = document.createElement('hr');
        //line.style.position = "absolute";
        //line.style.left = 0;
        //line.style.width = "100%";
        
        var groupBox = document.createElement('input');
        groupBox.type = "checkbox";
        groupBox.checked = !(options.checked===false);
        groupBox.style.position = "absolute";
        groupBox.style.left = 0;
        groupBox.style.top = "-8px";
        groupBox.id = "bg"+groupI++;
        
        var groupTitle = document.createElement('label');
        groupTitle.style.position = "absolute";
        groupTitle.style.left = "25px";
        groupTitle.style.top = "-8px";
        groupTitle.style.background = "#ddd";
        groupTitle.setAttribute("for",groupBox.id);
        groupTitle.innerHTML = options.title;
        
        parentGroup.appendChild(line);
        parentGroup.appendChild(groupTitle);
        parentGroup.appendChild(groupBox);
        
        var newGroup = document.createElement('div');
        //newGroup.style.paddingTop = "25px";
        parentGroup.appendChild(newGroup);
        activeGroupDom = newGroup;
        groupStack.push(newGroup);
        domElement.appendChild(parentGroup);
    };
    
    this.closeGroup = function() {
        if(groupStack.length==1){
            alert("no open groups to close");
            return;
        }
        groupStack.pop();
        activeGroupDom = groupStack[groupStack.length-1];
    };
    
    
    this.hidePanel = function(){
        domElement.style.display = "none";
    };
           
    this.showPanel = function(){
        domElement.style.display = "block";
    };
    
};