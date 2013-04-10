var Ukiyoe = {};

Ukiyoe.Game = function(screen,fullscreen){
    this.width = screen.width;
    this.height = screen.height;
    this.screen = screen;
    this.backScreen = null;
    this.fullscreen = fullscreen;
    if(this.fullscreen){
        window.onresize = this.onResize.bind(this);
        this.screenContext = this.screen.getContext('2d');

        this.backScreen = document.createElement('canvas');
        this.backScreen.width = screen.width;
        this.backScreen.height = screen.height;
        this.context = new Ukiyoe.DrawingContext(this.backScreen);
        this.onResize();
    }
    else {
        this.context = new Ukiyoe.DrawingContext(this.screen);
    }
    if(this.context.ctx.imageSmoothingEnabled) {this.context.ctx.imageSmoothingEnabled = false;}
    if(this.context.ctx.webkitImageSmoothingEnabled) {this.context.ctx.webkitImageSmoothingEnabled = false;}
    if(this.context.ctx.mozImageSmoothingEnabled) {this.context.ctx.mozImageSmoothingEnabled = false;}
    this.running = false;
    this.scene = null;
};

Ukiyoe.Game.prototype.onResize = function(){
    this.backPosition = {x:0,y:0,width:this.width,height:this.height};

    var w = this.width*(window.innerHeight/this.height);
    var h = this.height*(window.innerWidth/this.width);
    if( (window.innerWidth >= window.innerHeight) || h > window.innerHeight){
        this.backPosition.x = Math.floor((window.innerWidth-w)/2);
        this.backPosition.y = 0;
        this.backPosition.width = w;
        this.backPosition.height = window.innerHeight;
    }
    if(window.innerWidth < window.innerHeight  || w > window.innerWidth){
        this.backPosition.x = 0;
        this.backPosition.y = Math.floor((window.innerHeight-h)/2);
        this.backPosition.width = window.innerWidth;
        this.backPosition.height = h;
    }
    this.screen.width = window.innerWidth;
    this.screen.height = window.innerHeight;
    this.screenContext.clearRect(0,0,this.screen.width,this.screen.height);
};


Ukiyoe.Game.prototype.run = function(){
    if(this.scene.ready){
        this.scene.run(this.context);
        if(this.fullscreen){
            if(this.screenContext.imageSmoothingEnabled) {this.screenContext.imageSmoothingEnabled = false;}
            if(this.screenContext.webkitImageSmoothingEnabled) {this.screenContext.webkitImageSmoothingEnabled = false;}
            if(this.screenContext.mozImageSmoothingEnabled) {this.screenContext.mozImageSmoothingEnabled = false;}
            this.screenContext.drawImage(this.backScreen,this.backPosition.x,this.backPosition.y,this.backPosition.width,this.backPosition.height);

        }
    }
    if(this.running){
        window.requestAnimationFrame(this.run.bind(this),this.screen);
    }
};

Ukiyoe.Game.prototype.play = function(){
    if(!this.scene){
        console.log("Game has no scene")
    }
    if(!this.running){
        this.running = true;
        window.requestAnimationFrame(this.run.bind(this),this.screen);
    }
};

Ukiyoe.Game.prototype.changeScene = function(scene){
    var _this = this;
    if(this.scene){
        this.scene.unload();
    }
    this.scene = scene;
    this.scene.load();
};

Ukiyoe.DrawingContext = function(canvas){
    this.width = canvas.width;
    this.height = canvas.height;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
};

Ukiyoe.DrawingContext.prototype.clear = function(color){
    if(!color){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    }
    else {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.restore();
    }
};

Ukiyoe.DrawingContext.prototype.drawSprite = function(sprite){
    this.ctx.drawImage(sprite.img,sprite.x,sprite.y);
}

Ukiyoe.Scene = function(){
    this.resources = {
        images: {},
        sounds: {},
        music: {}
    };
    this.ready = false;
};

Ukiyoe.Scene.prototype.load = function(complete){
    var assetToLoad = [];
    for(var i in this.images){
        assetToLoad.push({type:"image",name:i,path:this.images[i]})
    }
    for(var i in this.sounds){
        var path = this.sounds[i]
        if(typeof(path)=="string"){
            path = [path];
        }
        assetToLoad.push({type:"sound",name:i,path:path});
    }
    for(var i in this.music){
        var path = this.music[i]
        if(typeof(path)=="string"){
            path = [path];
        }
        assetToLoad.push({type:"music",name:i,path:path});
    }

    var numAssets = assetToLoad.length;

    var _this = this;

    var loadAsset = function(){
        if(numAssets == 0){
            _this.ready = true;
            _this.initialize();
            return;
        }

        if(assetToLoad[numAssets-1].type=="image"){
            var img = new Image();
            img.onload = function(){
                _this.resources.images[assetToLoad[numAssets-1].name] = img;
                var c = document.createElement("canvas");
                c.width = img.width;
                c.height = img.height;
                var tctx = c.getContext('2d');
                tctx.drawImage(img,0,0);
                var d = tctx.getImageData(0,0,img.width,img.width).data;
                var mask = new Uint8Array(img.width*img.height);
                for(var x = 0 ; x < img.width; x++ ){
                    for(var y = 0 ; y < img.height; y++ ){
                        var alpha = d[(y*img.width+x)*4+3];
                        if(alpha==0){
                            mask[y*img.width+x] = 0;
                        }
                        else {
                            mask[y*img.width+x] = 1;
                        }
                    }
                }
                img.mask = mask;
                numAssets--;
                loadAsset();
            };
            img.src = assetToLoad[numAssets-1].path;
        }
        if(assetToLoad[numAssets-1].type=="sound"){
            var sound = new Howl({
                urls: assetToLoad[numAssets-1].path,
                autoplay: false,
                loop: false,
                volume: 1,
                onload: function() {
                    _this.resources.sounds[assetToLoad[numAssets-1].name] = sound;
                    numAssets--;
                    loadAsset();
                }
            });
        }
        if(assetToLoad[numAssets-1].type=="music"){
            var music = new Howl({
                urls: assetToLoad[numAssets-1].path,
                autoplay: false,
                loop: true,
                volume: 1,
                onload: function() {
                    _this.resources.music[assetToLoad[numAssets-1].name] = music;
                    numAssets--;
                    loadAsset();
                }
            });
        }
    }
    loadAsset();
};

Ukiyoe.Scene.prototype.unload = function(){

};

Ukiyoe.Sprite = function(img){
    this.img = img;
    this.width = img.width;
    this.height = img.height;
    this.x = 0;
    this.y = 0;
};

Ukiyoe.Sprite.prototype.intersect = function(r1,r2){
    var intersects =  !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);

    if(intersects)
    {
        return {
            left: Math.max(r1.left, r2.left),
            top: Math.max(r1.top, r2.top),
            right: Math.min( r1.right, r2.right),
            bottom: Math.min(r1.bottom, r2.bottom)
        };
    }

    return null;
}

Ukiyoe.Sprite.prototype.getRect = function(){
    return {
        top: this.y,
        left: this.x,
        right: this.x+this.width,
        bottom: this.y+this.height
    }
}

Ukiyoe.Sprite.prototype.collidesWith = function(sprite){
    var intersect = this.intersect(this.getRect(),sprite.getRect());

    if(intersect != null){
        for(var x = intersect.left; x <= intersect.right; x++){
            for(var y = intersect.top; y <= intersect.bottom; y++){
                var myX = x-this.x;
                var myY = y-this.y;
                var myMask = this.img.mask[this.img.width*myY+myX];
                var theirX = x-sprite.x;
                var theirY = y-sprite.y;
                var theirMask = sprite.img.mask[sprite.img.width*theirY+theirX];
                if(myMask && theirMask){
                    return true;
                }
            }
        }
    }

    return false;
};

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());