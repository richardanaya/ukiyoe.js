package ukiyoe;
import ukiyoe.Sprite;
extern class DrawingContext {
	public function new():Void;
	public function clear(color:String):Void;
	public function drawSprite(sprite:Sprite):Void;
}