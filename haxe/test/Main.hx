package test;
import ukiyoe.Game;
import ukiyoe.DrawingContext;
import ukiyoe.Key;
import ukiyoe.Sprite;
import ukiyoe.SpriteAnimation;

class TestScene extends ukiyoe.Scene
{
    var player:SpriteAnimation;
    var enemy:Sprite;
    var shit:Sprite;
    var triggered:Bool;

    public function new()
    {
        super();
        addImageResource("player","player.png");
        addImageResource("shit","shit.png");
        addImageResource("bird_0","bird_of_paradise_0.png");
        addImageResource("bird_1","bird_of_paradise_1.png");
        addImageResource("bird_2","bird_of_paradise_2.png");
        addSoundResource("bonk",["bonk.ogg","bonk.mp3"]);
        addMusicResource("background_music",["music.ogg","music.mp3"]);
    }

    public override function initialize(){
        

        var left = new Animation("left",["bird_0","bird_1","bird_2"]);
        left.flipX = true;
        left.fps = 3;

        var right = new Animation("right",["bird_0","bird_1","bird_2"]);
        right.fps = 3;

        player = createSpriteAnimation([left,right]);
        player.setAnimation("left");

        enemy = createSprite("player");
        enemy.x = width/2-player.width/2;
        enemy.y = 50;

        playMusic("background_music");

        this.player.setAnimation("right");
        this.player.x = 10;
        this.player.y = 100;

        this.enemy.x = Math.floor(width/2-this.enemy.width/2);
        this.enemy.y = height - 50;

        this.shit = null;
        this.triggered = false;
    }

    public override function run(ctx:DrawingContext,deltaTime:Float){
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
            this.shit = createSprite("shit");
            if(this.player.currentAnimation.name == "right"){
                this.shit.x = this.player.x+10;
                this.shit.y = this.player.y+13;
            }
            if(this.player.currentAnimation.name == "left"){
                this.shit.x = this.player.x+this.player.width-10;
                this.shit.y = this.player.y+13;
            }
            this.triggered = false;
        }

        if(this.shit != null){
            this.shit.y += 1;

            if(this.shit.collidesWith(this.enemy)){
                playSound("bonk");
                this.shit = null;
            }
        }

        this.enemy.x = Math.floor(width/2-this.enemy.width/2+Math.sin(time)*100);


        ctx.clear("#87cefa");
        if(this.shit != null){
            ctx.drawSprite(this.shit);
        }
        ctx.drawSprite(this.player);
        ctx.drawSprite(this.enemy);
    }
}

class Main
{
    static function main(){ new Main(); }
    public function new()
    {
        var game = new ukiyoe.Game(256,224,true,true);
        var s = new TestScene();
        game.changeScene(s);
        game.play();
    }
}