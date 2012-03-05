Array.prototype.clone = function() {
	var c = [];
	var len = this.length;
	for (var i=0;i<len;i++) { c.push(this[i]); }
	return c;
}

Array.prototype.random = function() {
	return this[Math.floor(Math.random()*this.length)];
}

var Face = OZ.Class();
Face.SIZE	= 100;
Face.LEFT	= 0;
Face.RIGHT	= 1;
Face.TOP	= 2;
Face.BOTTOM	= 3;
Face.FRONT	= 4;
Face.BACK	= 5;
Face.prototype.init = function(type) {
	this._node = OZ.DOM.elm("div", {className:"face", width:Face.SIZE+"px", height:Face.SIZE+"px", position:"absolute", left:"0px", top:"0px"});
	OZ.CSS3.set(this._node, "box-sizing", "border-box");

	switch (type) {
		case Face.LEFT:
			OZ.CSS3.set(this._node, "transform-origin", "100% 50%");
			OZ.CSS3.set(this._node, "transform", "translate3d(-"+Face.SIZE+"px, 0px, 0px) rotateY(-90deg)");
		break;
		case Face.RIGHT:
			OZ.CSS3.set(this._node, "transform-origin", "0% 50%");
			OZ.CSS3.set(this._node, "transform", "translate3d("+Face.SIZE+"px, 0px, 0px) rotateY(90deg)");
		break;
		case Face.TOP:
			OZ.CSS3.set(this._node, "transform-origin", "50% 100%");
			OZ.CSS3.set(this._node, "transform", "translate3d(0px, -"+Face.SIZE+"px, 0px) rotateX(90deg)");
		break;
		case Face.BOTTOM:
			OZ.CSS3.set(this._node, "transform-origin", "50% 0%");
			OZ.CSS3.set(this._node, "transform", "translate3d(0px, "+Face.SIZE+"px, 0px) rotateX(-90deg)");
		break;
		case Face.FRONT:
		break;
		case Face.BACK:
			OZ.CSS3.set(this._node, "transform", "translate3d(0px, 0px, -"+Face.SIZE+"px)");
		break;
	}
}

Face.prototype.getNode = function() {
	return this._node;
}

var Cube = OZ.Class();
Cube.prototype.init = function(position) {
	this._position = null;
	this._node = OZ.DOM.elm("div", {className:"cube", position:"absolute", left:"0px", top:"0px"});
	this._faces = [];
	OZ.CSS3.set(this._node, "transform-style", "preserve-3d");

	var prop = OZ.CSS3.getProperty("transform");
	OZ.CSS3.set(this._node, "transition", prop + " 300ms");
	
	for (var i=0;i<6;i++) {
		var face = new Face(i);
		this._faces.push(face);
	}

	this.hideFaces([]);
	this.setPosition(position);
}

Cube.prototype.hideFaces = function(hidden) {
	OZ.DOM.clear(this._node);
	for (var i=0;i<this._faces.length;i++) {
		if (hidden.indexOf(i) != -1) { continue; }
		var node = this._faces[i].getNode();
		this._node.appendChild(node);
	}
}

Cube.prototype.setPosition = function(position) {
	this._position = position;
	
	var x = this._position[0]*Face.SIZE;
	var y = this._position[1]*Face.SIZE;
	var z = -this._position[2]*Face.SIZE;
	OZ.CSS3.set(this._node, "transform", "translate3d("+x+"px, "+y+"px, "+z+"px)");
	
	return this;
}

Cube.prototype.getPosition = function() {
	return this._position;
}

Cube.prototype.getNode = function() {
	return this._node;
}

var Pit = OZ.Class();
Pit.SIZE = 5;
Pit.DEPTH = 10;
Pit.prototype.init = function(container, advanced) {
	this._node = OZ.DOM.elm("div", {className:"pit", width:Pit.SIZE*Face.SIZE + "px", height:Pit.SIZE*Face.SIZE + "px"});
	this._advanced = advanced;

	OZ.CSS3.set(container, "perspective", "460px");
	OZ.CSS3.set(this._node, "transform-style", "preserve-3d");
	
	container.appendChild(this._node);
	
	this._data = [];
	for (var i=0;i<Pit.SIZE;i++) {
		this._data.push([]);
		for (var j=0;j<Pit.SIZE;j++) {
			this._data[i].push([]);
			for (var k=0;k<Pit.DEPTH;k++) {
				this._data[i][j].push(false);
			}
		}
	}
	
	this._cubes = [];
	this._ts = null;
	this._currentShape = null;
	this._timeout = null;
}

Pit.prototype.getNode = function() {
	return this._node;
}

Pit.prototype.getShape = function() {
	return this._currentShape;
}

Pit.prototype.getCubes = function() {
	return this._cubes;
}

Pit.prototype.start = function() {
	this._ts = new Date().getTime();
	this.tick();
}

Pit.prototype.tick = function() {
	if (this._timeout) { 
		clearTimeout(this._timeout);
		this._timeout = null;
	}
	
	if (this._currentShape) {
		var moved = this._currentShape.move([0, 0, 1]);
		if (!moved) {
			this._finalizeShape();
		}
	}
	
	if (!this._currentShape) { this._newShape();  }
	
	if (this._currentShape) {
		var diff = new Date().getTime() - this._ts;
		var delay = 2000 - diff/300;
		window.delay = delay;
		this._timeout = setTimeout(this._tick.bind(this), Math.round(delay));
	} else {
		this.dispatch("gameover");
	}
}

/**
 * Called in timeout; clears the timeout var - we don't want it cleared in tick
 */
Pit.prototype._tick = function() {
	this._timeout = null;
	this.tick();
}

Pit.prototype._finalizeShape = function() {
	var cubes = this._currentShape.getCubes();
	this.dispatch("score", {score:cubes.length});
	
	var position = this._currentShape.getPosition();
	
	for (var i=0;i<cubes.length;i++) {
		var obj = cubes[i];
		var cube = obj.cube;

		for (var j=0;j<3;j++) { obj.position[j] += position[j]; }
		
		var node = cube.getNode();
		OZ.DOM.addClass(node, "l" + (this.constructor.DEPTH-obj.position[2]));
		this._node.appendChild(node);
		cube.setPosition(obj.position);
		cube.hideFaces([Face.BACK]);
		this._cubes.push(cube);
	}
	
	var shapeNode = this._currentShape.getNode();
	shapeNode.parentNode.removeChild(shapeNode);

	this._currentShape = null;
	this._checkFloors();
}

Pit.prototype._checkFloors = function() {
	var counts = [];
	for (var i=0;i<this.constructor.DEPTH;i++) { counts.push(0); }
	
	for (var i=0;i<this._cubes.length;i++) {
		var pos = this._cubes[i].getPosition();
		counts[pos[2]]++;
	}
	
	var max = this.constructor.SIZE * this.constructor.SIZE;
	var score = 0;
	var scoreFactor = 100;
	
	for (var i=this.constructor.DEPTH-1;i>=0;i--) {
		if (counts[i] < max) { continue; }
		/* remove the floor */
		
		score += scoreFactor;
		scoreFactor += scoreFactor;
		
		for (var j=0;j<this._cubes.length;j++) {
			var cube = this._cubes[j];
			var pos = cube.getPosition();
			var node = cube.getNode();

			if (pos[2] == i) {
				node.parentNode.removeChild(node);
				this._cubes.splice(j, 1);
				j--;
			} else if (pos[2] < i) {
				OZ.DOM.removeClass(node, "l" + (this.constructor.DEPTH-pos[2]));
				pos[2]++;
				OZ.DOM.addClass(node, "l" + (this.constructor.DEPTH-pos[2]));
				cube.setPosition(pos);
			}
		} /* for all cubes in floor */
		
	} /* for all floors */
	
	if (score) { this.dispatch("score", {score:score}); }
	
}

Pit.prototype._newShape = function() {
	this._currentShape = (this._advanced ? Shape.newAdvanced(this) : Shape.newFlat(this));
	this._currentShape._useCSS = true;
	this._node.appendChild(this._currentShape.getNode());
	window.s = this._currentShape;
	
	if (this._currentShape.collides()) { this._currentShape = null; }
/*	
	var slave = Shape.new2x2(this);
	slave._useCSS = true;
	this._content.appendChild(slave.getNode());
	this._currentShape._slave = slave;
	slave.move([0, 3, 0]);
*/
}

var Game = OZ.Class();
Game.prototype.init = function() {
	this._pit = null;
	this._score = new Score(OZ.$("score"));
	
	var play = OZ.$("play");
	var simple = play.getElementsByTagName("a")[0];
	var advanced = play.getElementsByTagName("a")[1];
	OZ.Event.add(play, "click", OZ.Event.prevent);
	OZ.Event.add(simple, "click", function(e) { this._play(false); }.bind(this));
	OZ.Event.add(advanced, "click", function(e) { this._play(true); }.bind(this));
	
	var smiley = OZ.$("smiley");
	OZ.CSS3.set(smiley, "transform", "rotate(90deg)");
	
	setInterval(function() {
		OZ.$("divs").innerHTML = document.getElementsByTagName("div").length;
	}, 100);
	
//	this._play();
}

Game.prototype._play = function(advanced) {
	OZ.DOM.clear(OZ.$("game"));
	
	OZ.Event.add(window, "keydown", this._keydown.bind(this));
	this._pit = new Pit(OZ.$("game"), advanced);
	this._pit.start();
}

Game.prototype._keydown = function(e) {
	var shape = this._pit.getShape();
	if (!shape) { return; }
	
	switch (e.keyCode) {
		case 37:
			shape.move([-1, 0, 0]);
			OZ.Event.prevent(e);
		break;
		case 38:
			shape.move([0, -1, 0]);
			OZ.Event.prevent(e);
		break;
		case 39:
			shape.move([1, 0, 0]);
			OZ.Event.prevent(e);
		break;
		case 40:
			shape.move([0, 1, 0]);
			OZ.Event.prevent(e);
		break;
		
		case 13:
		case 32:
			var ok = true;
			while (ok) { ok = shape.move([0, 0, 1]); }
			setTimeout(function() {
				if (this._pit.getShape()) { this._pit.tick(); }
			}.bind(this), Shape.SPEED);
		break;
		
		case "Q".charCodeAt(0):
			shape.rotate([1, 0, 0]);
		break;
		case "A".charCodeAt(0):
			shape.rotate([-1, 0, 0]);
		break;
		case "W".charCodeAt(0):
			shape.rotate([0, 1, 0]);
		break;
		case "S".charCodeAt(0):
			shape.rotate([0, -1, 0]);
		break;
		case "E".charCodeAt(0):
			shape.rotate([0, 0, 1]);
		break;
		case "D".charCodeAt(0):
			shape.rotate([0, 0, -1]);
		break;
	}
}

