package ukiyoe;
import ukiyoe.Sprite;

class Animation {
	public var name:String;
	public var flipX:Bool = false;
	public var flipY:Bool = false;
	public var fps:Int = 0;
	public var frames:Array<String>;

	public function new(name:String,frames:Array<String>):Void {
		this.name = name;
		this.frames = frames;
	}
}

extern class SpriteAnimation extends Sprite {
	public var currentAnimation:Animation;
	public function setAnimation(name:String):Void;
	public function update(delta:Float):Void;
}