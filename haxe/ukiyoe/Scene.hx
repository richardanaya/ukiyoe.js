package ukiyoe;
import ukiyoe.DrawingContext;
import ukiyoe.Sprite;
import ukiyoe.SpriteAnimation;

extern class Scene {
	public var width:Float;
	public var height:Float;
	public var time:Float;
	public function new():Void;
	public function initialize():Void; 
	public function run(ctx:DrawingContext,delta:Float):Void; 
	public function addImageResource(name:String,file:String):Void; 
	public function addSoundResource(name:String,files:Array<String>):Void; 
	public function addMusicResource(name:String,files:Array<String>):Void; 
	public function playSound(name:String):Void;
	public function playMusic(name:String):Void;
	public function createSprite(name:String):Sprite;
	public function createSpriteAnimation(anims:Array<Animation>):SpriteAnimation;
}