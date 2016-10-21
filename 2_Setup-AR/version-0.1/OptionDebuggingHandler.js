var OptionDebuggingHandler = function () {
    
    var optionPanel = {};
    
    
    
    
    
    this.itemContainer = {};
    this.currentTree = null;
    var showBox = document.createElement("div");
    showBox.style.display = "none";
    showBox.style.position = "absolute";
    showBox.style.left = "5px";
    showBox.style.top = "5px";
    showBox.style.padding = "10px";
    showBox.style.background = "white";
    showBox.style.opacity = 0.5;
    showBox.style.filter = "alpha(opacity=50)";
    showBox.style.fontSize = "0.6em"


    this.showBox = showBox;
    document.body.appendChild(this.showBox);



    this.setCurrentTree = function(panelName, groupName, subgroupName){
        if(!this.itemContainer[panelName])this.itemContainer[panelName] = {};
        if(!this.itemContainer[panelName][groupName])this.itemContainer[panelName][groupName] = {};
        if(!this.itemContainer[panelName][groupName][subgroupName])this.itemContainer[panelName][groupName][subgroupName] = {};
        this.currentTree = this.itemContainer[panelName][groupName][subgroupName];
    }

    this.addItem = function(itemName, type, props){
        if(!this.currentTree)return;
        if(this.currentTree[itemName]){
            alert("Item already exists");
            return;
        };
        this.currentTree[itemName] = {};
        var item = this.currentTree[itemName];
        item.name = itemName;

        switch(type) {
            case "numberInput":
                item.htmlElement = document.createElement("input");
                item.htmlElement.type = "text";
                item.htmlElement.value = props[0] || 0;
                item.htmlElement.incStep = props[1] || 1;
                item.getValue = function(roundplaces){
                    var result = parseFloat(item.htmlElement.value);
                    if(roundplaces==0)result = parseInt(result);
                    //result = Math.round((result+ 0.00001) * (10^roundplaces)) / (10^roundplaces);
                    if(result<props[2]) result = props[2];
                    if(result>props[3]) result = props[3];
                    item.htmlElement.value = result;
                    if(item.htmlElement.value == "NaN") result = 0;
                    item.htmlElement.value = result;
                    return result;
                }
                item.increaseValue = function(amount){
                    if(!amount)amount = props[1] || 0;
                    item.htmlElement.value = item.getValue() + amount;
                    item.htmlElement.value = item.getValue(); //poss. corrections
                }
                item.setValue = function(value){
                    item.htmlElement.value = value;
                }
                item.value = item.htmlElement.value;
                item.valueSpace = item.htmlElement;
                break;

            case "numberInputFree":
                item.htmlElement = document.createElement("input");
                item.htmlElement.type = "text";
                item.htmlElement.value = props[0] || 0;
                item.htmlElement.freeInput = true;
                item.getValue = function(){
                    var result = parseFloat(item.htmlElement.value);
                    return result;
                }
                item.updateValue = function(amount){
                    if(!amount)amount = props[1] || 0;
                    item.htmlElement.value = item.getValue() + amount;
                    item.htmlElement.value = item.getValue(); //poss. corrections
                }
                item.value = item.htmlElement.value;
                item.valueSpace = item.htmlElement;
                break;

            case "checkbox":
                item.htmlElement = document.createElement("input");
                item.htmlElement.type = "checkbox";
                item.htmlElement.checked = props[0];
                item.getValue = function(){
                    return item.htmlElement.checked;
                }
                item.setValue = function(bool){
                    item.htmlElement.checked = (bool==true);
                }
                break;
            default:
                alert(type+" not found");
                break;
        }

        return item;
    }

    this.getItem = function(panelName, groupName, subgroupName, itemName, type, props){
        if(!this.itemContainer[panelName])return null;
        if(!this.itemContainer[panelName][groupName])return null;
        if(!this.itemContainer[panelName][groupName][subgroupName])return null;
        if(!this.itemContainer[panelName][groupName][subgroupName][itemName])return null;
        return this.itemContainer[panelName][groupName][subgroupName][itemName];
    }


    this.convertToHTML = function(panel){
        for(panelName in this.itemContainer){
            if((panel)&&(panelName!=panel))continue;
            var htmlContainer = document.createElement("div");
            var headline1 = document.createElement("h2");
            headline1.innerHTML = panelName+": ";
            htmlContainer.appendChild(headline1);
            for(groupName in this.itemContainer[panelName]){
                var headline2 = document.createElement("h3");
                headline2.innerHTML = groupName+": ";
                htmlContainer.appendChild(headline2);
                for(subgroupName in this.itemContainer[panelName][groupName]){
                    var headline3 = document.createElement("h4");
                    headline3.innerHTML = subgroupName+": ";
                    htmlContainer.appendChild(headline3);
                    for(itemName in this.itemContainer[panelName][groupName][subgroupName]){
                        var item = this.itemContainer[panelName][groupName][subgroupName][itemName];
                        var inlineTitle = document.createElement("span");
                        inlineTitle.innerHTML = itemName+": ";
                        htmlContainer.appendChild(inlineTitle);
                        htmlContainer.appendChild(item.htmlElement);
                    }
                }
            }
            this.itemContainer[panelName].htmlElement = htmlContainer;
            //document.body.appendChild(htmlContainer);
        }
    }


    this.show = function(panel){
        this.clearShowbox();
        for(panelName in this.itemContainer){
            if(panelName==panel){
                this.showBox.appendChild(this.itemContainer[panelName].htmlElement);
                this.showBox.style.display = "block";
            }

        }

    }

    this.clearShowbox = function(){
        this.showBox.style.display = "none";
        var children = this.showBox.childNodes;
        for(var i=0; i<children.length; i++){
            this.showBox.removeChild(children[i]);
        }
    }
}