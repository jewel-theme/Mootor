/*
 * Mootor Navigation
 */

(function (Moo) {
    // Module dependencies
    var Fx = Moo.Fx,
        Event = Moo.Event,
        listeners = Event.listeners,

        Panels;

    Panels = function (options) {

        var i,
            panel,
            panels;

        this.el = options.el;
        this.headerId = options.header_id !== undefined ? options.header_id : "header";
        this.panelClass = options.panel_class !== undefined ? options.panel_class : "panel";
        this.navClass = options.nav_class !== undefined ? options.nav_class : "nav";
        this.hiddenClass = options.hidden_class !== undefined ? options.hidden_class : "hidden";
        this.margin = options.panel_margin !== undefined ? options.panel_margin : 40;
        this.width = options.width !== undefined ? options.width : Moo.view.clientW;
        this.height = options.height !== undefined ? options.height : Moo.view.clientH;
        this.x = 0;
        this.y = 0;
        this.current = 0;
        this.back = 0;
        this.panels = [];
        this.header = this.header.init(this); 
 
        panels = this.el.getElementsByClassName(this.panelClass);
        this.count = panels.length;

        for (i = panels.length; i--;) {
            this.panels[i] = {el: panels[i]};
            panel =  this.panels[i];
            panel.anchors = panel.el.getElementsByClassName(this.navClass);
            panel.height = panel.el.offsetHeight;
            panel.hidden = panel.el.getElementsByClassName(this.hiddenClass);
        }

        // FIXME CHECK
        this.onDragStart = this.start;
        this.onDragMove = this.move;
        this.onDragEnd = this.check;
        Event.bind(this.el, "onDrag", this);

        if (document.body.style.overflow !== "hidden") {
            document.body.style.overflow = "hidden";
        }
        this.init();
        
        return this;

    };
    
    

    Panels.prototype = {
    
        header: {
            init: function(panel) {                
                var header = {};
                header.el = document.getElementById(panel.headerId);
                if (header.el) {
                    panel.nav(header);
                    Fx.fullWidth(header.el);
                    panel.top = header.el.offsetHeight;
                    panel.height = Moo.view.clientH - panel.top;
                    panel.el.style.marginTop = panel.top + "px";        
                    return header;
                }
            }
        },

        nav: function (obj) {
            var i;
            obj.anchors = obj.el.getElementsByClassName(this.navClass);
        },
        
        init: function () {

            var onTouch,
                j,
                i,
                panels = this,
                panel;

            onTouch = function () {
                if (listeners.isDraggingX === false && listeners.isDraggingY === false) {
                    panels.set(this.el.rel);
                }
                return false;
            };

            // Reset styles and set anchor links
            for (i = this.count; i--;) {

                panel = this.panels[i];

                if( this.width === undefined) {
                    Fx.fullWidth(panel.el);
                } else {
                    panel.el.style.width = this.width + "px";
                }
                
                panel.el.style.overflow = 'hidden';

                if (i > 0) {
                    panel.el.style.left = -((this.width + this.margin) * 4) + "px";
                    panel.el.style.top = "0px";
                } else {
                    panel.el.style.left = "0px";
                }

                if (this.height > panel.height) {
                    panel.el.style.height = this.height + "px";
                    panel.height = this.height;
                }

                for (j = panel.anchors.length; j--;) {
                    if (panel.anchors[j].rel !== "") {
                        Event.bind(panel.anchors[j], "onTap", onTouch);
                    }
                }

            }

            if (this.header) {
                for (i = this.header.anchors.length; i--;) {
                    if (this.header.anchors[i].rel !== "") {
                        Event.bind(this.header.anchors[i], "onTap", onTouch);
                    }
                }
            }
            
        },
        
        start: function(e) {
            var target = event.target;
            window.setTimeout( function() { target.className += " active" }, 50);
        },
   
        /*      
         *      Move
         */
        move: function (e) {
            var duration = 0.5,
                element = this.el,
                panel =  this.panels[this.current],
                positions = {};
                
            // Compare with 0 is faster, the string is " active"
            if(event.target.className.indexOf("active") !== 0) {
                event.target.className = event.target.className.replace(" active","");
            }

            if (e.bounceBack === true) {

                if (this.y !== 0) {
                    element = panel.el;
                    if (e.distanceOriginY < 0) {
                        this.y = 0;
                    } else if (panel.height >= this.height) {
                        this.y = -(panel.height - this.height);
                    }
                }
                e.bounceBack = false;

            } else {

                if (e.isLoading === true) {
                    this.x = this.x + e.distanceX;
                } else if (listeners.isDraggingY === true) {
                    this.y = this.y + e.distanceY;
                    element = panel.el;
                }

                if ((listeners.isDraggingX || listeners.isDraggingY) && !e.largeMove) {
                    duration = 0;
                }
            }

            if (element === panel.el) {
                positions.x = 0;
                positions.y = this.y;
            } else {
                positions.x = this.x;
                positions.y = 0;
            }

            Fx.translate(element, positions, {transitionDuration: duration, callback: e.callback});

        },

        /*      
         *      Check move for change panels or bounce back
         */
        check: function (e) {

            var bouncedist,
                boostdist;

            event.target.className = event.target.className.replace(" active","");
            if (listeners.isDraggingY) {

                // Velocity boost movement
                if (e.velocity.y !== 0) {
                    boostdist = e.velocity.y;
                    e.velocity.y = 0;
                    this.move({
                        distanceY: boostdist * 10,
                        largeMove: true,
                        isLoading: false,
                        callback: this.check(e)
                    });
                }

                // Bounce back
                bouncedist = this.height - this.panels[this.current].height;
                if (this.y >= 0 || this.panels[this.current].height -  this.height < -this.y) {
                    e.largeMove = true;
                    e.bounceBack = true;
                    this.move(e);
                }

            }

        },

        /*      
         *      Set current panel
         */
        set: function (pid) {

            var i;

            // Get panel by id and load it
            for (i = this.count; i--;) {
                if (this.panels[i].el.id === pid) {
                    if (this.current > 0) {
                        this.back = this.current;
                    }
                    this.current = i;
                    this.y = 0;
                    this.load();
                }
            }

        },

        /*      
         *      Load current panel
         */
        load: function () {

            var distance,
                panel,
                cb,
                back,
                i;

            panel = this.panels[this.current];
            back = this.panels[this.back];

            for (i = panel.hidden.length; i--;) {
                Fx.hide(panel.hidden[i]);
            }
            for (i = back.hidden.length; i--;) {
                Fx.hide(back.hidden[i]);
            }

            Fx.clean(panel.el);
            Fx.clean(back.el);

            cb = function () {
                for (i = panel.hidden.length; i--;) {
                    Fx.show(panel.hidden[i]);
                }
            };

            if (this.current === 0) {
                // Left 
                distance = 0;
                if (this.back) {
                    back.el.style.left =  this.width + this.margin + "px";
                }

            } else {
                // Right
                distance = this.width + this.margin;
                panel.el.style.left = distance + "px";

                if (this.back && this.back !== this.current) {
                    back.el.style.left = -distance * 4 + "px";
                }

            }

            this.move({
                distanceX: -distance - this.x,
                largeMove: true,
                isLoading: true,
                callback: cb
            });


        }

    };

     /*
      *     Public
      */
    Moo.Nav = {

        panels: function (options) {
            if (typeof options !== "object") {
                options = {};
            }
            options.el = this.el;
            return new Panels(options);
        }

    };

    Moo.extend(Moo.Nav);

}($));
