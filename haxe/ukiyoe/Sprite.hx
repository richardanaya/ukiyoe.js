package ukiyoe;

extern class Sprite {
	public var x:Float;
	public var y:Float;
	public var width:Float;
	public var height:Float;
	public function collidesWith(sprite:Sprite):Bool;
}