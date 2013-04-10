$(document).ready(function(){

    var stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

// Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild( stats.domElement );

    var game = new Ukiyoe.Game(document.getElementById('screen'),true);

    var DemoScene = function(){
        Ukiyoe.Scene.call(this);
        this.images = {
            player: "bunny.png"
        };
    };
    DemoScene.prototype = Object.create(Ukiyoe.Scene.prototype);

    DemoScene.prototype.initialize = function(){
        this.player = new Ukiyoe.Sprite(this.resources.images.player);
        this.player.x = 10;
        this.player.y = 100;

        this.enemy = new Ukiyoe.Sprite(this.resources.images.player);
        this.enemy.x = 200
        this.enemy.y = 100;

    };

    DemoScene.prototype.run = function(ctx){
        var gx = 0;
        var gy = 0;

        var gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0];
        if(gamepad){
            gx = gamepad.axes[0];
            gy = gamepad.axes[1];
        }

        var tolerance = .4;
        if(gx >= tolerance){
            gx = 1;
        }
        if(gx <= -tolerance){
            gx = -1;
        }
        if(gy >= tolerance){
            gy = 1;
        }
        if(gy <= -tolerance){
            gy = -1;
        }

        var oldX = this.player.x;
        var oldY = this.player.y;

        if(gx == 1){
            this.player.x += 1;
        }
        if(gx == -1){
            this.player.x -= 1;
        }
        if(gy == 1){
            this.player.y += 1;
        }
        if(gy == -1){
            this.player.y -= 1;
        }

        if(this.player.collidesWith(this.enemy)){
            this.player.x = oldX;
            this.player.y = oldY;
        }

        stats.begin();
        ctx.clear("blue");
        ctx.drawSprite(this.player);
        ctx.drawSprite(this.enemy);
        stats.end();
    };

    game.changeScene(new DemoScene());
    game.play();
});
