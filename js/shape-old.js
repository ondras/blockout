var Shape = OZ.Class();

Shape.SPEED = 200;

Shape.prototype.init = function(pit, useCSS) {
	this._useCSS = useCSS;
	this._slave = null;

	this._pit = pit;
	this._node = OZ.DOM.elm("div", {className:"shape", position:"absolute", left:"0px", top:"0px"});
	OZ.CSS3.set(this._node, "transform-style", "preserve-3d");
	var prop = OZ.CSS3.getProperty("transform");
	OZ.CSS3.set(this._node, "transition", prop + " " + this.constructor.SPEED + "ms");

	this._position = [0, 0, 0];
	this._oldPosition = null;
	this._size = [0, 0, 0];
	this._cubes = [];
	this._rotations = [];
	this._offset = [0, 0, 0];

	this._updatePosition();
}

Shape.prototype.addCube = function(position) {
	for (var i=0;i<position.length;i++) {
		this._size[i] = Math.max(this._size[i], position[i]+1);
	}
	this._node.style.width = Face.SIZE * this._size[0] + "px";
	this._node.style.height = Face.SIZE * this._size[1] + "px";
	
	var cube = new Cube(position);
	this._cubes.push({
		cube: cube,
		position: position,
		oldPosition: null
	});

	this._node.appendChild(cube.getNode());

	this._updatePosition();
	return cube;
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
	if (this._slave) { this._slave.rotate(dir); } else { /*debugger;*/ }
	
	var rotated = this._rotateData(dir);
	if (!rotated) { return false; }

	this._rotateCSS(dir);
	return true;
}

Shape.prototype.collides = function() {
	var cubes = this._pit.getCubes();

	for (var i=0;i<this._cubes.length;i++) {
		var pos = this._cubes[i].position;
		var abs = [];
		for (var j=0;j<3;j++) {
			abs.push(pos[j] + this._position[j]);
		}
		
		for (var j=0;j<2;j++) {
			if (abs[j] < 0 || abs[j] >= Pit.SIZE) { return true; }
		}
		
		if (abs[j] >= Pit.DEPTH) { return true; }
		
		for (var j=0;j<cubes.length;j++) {
			if (this._cubeCollides(abs, cubes[j])) { return true; }
		}
		
	}
	
	return false;
}

Shape.prototype._cubeCollides = function(abs, cube) {
	var cubePosition = cube.getPosition();

	for (var j=0;j<3;j++) {
		if (cubePosition[j] != abs[j]) { return false; }
	}
	
	return true;
}

Shape.prototype._rotateData = function(dir) {
	var offset = [0, 0, 0];
	var min = [Infinity, Infinity, Infinity];
	var max = [-Infinity, -Infinity, -Infinity];
	var pivot = [];
	
	this._oldPosition = this._position.clone();
	
	/* compute rotation pivot */
	for (var i=0;i<this._cubes.length;i++) {
		var position = this._cubes[i].position;
		for (var j=0;j<3;j++) {
			min[j] = Math.min(min[j], position[j]);
			max[j] = Math.max(max[j], position[j]);
		}
	}
	for (var i=0;i<3;i++) {
		pivot.push((max[i]+min[i]+1) / 2);
	}
//	console.log("Pivot", pivot);
	
	/* for every cube, compute its new position */
	for (var i=0;i<this._cubes.length;i++) {
		var obj = this._cubes[i];
		obj.oldPosition = obj.position;
		
		/* rotate cube */
		obj.position = this._rotateCubePosition(obj.oldPosition, dir, pivot);
//		if (!this._useCSS) console.log("Rotated cube " + i, obj.oldPosition.clone(), obj.position.clone());
		
		/* offset adjustment needed? */
		for (var j=0;j<3;j++) {
			var np = obj.position[j];
			if (np != Math.round(np)) { offset[j] = true; }
		}
	}
	
	/* if rotation introduced non-integer cube position(s), adjust accordingly */
	for (var i=0;i<offset.length;i++) {
		var o = offset[i];
		if (!o) { continue; }
		
		o = (this._offset[i] ? -0.5 : 0.5);
		offset[i] = o;
		for (var j=0;j<this._cubes.length;j++) {
			var cube = this._cubes[j];
			cube.position[i] += o;
//			if (!this._useCSS) console.log("Adjusted cube " + j, cube.position);
		}
	}
	

	var avail = this._panToFit();
	
	if (avail) {
		
		/* add offset */
		for (var i=0;i<3;i++) { this._offset[i] += offset[i]; }
		if (!this._useCSS) {
			for (var i=0;i<this._cubes.length;i++) {
				this._cubes[i].cube.setPosition(this._cubes[i].position);
			}
		}
		return true;
		
	} else {
		/* reset position */
		
		this._position = this._oldPosition;
		
		for (var i=0;i<this._cubes.length;i++) {
			this._cubes[i].position = this._cubes[i].oldPosition;
		}
		
		return false;
	}
	
	return true;
}

Shape.prototype._panToFit = function() {
	/* make sure the Z coordinate is not negative */
	var minZ = Infinity;
	for (var i=0;i<this._cubes.length;i++) {
		var obj = this._cubes[i];
		minZ = Math.min(minZ, obj.position[2] + this._position[2]);
	}
	if (minZ < 0) { this._position[2] -= minZ; }
	
	var pans = [
		[ 0,  0, 0],
		[-1,  0, 0],
		[ 1,  0, 0],
		[ 0, -1, 0],
		[ 0,  1, 0],
		[-2,  0, 0],
		[ 2,  0, 0],
		[ 0, -2, 0],
		[ 0,  2, 0],
		[-3,  0, 0],
		[ 3,  0, 0],
		[ 0, -3, 0],
		[ 0,  3, 0]
	];
	
	var pos = this._position;
	for (var i=0;i<pans.length;i++) {
		this._position = pos.clone();
		for (var j=0;j<3;j++) {
			this._position[j] += pans[i][j];
		}
		if (!this.collides()) { return true; }
	}
	
	return false;
	
}

Shape.prototype._rotateCubePosition = function(position, dir, pivot) {
	var indexes = [];
	var direction = 0;
	var result = [];
	
	/* find two indexes to swap */
	for (var i=0;i<dir.length;i++) {
		result.push(position[i]);
		if (dir[i]) {
			direction = dir[i];
		} else {
			indexes.push(i);
		}
	}
	
	/* wtf? reversed rotation around X */
	if (dir[0]) { direction *= -1; }
	
	/* two values to swap */
	var oldValues = [];
	for (var i=0;i<indexes.length;i++) {
		var index = indexes[i];
		oldValues.push(position[index] - pivot[index] + 0.5);
	}
	
	/* swap + multiply one value by -1 */
	var newValues = oldValues.reverse();
	newValues[direction > 0 ? 0 : 1] *= -1;
	
	/* return back */
	for (var i=0;i<indexes.length;i++) {
		var index = indexes[i];
		result[index] = newValues[i] + pivot[index] - 0.5;
	}
	
	return result;
}

Shape.prototype._rotateCSS = function(dir) {
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
	
	if (!done) { this._rotations.push(dir.clone()); }
	this._updatePosition();
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
	
	if (this._useCSS) {
		var x = (this._position[0] + this._offset[0])*Face.SIZE;
		var y = (this._position[1] + this._offset[1])*Face.SIZE;
		var z = -(this._position[2] + this._offset[2])*Face.SIZE;
		
		var depth = Face.SIZE * this._size[2] / 2;
		
		OZ.CSS3.set(this._node, "transform", "translate3d("+x+"px, "+y+"px, "+(z - depth)+"px) " + rotations.reverse().join(" ") + " translateZ(" + (depth) + "px)");
	} else {
		var x = this._position[0]*Face.SIZE;
		var y = this._position[1]*Face.SIZE;
		var z = -this._position[2]*Face.SIZE;
		OZ.CSS3.set(this._node, "transform", "translate3d("+x+"px, "+y+"px, "+z+"px)");
	}
}
