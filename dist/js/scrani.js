(() => {
    const scrani = (() => {
    
        const scrani = { 
            animations: [],
            scrollY: -1,
            scrollYBottom:  0,
        }

        // setup onload
        scrani.setup = (config) => {
            for (var i=0; i<config.length; i++) {
                var conf=config[i];
                var a={};
                a.animation=conf.animation;
                a.selector=conf.selector;
                a.elems=document.querySelectorAll(conf.selector);
                scrani.animations.push(a);   
            }
        }

        // update single element
        scrani.updateElement = (el, animation) => {
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
        scrani.update = (scrollY) => {
            
            if (scrollY == scrani.scrollY) return;

            scrani.scrollY = scrollY;
            scrani.scrollYBottom = scrollY+window.innerHeight;

            for (var i=0; i<scrani.animations.length;i++) {
                var a = scrani.animations[i];
                for (var j=0; j<a.elems.length;j++) {
                    scrani.updateElement(a.elems[j], a.animation);
                }
            }
        }

        return (scrani)
    })();

    window.scrani = scrani; 

})();

