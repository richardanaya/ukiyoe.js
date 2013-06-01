$(document).ready(function(){
    var DemoScene = function(){
        Ukiyoe.Scene.call(this);
        this.addImageResource("player","player.png");
        this.addImageResource("shit","shit.png");
        this.addImageResource("bird_0","bird_of_paradise_0.png");
        this.addImageResource("bird_1","bird_of_paradise_1.png");
        this.addImageResource("bird_2","bird_of_paradise_2.png");
        this.addSoundResource("bonk",["bonk.ogg","bonk.mp3"]);
        this.addMusicResource("background_music",["music.ogg","music.mp3"]);
    };
    DemoScene.prototype = Object.create(Ukiyoe.Scene.prototype);

    DemoScene.prototype.initialize = function(){
        var left = this.createAnimation("left",["bird_0","bird_1","bird_2"]);
        left.flipX = true;
        left.fps = 3;

        var right = this.createAnimation("right",["bird_0","bird_1","bird_2"]);
        right.fps = 3;

        this.player = this.createSpriteAnimation([left,right]);
        this.player.setAnimation("left");

        this.enemy = this.createSprite("player");
        this.enemy.x = this.width/2-this.player.width/2;
        this.enemy.y = 50;

        this.playMusic("background_music");

        this.player.setAnimation("right");
        this.player.x = 10;
        this.player.y = 100;

        this.enemy.x = Math.floor(this.width/2-this.enemy.width/2);
        this.enemy.y = this.height - 50;

        this.shit = null;
        this.triggered = false;

        this.setClearColor("#87cefa");
        this.add(this.player);
        this.add(this.enemy);
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
        if(Key.isDown(Key.SPACEBAR)){
            this.triggered = true;
        }
        if(Key.isUp(Key.SPACEBAR) && this.triggered){
            this.remove(this.shit);
            this.shit = new Ukiyoe.Sprite(this.resources.images.shit);
            this.add(this.shit);
            if(this.player.currentAnimation.name == "right"){
                this.shit.x = this.player.x+10;
                this.shit.y = this.player.y+13;
            }
            if(this.player.currentAnimation.name == "left"){
                this.shit.x = this.player.x+this.player.width-10;
                this.shit.y = this.player.y+13;
            }
            this.triggered = false
        }

        if(this.shit != null){
            this.shit.y += 1;

            if(this.shit.collidesWith(this.enemy)){
                this.resources.sounds.bonk.play();
                this.remove(this.shit);
                this.shit = null;
            }
        }

        this.enemy.x = Math.floor(game.width/2-this.enemy.width/2+Math.sin(game.time)*100);
    };

    var game = new Ukiyoe.Game(256,224,true,true);
    game.changeScene(new DemoScene());
    game.play();
});
