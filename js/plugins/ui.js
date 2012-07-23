/**
 * @summary User Interface Mootor plugin
 * @author Emilio Mariscal (emi420 [at] gmail.com)
 */
 
/** 
 * @class
 * @name $ 
 */
 
(function ($) {

    "use strict";
 
    var templates = {},
    
    Overlay = function() {
    },
    
    /**
     * Tooltip
     * @param {object} options Options
     * @config {string} html HTML content
     * @config {object} el Tooltip element
     * @return {object} Tooltip Mootor UI Tooltip object
     */
    Tooltip = function(options) {
        var self = this;
        self.html = options.html;
        self.el = options.el;

        self.div = document.createElement("div");
        $(self.div).hide();
        $(self.div).setClass("moo_tooltip");
        $(self.div).html(this.html);
        
        document.body.appendChild(self.div)

        $(self.el).onTapEnd(function(event) {
            $(self.div).translateFx({
                x: event.e.clientX,
                y: event.e.clientY,
            }, {});
            $(self.div).show();
        })
        
        return this;
    },

    /**
     * Switch
     * @param {object} options Options
     * @config {object} el Switch container
     * @return {object} Switch Mootor UI Switch object
     */
    Switch = function(options) {
        var check,
            input,
            self = this;
            
        this.el = options.el;
        this.el.innerHTML += "<b></b>";
        input = this.el.getElementsByTagName('input')[0];
        this.input = input;
        $(input).hide();

        check = $(this.el);
        check.setClass("moo-ui-switch");
        
        $(this.el).onTapEnd(function(gesture) {
            self.toggle();
        });

        this.toggle(input.value);       

        $(this.el).onDragStart(_stopEventPropagationAndPreventDefault);        
        
        return this;
    },
    
     /**
     * Text
     * @param {object} options Options
     * @config {object} el Text input element
     * @return {object} Text Mootor UI Text object
     */
    Text = function(options) {
        var self = this;
        this.el = options.el;
        $(this.el).onDragStart(_stopEventPropagationAndPreventDefault);
        this.el.innerHTML += '<span class="cleanbox">&times</span>';
        this.input = this.el.getElementsByTagName("input")[0];
        this.cleanbox = this.el.getElementsByClassName("cleanbox")[0];
        $(this.cleanbox).onTapEnd(function() {
            self.clean();
        })
        
        return this;
    },
    
    /**
     * TextArea
     * @param {object} options Options
     * @config {object} el Textarea element
     * @return {object} TextArea Mootor UI TextArea object
     */
    TextArea = function(options) {
        var self = this;
        this.el = options.el;
        $(this.el).onDragStart(_stopEventPropagationAndPreventDefault);  

        return this;
      
    },
    
    /**
     * Select
     * @param {object} options Options
     * @config {object} el Input select element
     * @return {object} Select Mootor UI Select object
     */
    Select = function(options) {
        var self = this,
            i = 0,
            items = this.items = [];
            
        this.input = options.el;        
        $(this.input).hide();
        this._makeHTML();       
        $(this.el).onDragStart(_stopEventPropagationAndPreventDefault);
        this.y = 0;
        items = $(this.ul).find("li");
        
        for(i = 0; i < items.length; i++) {
            this.items.push({
                el: items[i], 
                mooSelectIndex: i
            });
            this.items[i].el.setAttribute("moo-select-index", i);
        }
        
        // Tap (to select)
        $(this.ul).onTapEnd(function(gesture) {
            _stopEventPropagationAndPreventDefault(gesture); 
            self.select(gesture.e.target.getAttribute("moo-select-index"));
        });
        
        // Scroll
        $(this.ul).onDragMove(function(gesture) {
            var newY;
            
            _stopEventPropagationAndPreventDefault(gesture);
            newY = self.y + (gesture.y - gesture.lastY);

            if ((newY <= 0) && (newY >= -(self.ul.offsetHeight - 160))) {
                self.y = newY;
                $(self.ul).translateFx({x: 0, y: self.y}, {});
            }
            
        });
        
        return this;
                
    },
    
    /**
     * SelectMultiple
     * @param {object} options Options
     * @config {object} el Input select element
     * @return {object} SelectMultiple Mootor UI SelectMultiple object
     */
    SelectMultiple = function(options) {
        var self = this,
            i = 0,
            items = this.items = [];
            
        this.input = options.el;        
        $(this.input).setClass("moo-ui-selectmultiple");
        this._makeHTML();       
        //this.init();
        
        for(i = 0; i < items.length; i++) {
            this.items.push({
                el: items[i], 
                mooSelectIndex: i
            });
            this.items[i].el.setAttribute("moo-select-index", i);
        }
        
        return this;
        
    },
    
    Input = function() {
    },
    
    
    
    /**
     * Radio
     * @param {object} options Options
     * @config {object} el Fieldset element
     * @return {object} Radio Mootor UI Radio object
     */
    Radio = function(options) {
        var self = this,
            i = 0;
                    
        this.input = options.el;                       
        $(this.input).hide();
        this._makeHTML();
        
        this.mooItems = $(this.el).find(".moo-ui-radio");        

        for (i = this.mooItems.length; i--;) {
            $(this.mooItems[i]).onTapEnd(function(gesture) {
                self.activate($(gesture.e.target));
            });
        }  
    },
    
    /**
     * Checkbox
     * @param {object} options Options
     * @config {object} el Fieldset element
     * @return {object} Checkbox Mootor UI Checkbox object
     */
    Checkbox = function(options) {
        var self = this,
            i = 0;
                    
        this.input = options.el;                       
        $(this.input).hide();
        this._makeHTML();
        
        this.mooItems = $(this.el).find(".moo-ui-checkbox");        

        for (i = this.mooItems.length; i--;) {
            $(this.mooItems[i]).onTapEnd(function(gesture) {
                self.activate($(gesture.e.target));
            });
        }    
    },
    
     /**
     * Stop event propagation and prevent default
     * @private
     * @param {object} gesture Mootor gesture
     */
    _stopEventPropagationAndPreventDefault = function(gesture) {
        gesture.e.stopPropagation();
        gesture.e.preventDefault();
    },
    
     /**
     * Mootor UI template parser
     * @private
     * @param {object} options Options
     * @config {string} template HTML template
     * @config {object} self Mootor object instance (scope)
     * @return {string} parsedHTML Parsed HTML template
     */
    _templateParse = function(options) {
        var template = options.template,
            self = options.self,
            
            elements = [],
            parsedHTML = document.createElement("div"),
            tmpElements = [],
            i = 0,
            attr = [],
            index;
        
        parsedHTML.innerHTML = template;        
        tmpElements = parsedHTML.getElementsByTagName("*");     

        for (i = tmpElements.length; i--;) {

            if (tmpElements[i].getAttribute("moo-template") !== null) {

                attr = _removeSpaces(tmpElements[i].getAttribute("moo-template"))
                      .split(":");
                      
                elements.push({
                    el: tmpElements[i],
                    key: attr[0],
                    value: attr[1]
                });
                
            }
            
            if ((index = tmpElements[i].getAttribute("moo-foreach-index")) !== null) {
                elements[i].index = index;
            }
            
        }
    
        if(_templateArrayHasForeach(elements) === true) {       
            for (i = elements.length; i--;) {
                if (elements[i].key === "foreach") {
                    _templateForEach(elements[i], self);            
                } 
            }
        } else {
            for (i = elements.length; i--;) {
                switch (elements[i].key) {
                    case "text":
                        _templateText(elements[i], self);
                        break;
                }
            }
        }
        
        return parsedHTML.innerHTML;
        
    },
    

     /**
     * Check if any element of a Mootor template array has a "foreach" attribute
     * @private
     * @param {object} options Options
     * @config {string} template HTML template
     * @config {object} self Mootor object instance (scope)
     * @return {boolean}
     */
    _templateArrayHasForeach = function(elements) {
        var i;
        
        for (i = elements.length; i--;) {        
            if(elements[i].key === "foreach") {
                return true;
            }                
        }

        return false;
    },
    

     /**
     * Parse a "foreach" Mootor template
     * @private
     * @param {object} element Mootor template object to parse
     * @param {object} self Mootor object instance (scope)
     */
     _templateForEach = function(element, self) {
        var tag = element.value,
            collection = self.input.getElementsByTagName(tag),
            i = 0,
            tmpDiv = {},
            html = element.el.innerHTML,
            items = [],
            labels = [],
            tmpElement = document.createElement("div");
                        
        self.items = [];
        
        items = $(self.input).find(tag);
                
        if(tag === "input") {
            labels = $(self.input).find("label");
        }
                
        for (i = 0; i < items.length; i++) {
            self.items.push({
                el: items[i],
            });
            if(tag === "input") {
                self.items[self.items.length-1].label = labels[i];
            }
        }
                        
        element.el.innerHTML = "";
        
        for (i = 0; i < collection.length; i++) {
            tmpDiv = document.createElement("div")
            tmpDiv.innerHTML = html;
            tmpDiv.firstChild.setAttribute("moo-foreach-index", i);
            
            tmpDiv.innerHTML = _templateParse({
                template: tmpDiv.innerHTML,
                self: self
            });

            tmpElement.appendChild(tmpDiv);       

        }        
        
        element.el.innerHTML = tmpElement.innerHTML;

    },
    
     /**
     * Parse a "text" Mootor template
     * @private
     * @param {object} element Mootor template object to parse
     * @param {object} self Mootor object instance (scope)
     */
    _templateText = function(element, self) {
        var index = element.index,
            value = "";
            
        if(element.value.indexOf("this.") > -1) {
            value = element.value.replace("this.","");
            element.el.innerHTML = self.items[index][value].innerHTML;        
        }
    },

     /**
     * Remove spaces from a string
     * @private
     * @param {string} string String for remove spaces
     * @return {string} string String without spaces
     */
    _removeSpaces = function(string) {
        return string.split(" ").join("");
    }
    
    /*
     * Select Multiple prototype
     */   
    SelectMultiple.prototype = {
    
        // Make HTML
        _makeHTML: function() {
             var el = document.createElement("div"),
                html = "",
                self = this;
                
            this.el = el;
            $(this.el).setClass("moo-ui-selectmultiple");
            this.input.parentElement.appendChild(el);
            
            html = '<span class="moo-ui-select-text"></span>' +
                       '<span class="moo-ui-select-link"> &#9660;</span>';

            $(this.el).html(html);
            this.text = $(this.el).find(".moo-ui-select-text")[0];
            
            // Show native select menu
            $(this.el).onTapEnd(function(gesture) {
                // TODO: how to fire an event to open
                //       the select menu?
                //self.input.click();
            });
            
            // Update text when select an item
            $(this.el).bind("change", function() {
                this.text = self.el.value;
            });

        }
        
    }

    /*
     * Select prototype
     */   
    Select.prototype = {
    
        // Make HTML
        _makeHTML: function() {
            var el = document.createElement("div"),
                options = $(this.input).find("option"),
                i = 0,
                html,
                self = this;

            this.el = el;
            this.input.parentElement.appendChild(el);
            
            // TODO 
            // Use templates
            
           $(this.el).setClass("moo-ui-select-container").setClass("top");
           html = '<span class="moo-ui-select-text"></span>' +
                       '<span class="moo-ui-select-link"> &#9660;</span>' +
                       '<div class="moo-ui-select-menu"' + 
                       ' style="height:217px;display:none">' + 
                       '<ul class="moo-ui-select-list">';

            for(i = 0; i < options.length; i++) {
                html += '<li moo-select-value="' + options[i].value +
                        '">' + options[i].text + '</li>';                
            }
            html += '</ul></div>';
            $(this.el).html(html);
            
            this.ul = $(this.el).find("ul")[0];
            this.box = $(this.el).find(".moo-ui-select-menu")[0];
            this.text = $(this.el).find(".moo-ui-select-text")[0];
            
            $(this.el).onTapEnd(function(gesture) {
                $(self.box).show();
            });
        },
    
        // Select item
        select: function(index) {
            var i;
            for(i = 0; i < this.items.length; i++) {
                $(this.items[i].el).removeClass("selected");                
            }
            $(this.items[index].el).setClass("selected");
            this.value = this.items[index].el.getAttribute("moo-select-value");
            this.input.value = this.value;
            $(this.text).html(this.items[index].el.innerHTML);
            $(this.box).hide();
        }
    }
    
    /*
     * Overlay prototype
     */   
    Overlay.prototype = {
        show: function() {
            $(this.el).show();
        },
        hide: function() {
            $(this.el).hide();
        },
    }
    
    /*
     * Tooltip prototype
     */   
    Tooltip.prototype = {}
    
    /*
     * Switch prototype
     */   
    Switch.prototype = {
        /**
        * Toggle control
        *
        * @this {Switch}
        * @example var myCheck =  $("#Switch1").Switch();
        * myCheck.toggle();
        */
        toggle: function (value) {
            var el = $(this.el);

            if (value !== undefined) {
                this.value = parseInt(value);
            } else {
                if (this.value === 0) {
                    this.value = 1;
                } else {
                    this.value = 0;
                }                                
            }
            
            if (this.value === 0) {
                el.removeClass("moo-on");
                el.setClass("moo-off");                
            } else {
                el.removeClass("moo-off");
                el.setClass("moo-on");                
            }

            this.input.value = this.value;
        }
    }
        
     /*
     * Text prototype
     */  
    Text.prototype = {
        clean: function() {
            this.input.value = "";
        }
    }
    
    /*
     * Radio prototype
     */   
    Radio.prototype = {
        // Make HTML
        _makeHTML: function() {
            var template = $.ui.templates["Radio"],
                i;
            
            this.el = document.createElement("div");
            this.el.innerHTML = _templateParse({
                template: template,
                self: this
            });
            
            this.input.parentElement.appendChild(this.el);            
            
        },
        
        activate: function(element) {
            var i = 0,
                j = 0,
                items = {},
                item;
                                
            if($(element.el).hasClass("moo-ui-radio-icon") === false) {
                item = $(element.el.parentElement).find(".moo-ui-radio-icon")[0];
            } else {
                item = element.el;
            }            
                
            for (i = this.mooItems.length; i--;) {
                items = $(this.mooItems[i]).find(".moo-ui-radio-icon");
                for (j = items.length; j--;) {
                    if (items[j] !== item) {
                        $(items[j]).removeClass("moo-active");
                        this.items[i].el.removeAttribute("checked");
                    } else {
                        $(items[j]).setClass("moo-active");
                        this.selectedIndex = i;                                              
                    }
                } 
            }
            
            this.items[this.selectedIndex].el.setAttribute("checked", "checked");

        }
    }

    /*
     * Checkbox prototype
     */   
    Checkbox.prototype = {
        // Make HTML
        _makeHTML: function() {
            var template = $.ui.templates["Checkbox"],
                i;
            
            this.el = document.createElement("div");
            this.el.innerHTML = _templateParse({
                template: template,
                self: this
            });
            
            this.input.parentElement.appendChild(this.el);            
            
        },
        
        activate: function(element) {
            var i = 0,
                j = 0,
                items = {},
                item,
                selectedIndex,
                checked = true;
                                
            if($(element.el).hasClass("moo-ui-checkbox-icon") === false) {
                item = $(element.el.parentElement).find(".moo-ui-checkbox-icon")[0];
            } else {
                item = element.el;
            }            
                
            for (i = this.mooItems.length; i--;) {
                items = $(this.mooItems[i]).find(".moo-ui-checkbox-icon");
                for (j = items.length; j--;) {
                    if (items[j] === item) {
                        if($(items[j]).hasClass("moo-active") === false) {
                            $(items[j]).setClass("moo-active");
                            checked = true;
                            selectedIndex = i;                                                                      
                        } else {
                            $(items[j]).removeClass("moo-active");
                            checked = false;
                            selectedIndex = i;                                                                                              
                        }
                    }
                } 
            }
            
            if (checked === true) {
                this.items[selectedIndex].el.setAttribute("checked", "checked");        
            } else {
                this.items[selectedIndex].el.removeAttribute("checked", "checked");
            }

        }
    }
    
    $.extend(Overlay.prototype, Tooltip.prototype);
    
    $.extend({
    
         ui: function(options) {
             options.el = this.el;
             switch (options.type) {
                 case "Switch":
                    return new Switch(options);
                    break;
                 case "Tooltip":
                    return new Tooltip(options);
                    break;
                 case "Text":
                    return new Text(options);
                    break;
                 case "TextArea":
                    return new TextArea(options);
                    break;
                 case "Select":
                    return new Select(options);
                    break;
                 case "Radio":
                    return new Radio(options);
                    break;
                 case "Checkbox":
                    return new Checkbox(options);
                    break;
             }
         }
    });
    
}($));


// Templates

(function() {
    $.ui = {
        templates: {
            Radio: '<div moo-template="foreach: input"><div class="moo-ui-radio"><label><span class="moo-ui-radio-label" moo-template="text: this.label"></span><span class="moo-ui-radio-icon"> &nbsp;</span></label></div></div>',

            Checkbox: '<div moo-template="foreach: input"><div class="moo-ui-checkbox"><label><span class="moo-ui-checkbox-label" moo-template="text: this.label"></span><span class="moo-ui-checkbox-icon"> &nbsp;</span></label></div></div>'
            
        }
    }
}());