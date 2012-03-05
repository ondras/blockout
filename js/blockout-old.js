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
//	OZ.CSS3.set(this._node, "backface-visibility", "hidden");
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
	this._position = position;

	this._node = OZ.DOM.elm("div", {className:"cube", position:"absolute", left:"0px", top:"0px"});
	OZ.CSS3.set(this._node, "transform-style", "preserve-3d");
	
	var x = this._position[0]*Face.SIZE;
	var y = this._position[1]*Face.SIZE;
	var z = this._position[2]*Face.SIZE;
	OZ.CSS3.set(this._node, "transform", "translate3d("+x+"px, "+y+"px, "+z+"px)");
	
	for (var i=0;i<6;i++) {
		var face = new Face(i);
		var node = face.getNode();
		this._node.appendChild(node);
	}

}

Cube.prototype.getPosition = function() {
	return this._position;
}

Cube.prototype.getNode = function() {
	return this._node;
}

var Shape = OZ.Class();

Shape.new2x2 = function(pit) {
	var shape = new this(pit);
	shape.addCube([0, 0, 0]);
	shape.addCube([1, 0, 0]);
	shape.addCube([0, 1, 0]);
	shape.addCube([1, 1, 0]);
	return shape;
}

Shape.prototype.init = function(pit) {
	this._pit = pit;
	this._node = OZ.DOM.elm("div", {className:"shape", position:"absolute", left:"0px", top:"0px"});
	OZ.CSS3.set(this._node, "transform-style", "preserve-3d");
	var prop = OZ.CSS3.getProperty("transform");
	OZ.CSS3.set(this._node, "transition", prop + " 300ms");

	this._position = [0, 0, 0];
	this._size = [0, 0, 0];
	this._cubes = [];
	this._rotations = [];

	this._updatePosition();
}

Shape.prototype.addCube = function(position) {
	for (var i=0;i<position.length;i++) {
		this._size[i] = Math.max(this._size[i], position[i]+1);
	}
	this._node.style.width = Face.SIZE * this._size[0] + "px";
	this._node.style.height = Face.SIZE * this._size[1] + "px";
	
	var cube = new Cube(position);
	this._node.appendChild(cube.getNode());
	this._cubes.push(cube);
	return this;
}

Shape.prototype.getCubes = function() {
	return this._cubes;
}

Shape.prototype.getPosition = function() {
	return this._position;
}

Shape.prototype.getNode = function() {
	return this._node;
}

Shape.prototype.move = function(dir) {
	for (var i=0;i<dir.length;i++) {
		this._position[i] += dir[i];
	}
	
	if (this.collides()) {
		for (var i=0;i<dir.length;i++) {
			this._position[i] -= dir[i];
		}
		return false;
	} else {
		this._updatePosition();
		return true;
	}
}

Shape.prototype.rotate = function(dir) {
	var last = (this._rotations.length ? this._rotations[this._rotations.length-1] : null);
	var done = false;
	
	if (last) { /* check similarity with last rotation */
		for (var i=0;i<dir.length;i++) {
			if (!last[i] || !dir[i]) { continue; }
			
			/* last rotation was in the same axis */
			var val = last[i] + dir[i];
			if (0 && (val == 4 || val == -4)) { /* full circle; remove the rotation */
				this._rotations.pop(); 
			} else { /* adjust last rotation */
				last[i] = val;
			}
			
			/* do not add this rotation to stack */
			done = true;
		}
	}
	
	if (!done) { this._rotations.push(dir); }
	this._updatePosition();
}

Shape.prototype.collides = function() {
	for (var i=0;i<2;i++) {
		if (this._position[i] < 0 || this._position[i] + this._size[i] > Pit.SIZE) { return true; }
	}
	if (this._position[2] + this._size[2] > Pit.DEPTH) { return true; }
	var other = this._pit.getShapes();
	/* FIXME collision test */
	
	return false;
}

Shape.prototype._updatePosition = function() {
	var props = ["X", "Y", ""];
	var rotations = [];
	for (var i=0;i<this._rotations.length;i++) {
		var rotation = this._rotations[i];
		for (var j=0;j<rotation.length;j++) {
			if (!rotation[j]) { continue; }
			var amount = 90*rotation[j];
			rotations.push("rotate" + props[j] + "(" + amount + "deg)");
		}
	}
	
	var x = this._position[0]*Face.SIZE;
	var y = this._position[1]*Face.SIZE;
	var z = -this._position[2]*Face.SIZE;
	
	
	OZ.CSS3.set(this._node, "transform", "translate3d("+x+"px, "+y+"px, "+z+"px) " + rotations.reverse().join(" "));
}

var Pit = OZ.Class();
Pit.SIZE = 5;
Pit.DEPTH = 10;
Pit.prototype.init = function() {
	this._node = OZ.DOM.elm("div", {className:"pit", width:Pit.SIZE*Face.SIZE + "px", height:Pit.SIZE*Face.SIZE + "px"});

	OZ.CSS3.set(document.body, "perspective", "460px");
	OZ.CSS3.set(this._node, "transform-style", "preserve-3d");
	
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
	
	this._placedShapes = [];
	this._currentShape = null;
	this._timeout = null;
}

Pit.prototype.getNode = function() {
	return this._node;
}

Pit.prototype.getShape = function() {
	return this._currentShape;
}

Pit.prototype.getShapes = function() {
	return this._placedShapes;
}

Pit.prototype.start = function() {
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
			this._placedShapes.push(this._currentShape);
			this._currentShape = null;
		}
	}
	
	if (!this._currentShape) { this._newShape(); }
	
	if (this._currentShape) {
//		this._timeout = setTimeout(this._tick.bind(this), 2000);
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

Pit.prototype._newShape = function() {
	this._currentShape = Shape.new2x2(this);
	this._node.appendChild(this._currentShape.getNode());
}

var Game = OZ.Class();
Game.prototype.init = function() {
	this._pit = new Pit();
	document.body.appendChild(this._pit.getNode());
	this._pit.start();
	
	OZ.Event.add(window, "keydown", this._keydown.bind(this));
}

Game.prototype._keydown = function(e) {
	var shape = this._pit.getShape();
	
	switch (e.keyCode) {
		case 37:
			shape.move([-1, 0, 0]);
		break;
		case 38:
			shape.move([0, -1, 0]);
		break;
		case 39:
			shape.move([1, 0, 0]);
		break;
		case 40:
			shape.move([0, 1, 0]);
		break;
		
		case 32:
			var ok = true;
			while (ok) { ok = shape.move([0, 0, 1]); }
			this._pit.tick();
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
