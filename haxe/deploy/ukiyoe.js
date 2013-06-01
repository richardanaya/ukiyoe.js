var Ukiyoe = {};

Ukiyoe.Game = function(width,height,fullscreen,showStats){
    var screen = document.getElementById("screen");
    screen.width = width;
    screen.height = height;
    this.width = screen.width;
    this.height = screen.height;
    this.screen = screen;
    this.backScreen = null;
    this.fullscreen = fullscreen;
    this.time = 0;
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

    if(showStats){
        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        document.body.appendChild( stats.domElement );
        this.stats = stats;
    }
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
        var currentTime = Ukiyoe.getTimeStamp();
        if(this.lastTime != null){
            var deltaTime = (currentTime-this.lastTime)/1000;
            this.scene.time += deltaTime;
            if(this.stats){
                this.stats.begin();
            }
            this.scene.run(this.context,deltaTime);
            if(this.stats){
                this.stats.end();
            }
            if(this.fullscreen){
                if(this.screenContext.imageSmoothingEnabled) {this.screenContext.imageSmoothingEnabled = false;}
                if(this.screenContext.webkitImageSmoothingEnabled) {this.screenContext.webkitImageSmoothingEnabled = false;}
                if(this.screenContext.mozImageSmoothingEnabled) {this.screenContext.mozImageSmoothingEnabled = false;}
                this.screenContext.drawImage(this.backScreen,this.backPosition.x,this.backPosition.y,this.backPosition.width,this.backPosition.height);

            }
        }
        this.lastTime = currentTime;
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
        this.time = 0;
        window.requestAnimationFrame(this.run.bind(this),this.screen);
    }
};

Ukiyoe.Game.prototype.changeScene = function(scene){
    var _this = this;
    if(this.scene){
        this.scene.unload();
    }
    this.scene = scene;
    this.scene.time = 0;
    this.scene.width = this.width;
    this.scene.height = this.height;
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
    this.ctx.save();
    this.ctx.translate(sprite.x, sprite.y);
    if(sprite.flipX && sprite.flipY){
        this.ctx.translate(sprite.img.width, sprite.img.height);
        this.ctx.scale(-1, -1);
    }
    else if(sprite.flipX){
        this.ctx.translate(sprite.img.width, 0);
        this.ctx.scale(-1, 1);
    }
    else if(sprite.flipY){
        this.ctx.translate(0, sprite.img.height);
        this.ctx.scale(1, -1);
    }
    this.ctx.drawImage(sprite.img,0,0);
    this.ctx.restore();
    this.ctx.fillStyle = "red";
    if(sprite.showHitBox){
        for(var x = 0 ;x < sprite.img.width; x++){
            for(var y = 0 ;y < sprite.img.height; y++){
                var mx = x;
                if(sprite.flipX){
                    mx = sprite.img.width-1-mx;
                }
                var my = y;
                if(sprite.flipY){
                    my = sprite.img.height-1-my;
                }
                if(sprite.img.mask[my*sprite.img.width+mx]){
                    this.ctx.fillRect(sprite.x+x,sprite.y+y,1,1);
                }
            }
        }
    }
}

Ukiyoe.Scene = function(){
    this.resources = {
        images: {},
        sounds: {},
        music: {}
    };
    this.images = {};
    this.sounds = {};
    this.music = {};
    this.ready = false;
};

Ukiyoe.Scene.prototype.addImageResource = function(name,file){
    this.images[name] = file;
};

Ukiyoe.Scene.prototype.addSoundResource = function(name,files){
    this.sounds[name] = files;
};

Ukiyoe.Scene.prototype.addMusicResource = function(name,files){
    this.music[name] = files;
};

Ukiyoe.Scene.prototype.playSound = function(name){
    this.resources.sounds[name].play();
};

Ukiyoe.Scene.prototype.playMusic = function(name){
    this.resources.music[name].play();
};

Ukiyoe.Scene.prototype.createSprite = function(name){
    return new Ukiyoe.Sprite(this.resources.images[name]);
};

Ukiyoe.Scene.prototype.createSpriteAnimation = function(anims){
    var json = {};
    for(var i=0;i<anims.length;i++){
        var anim = anims[i];
        json[anim.name] = {
            flipX: anim.flipX,
            flipY: anim.flipY,
            fps: anim.fps
        }
        var frames = [];
        for(var j=0;j<anim.frames.length;j++){
            frames.push(this.resources.images[anim.frames[j]]);
        }
        json[anim.name].frames = frames;
    }
    return Ukiyoe.AnimatedSprite.fromJSON(json);
};


Ukiyoe.Scene.prototype.run = function(){
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
        var ass = assetToLoad[numAssets-1]
        if(ass.type=="image"){
            var img = new Image();
            img.onload = function(){
                _this.resources.images[ass.name] = img;
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
            img.src = ass.path;
        }
        if(ass.type=="sound"){
            var sound = new Howl({
                urls: ass.path,
                autoplay: false,
                loop: false,
                volume: 1,
                onload: function() {
                    _this.resources.sounds[ass.name] = sound;
                    numAssets--;
                    loadAsset();
                }
            });
        }
        if(ass.type=="music"){
            var music = new Howl({
                urls: ass.path,
                autoplay: false,
                loop: true,
                volume: 1,
                onload: function() {
                    _this.resources.music[ass.name] = music;
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
    this.setImage(img);
    this.x = 0;
    this.y = 0;
    this.showHitBox = false;
    this.flipX = false;
    this.flipY = false;
};

Ukiyoe.Sprite.prototype.setImage = function(img){
    this.img = img;
    this.width = img.width;
    this.height = img.height;
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
        right: this.x+this.width-1,
        bottom: this.y+this.height-1
    }
}

Ukiyoe.Sprite.prototype.collidesWith = function(sprite){
    var intersect = this.intersect(this.getRect(),sprite.getRect());

    if(intersect != null){
        for(var x = intersect.left; x <= intersect.right; x++){
            for(var y = intersect.top; y <= intersect.bottom; y++){
                var myX = x-this.x;
                var myY = y-this.y;
                var ourMaskX = myX;
                if(this.flipX){
                    ourMaskX = this.img.width-1-ourMaskX;
                }
                var ourMaskY = myY;
                if(this.flipY){
                    ourMaskY = this.img.height-1-ourMaskY;
                }
                var myMask = this.img.mask[this.img.width*ourMaskY+ourMaskX];
                var theirX = x-sprite.x;
                var theirY = y-sprite.y;
                var theirMaskX = theirX;
                if(sprite.flipX){
                    theirMaskX = sprite.img.width-1-theirMaskX;
                }
                var theirMaskY = theirY;
                if(sprite.flipY){
                    theirMaskY = sprite.img.height-1-theirMaskY;
                }
                var theirMask = sprite.img.mask[sprite.img.width*theirY+theirX];
                if(myMask && theirMask){
                    return true;
                }
            }
        }
    }

    return false;
};

Ukiyoe.AnimatedSprite = function(img){
    Ukiyoe.Sprite.call(this,img);
    this.anims = {}
};

Ukiyoe.AnimatedSprite.prototype = Object.create(Ukiyoe.Sprite.prototype);

Ukiyoe.AnimatedSprite.fromFramesAndFPS = function(frames,fps){
    var anim = new Ukiyoe.AnimatedSprite(frames[0]);
    anim.anims.default = {
        name: "default",
        frames : frames,
        fps : fps,
        timePerFrame : 1/fps,
        timeLength : frames.length*1/fps
    };
    anim.time = 0;
    anim.currentAnimation = anim.anims.default;
    return anim;
};

Ukiyoe.AnimatedSprite.fromJSON = function(json){
    var anims = {};
    var firstAnim = null;
    for(var j in json){
        if(firstAnim == null){
            firstAnim = j;
        }
        anims[j] = {
            name: j,
            frames : json[j].frames,
            fps : json[j].fps,
            timePerFrame : 1/json[j].fps,
            timeLength : json[j].frames.length*1/json[j].fps
        };
        if(json[j].flipX){anims[j].flipX = true; }
        else { anims[j].flipX = false; }
        if(json[j].flipY){anims[j].flipY = true; }
        else { anims[j].flipY = false; }
    }
    var anim = new Ukiyoe.AnimatedSprite(anims[firstAnim].frames[0]);
    anim.anims = anims;
    anim.time = 0;
    anim.currentAnimation = anim.anims[j];
    return anim;
};

Ukiyoe.AnimatedSprite.prototype.setAnimation = function(name){
    if(this.anims[name] != this.currentAnimation){
        this.currentAnimation = this.anims[name];
        this.setImage(this.currentAnimation.frames[0]);
        this.flipX = this.currentAnimation.flipX;
        this.flipY = this.currentAnimation.flipY;
    }
};

Ukiyoe.AnimatedSprite.prototype.update = function(deltaTime){
    this.time+=deltaTime;
    this.time %= this.currentAnimation.timeLength;
    var index = Math.floor(this.time/this.currentAnimation.timePerFrame);
    this.setImage(this.currentAnimation.frames[index]);
    this.flipX = this.currentAnimation.flipX;
    this.flipY = this.currentAnimation.flipY;
};

Ukiyoe.getTimeStamp = function(){
    if (window.performance.now) {
        return window.performance.now();
    } else {
        if (window.performance.webkitNow) {
            return window.performance.webkitNow();
        } else {
            return new Date().getTime();
        }
    }
};

Ukiyoe.Animation = function(name,frames){
    this.name = name;
    this.frames = frames;
    this.flipX = false;
    this.flipY = false;
    this.fps = 0;
}

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