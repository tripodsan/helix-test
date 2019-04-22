function ScrollAnimation () {

    this.selector="";
    this.animations=[];
    this.scrollY=-1;
    this.scrollYBottom=0;

    // setup onload
    this.setup = function (config) {
        for (var i=0; i<config.length; i++) {
            var conf=config[i];
            var a={};
            a.animation=conf.animation;
            a.selector=conf.selector;
            a.elems=document.querySelectorAll(conf.selector);
            this.animations.push(a);   
        }
    }

    // update elements
    this.updateElement = function(el, animation) {
        var progress=0.0;
        var offsetTop = el.getBoundingClientRect().top+window.pageYOffset;

        if (this.scrollY > offsetTop) {
            progress=1.0;
        } else if (this.scrollYBottom < offsetTop) {
            progress=0.0;
        } else {
            progress=1.0-(offsetTop - this.scrollY)/window.innerHeight;
        }

        // HACK: manually specified animation
        progress=progress*2;
        if (progress>1) progress=1;
        
        if (animation == "eager-appear") {
            var transY=100-progress*100;
            var opacity=progress;
            el.style=`opacity: ${opacity}; transform: translateY(${transY}px)`;    
        }

        if (animation == "wipe") {
            var right=Math.round(100-progress*100);
            el.style=`clip-path: inset(0 ${right}% 0 0)`;
        }

    }

    // update to get called by requestAnimationFrame
    this.update = function (scrollY) {
        
        if (scrollY == this.scrollY) return;

        this.scrollY = scrollY;
        this.scrollYBottom = scrollY+window.innerHeight;

        for (var i=0; i<this.animations.length;i++) {
            var a = this.animations[i];
            for (var j=0; j<a.elems.length;j++) {
                this.updateElement(a.elems[j], a.animation);
            }
        }
    }
}
