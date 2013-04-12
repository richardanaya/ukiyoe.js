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
            player: "player.png",
            bird_0: "bird_of_paradise_0.png",
            bird_1: "bird_of_paradise_1.png",
            bird_2: "bird_of_paradise_2.png"
        };
        this.sounds = {
            bonk : ['bonk.ogg','bonk.mp3']
        }
        this.music = {
            background_music : ['music.ogg','music.mp3']
        }
    };
    DemoScene.prototype = Object.create(Ukiyoe.Scene.prototype);

    DemoScene.prototype.initialize = function(){
        this.player = Ukiyoe.AnimatedSprite.fromJSON({
                left: {
                    frames: [this.resources.images.bird_0,this.resources.images.bird_1,this.resources.images.bird_2,this.resources.images.bird_1],
                    flipX: true,
                    flipY: false,
                    fps:3
                },
                right: {
                    frames: [this.resources.images.bird_0,this.resources.images.bird_1,this.resources.images.bird_2,this.resources.images.bird_1],
                    fps:3
                }
            }
        );
        this.player.setAnimation("right");
        this.player.x = 10;
        this.player.y = 100;

        this.enemy = new Ukiyoe.Sprite(this.resources.images.player);
        this.enemy.x = 200
        this.enemy.y = 100;

        this.resources.music.background_music.play();
    };

    DemoScene.prototype.run = function(ctx,deltaTime){
        this.player.update(deltaTime);
        var oldX = this.player.x;
        var oldY = this.player.y;

        if(Key.isDown(Key.RIGHT_ARROW)  || Key.isDown(Key.D)){
            this.player.setAnimation("right");
            this.player.x += 1;
        }
        if(Key.isDown(Key.LEFT_ARROW) || Key.isDown(Key.A)){
            this.player.setAnimation("left");
            this.player.x -= 1;
        }
        if(Key.isDown(Key.DOWN_ARROW) || Key.isDown(Key.S)){
            this.player.y += 1;
        }
        if(Key.isDown(Key.UP_ARROW) || Key.isDown(Key.W)){
            this.player.y -= 1;
        }

        if(this.player.collidesWith(this.enemy)){
            this.player.x = oldX;
            this.player.y = oldY;
            this.resources.sounds.bonk.play();
        }

        stats.begin();
        ctx.clear("#87cefa");
        ctx.drawSprite(this.player);
        ctx.drawSprite(this.enemy);
        stats.end();
    };

    game.changeScene(new DemoScene());
    game.play();
});
