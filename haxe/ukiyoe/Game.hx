package ukiyoe;
import ukiyoe.Scene;
extern class Game {
    public function new(width:Int,height:Int,fullscreen:Bool,showStats:Bool):Void;
    public function changeScene(Scene:ukiyoe.Scene):Void;
    public function play():Void;
}