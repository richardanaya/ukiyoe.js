function $extend(from, fields) {
	function inherit() {}; inherit.prototype = from; var proto = new inherit();
	for (var name in fields) proto[name] = fields[name];
	return proto;
}
var HxOverrides = function() { }
HxOverrides.__name__ = true;
HxOverrides.dateStr = function(date) {
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var mi = date.getMinutes();
	var s = date.getSeconds();
	return date.getFullYear() + "-" + (m < 10?"0" + m:"" + m) + "-" + (d < 10?"0" + d:"" + d) + " " + (h < 10?"0" + h:"" + h) + ":" + (mi < 10?"0" + mi:"" + mi) + ":" + (s < 10?"0" + s:"" + s);
}
HxOverrides.strDate = function(s) {
	switch(s.length) {
	case 8:
		var k = s.split(":");
		var d = new Date();
		d.setTime(0);
		d.setUTCHours(k[0]);
		d.setUTCMinutes(k[1]);
		d.setUTCSeconds(k[2]);
		return d;
	case 10:
		var k = s.split("-");
		return new Date(k[0],k[1] - 1,k[2],0,0,0);
	case 19:
		var k = s.split(" ");
		var y = k[0].split("-");
		var t = k[1].split(":");
		return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
	default:
		throw "Invalid date format : " + s;
	}
}
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
}
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
}
HxOverrides.remove = function(a,obj) {
	var i = 0;
	var l = a.length;
	while(i < l) {
		if(a[i] == obj) {
			a.splice(i,1);
			return true;
		}
		i++;
	}
	return false;
}
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
}
var IntIter = function(min,max) {
	this.min = min;
	this.max = max;
};
IntIter.__name__ = true;
IntIter.prototype = {
	next: function() {
		return this.min++;
	}
	,hasNext: function() {
		return this.min < this.max;
	}
	,__class__: IntIter
}
var Std = function() { }
Std.__name__ = true;
Std["is"] = function(v,t) {
	return js.Boot.__instanceof(v,t);
}
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
Std["int"] = function(x) {
	return x | 0;
}
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
}
Std.parseFloat = function(x) {
	return parseFloat(x);
}
Std.random = function(x) {
	return Math.floor(Math.random() * x);
}
var js = js || {}
js.Boot = function() { }
js.Boot.__name__ = true;
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
js.Boot.__trace = function(v,i) {
	var msg = i != null?i.fileName + ":" + i.lineNumber + ": ":"";
	msg += js.Boot.__string_rec(v,"");
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js.Boot.__unhtml(msg) + "<br/>"; else if(typeof(console) != "undefined" && console.log != null) console.log(msg);
}
js.Boot.__clear_trace = function() {
	var d = document.getElementById("haxe:trace");
	if(d != null) d.innerHTML = "";
}
js.Boot.isClass = function(o) {
	return o.__name__;
}
js.Boot.isEnum = function(e) {
	return e.__ename__;
}
js.Boot.getClass = function(o) {
	return o.__class__;
}
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2, _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			var _g = 0;
			while(_g < l) {
				var i1 = _g++;
				str += (i1 > 0?",":"") + js.Boot.__string_rec(o[i1],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	try {
		if(o instanceof cl) {
			if(cl == Array) return o.__enum__ == null;
			return true;
		}
		if(js.Boot.__interfLoop(o.__class__,cl)) return true;
	} catch( e ) {
		if(cl == null) return false;
	}
	switch(cl) {
	case Int:
		return Math.ceil(o%2147483648.0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return o === true || o === false;
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o == null) return false;
		if(cl == Class && o.__name__ != null) return true; else null;
		if(cl == Enum && o.__ename__ != null) return true; else null;
		return o.__enum__ == cl;
	}
}
js.Boot.__cast = function(o,t) {
	if(js.Boot.__instanceof(o,t)) return o; else throw "Cannot cast " + Std.string(o) + " to " + Std.string(t);
}
var test = test || {}
test.TestScene = function() {
	ukiyoe.Scene.call(this);
	this.addImageResource("player","player.png");
	this.addImageResource("shit","shit.png");
	this.addImageResource("bird_0","bird_of_paradise_0.png");
	this.addImageResource("bird_1","bird_of_paradise_1.png");
	this.addImageResource("bird_2","bird_of_paradise_2.png");
	this.addSoundResource("bonk",["bonk.ogg","bonk.mp3"]);
	this.addMusicResource("background_music",["music.ogg","music.mp3"]);
};
test.TestScene.__name__ = true;
test.TestScene.__super__ = ukiyoe.Scene;
test.TestScene.prototype = $extend(ukiyoe.Scene.prototype,{
	run: function(ctx,deltaTime) {
		this.player.update(deltaTime);
		var oldX = this.player.x;
		var oldY = this.player.y;
		if(ukiyoe.Key.isDown(ukiyoe.Key.RIGHT_ARROW) || ukiyoe.Key.isDown(ukiyoe.Key.D)) {
			this.player.setAnimation("right");
			this.player.x += 1;
		}
		if(ukiyoe.Key.isDown(ukiyoe.Key.LEFT_ARROW) || ukiyoe.Key.isDown(ukiyoe.Key.A)) {
			this.player.setAnimation("left");
			this.player.x -= 1;
		}
		if(ukiyoe.Key.isDown(ukiyoe.Key.DOWN_ARROW) || ukiyoe.Key.isDown(ukiyoe.Key.S)) this.player.y += 1;
		if(ukiyoe.Key.isDown(ukiyoe.Key.UP_ARROW) || ukiyoe.Key.isDown(ukiyoe.Key.W)) this.player.y -= 1;
		if(ukiyoe.Key.isDown(ukiyoe.Key.SPACEBAR)) this.triggered = true;
		if(ukiyoe.Key.isUp(ukiyoe.Key.SPACEBAR) && this.triggered) {
			this.shit = this.createSprite("shit");
			if(this.player.currentAnimation.name == "right") {
				this.shit.x = this.player.x + 10;
				this.shit.y = this.player.y + 13;
			}
			if(this.player.currentAnimation.name == "left") {
				this.shit.x = this.player.x + this.player.width - 10;
				this.shit.y = this.player.y + 13;
			}
			this.triggered = false;
		}
		if(this.shit != null) {
			this.shit.y += 1;
			if(this.shit.collidesWith(this.enemy)) {
				this.playSound("bonk");
				this.shit = null;
			}
		}
		this.enemy.x = Math.floor(this.width / 2 - this.enemy.width / 2 + Math.sin(this.time) * 100);
		ctx.clear("#87cefa");
		if(this.shit != null) ctx.drawSprite(this.shit);
		ctx.drawSprite(this.player);
		ctx.drawSprite(this.enemy);
	}
	,initialize: function() {
		var left = new ukiyoe.Animation("left",["bird_0","bird_1","bird_2"]);
		left.flipX = true;
		left.fps = 3;
		var right = new ukiyoe.Animation("right",["bird_0","bird_1","bird_2"]);
		right.fps = 3;
		this.player = this.createSpriteAnimation([left,right]);
		this.player.setAnimation("left");
		this.enemy = this.createSprite("player");
		this.enemy.x = this.width / 2 - this.player.width / 2;
		this.enemy.y = 50;
		this.playMusic("background_music");
		this.player.setAnimation("right");
		this.player.x = 10;
		this.player.y = 100;
		this.enemy.x = Math.floor(this.width / 2 - this.enemy.width / 2);
		this.enemy.y = this.height - 50;
		this.shit = null;
		this.triggered = false;
	}
	,__class__: test.TestScene
});
test.Main = function() {
	var game = new ukiyoe.Game(256,224,true,true);
	var s = new test.TestScene();
	game.changeScene(s);
	game.play();
};
test.Main.__name__ = true;
test.Main.main = function() {
	new test.Main();
}
test.Main.prototype = {
	__class__: test.Main
}
var ukiyoe = ukiyoe || {}
ukiyoe.Animation = function(name,frames) {
	this.fps = 0;
	this.flipY = false;
	this.flipX = false;
	this.name = name;
	this.frames = frames;
};
ukiyoe.Animation.__name__ = true;
ukiyoe.Animation.prototype = {
	__class__: ukiyoe.Animation
}
if(Array.prototype.indexOf) HxOverrides.remove = function(a,o) {
	var i = a.indexOf(o);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
}; else null;
Math.__name__ = ["Math"];
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i) {
	return isNaN(i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.prototype.__class__ = Array;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
var Void = { __ename__ : ["Void"]};
test.Main.main();
