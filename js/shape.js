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
	this._rotation = Quaternion.fromUnit();

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
	var angle = 90;
	for (var i=0;i<dir;i++) {
		if (dir[i] < 0) { angle = -90; }
	}
	var rotation = Quaternion.fromRotation(dir, angle);
	this._rotation = rotation.multiply(this._rotation);

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
	var x = this._position[0]*Face.SIZE;
	var y = this._position[1]*Face.SIZE;
	var z = -this._position[2]*Face.SIZE;
	
	
	OZ.CSS3.set(this._node, "transform", "translate3d("+x+"px, "+y+"px, "+z+"px) " + this._rotation.toRotations());
}
