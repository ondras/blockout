Shape._flat = ["2x2", "2x1", "3x1", "4x1", "Corner", "Submarine", "Z"];
Shape._advanced = Shape._flat.concat("Corner3d", "Corner3d", "Snake1", "Snake1", "Snake2", "Snake2");

Shape.newFlat = function(pit) {
	var name = "new" + this._flat.random();
	return this[name](pit);
}

Shape.newAdvanced = function(pit) {
	var name = "new" + this._advanced.random();
	return this[name](pit);
}

Shape.new2x2 = function(pit) {
	var shape = new this(pit);
	shape.addCube([0, 0, 0]).hideFaces([Face.RIGHT, Face.BOTTOM]);
	shape.addCube([1, 0, 0]).hideFaces([Face.LEFT, Face.BOTTOM]);
	shape.addCube([0, 1, 0]).hideFaces([Face.RIGHT, Face.TOP]);
	shape.addCube([1, 1, 0]).hideFaces([Face.LEFT, Face.TOP]);
	return shape;
}

Shape.new2x1 = function(pit) {
	var shape = new this(pit);
	shape.addCube([0, 0, 0]).hideFaces([Face.RIGHT]);
	shape.addCube([1, 0, 0]).hideFaces([Face.LEFT]);
	return shape;
}

Shape.new3x1 = function(pit) {
	var shape = new this(pit);
	shape.addCube([0, 0, 0]).hideFaces([Face.RIGHT]);
	shape.addCube([1, 0, 0]).hideFaces([Face.LEFT, Face.RIGHT]);
	shape.addCube([2, 0, 0]).hideFaces([Face.LEFT]);
	return shape;
}

Shape.new4x1 = function(pit) {
	var shape = new this(pit);
	shape.addCube([0, 0, 0]).hideFaces([Face.RIGHT]);
	shape.addCube([1, 0, 0]).hideFaces([Face.LEFT, Face.RIGHT]);
	shape.addCube([2, 0, 0]).hideFaces([Face.LEFT, Face.RIGHT]);
	shape.addCube([3, 0, 0]).hideFaces([Face.LEFT]);
	return shape;
}

Shape.newCorner = function(pit) {
	var shape = new this(pit);
	shape.addCube([0, 0, 0]).hideFaces([Face.RIGHT, Face.BOTTOM]);
	shape.addCube([1, 0, 0]).hideFaces([Face.LEFT]);
	shape.addCube([0, 1, 0]).hideFaces([Face.TOP]);
	return shape;
}

Shape.newL = function(pit) {
	var shape = new this(pit);
	shape.addCube([0, 0, 0]).hideFaces([Face.RIGHT]);
	shape.addCube([1, 0, 0]).hideFaces([Face.LEFT, Face.RIGHT]);
	shape.addCube([2, 0, 0]).hideFaces([Face.LEFT, Face.BOTTOM]);
	shape.addCube([2, 1, 0]).hideFaces([Face.TOP]);
	return shape;
}

Shape.newSubmarine = function(pit) {
	var shape = new this(pit);
	shape.addCube([0, 0, 0]).hideFaces([Face.RIGHT]);
	shape.addCube([1, 0, 0]).hideFaces([Face.LEFT, Face.RIGHT, Face.BOTTOM]);
	shape.addCube([2, 0, 0]).hideFaces([Face.LEFT]);
	shape.addCube([1, 1, 0]).hideFaces([Face.TOP]);
	return shape;
}

Shape.newZ = function(pit) {
	var shape = new this(pit);
	shape.addCube([0, 0, 0]).hideFaces([Face.RIGHT]);
	shape.addCube([1, 0, 0]).hideFaces([Face.LEFT, Face.BOTTOM]);
	shape.addCube([1, 1, 0]).hideFaces([Face.TOP, Face.RIGHT]);
	shape.addCube([2, 1, 0]).hideFaces([Face.LEFT]);
	return shape;
}

Shape.newCorner3d = function(pit) {
	var shape = new this(pit);
	shape.addCube([0, 0, 0]).hideFaces([Face.BACK]);
	shape.addCube([0, 0, 1]).hideFaces([Face.FRONT, Face.RIGHT, Face.BOTTOM]);
	shape.addCube([1, 0, 1]).hideFaces([Face.LEFT]);
	shape.addCube([0, 1, 1]).hideFaces([Face.TOP]);
	return shape;
}

Shape.newSnake1 = function(pit) {
	var shape = new this(pit);
	shape.addCube([0, 0, 0]).hideFaces([Face.RIGHT]);
	shape.addCube([1, 0, 0]).hideFaces([Face.LEFT, Face.BOTTOM]);
	shape.addCube([1, 1, 0]).hideFaces([Face.TOP, Face.BACK]);
	shape.addCube([1, 1, 1]).hideFaces([Face.FRONT]);
	return shape;
}

Shape.newSnake2 = function(pit) {
	var shape = new this(pit);
	shape.addCube([0, 1, 0]).hideFaces([Face.RIGHT]);
	shape.addCube([1, 1, 0]).hideFaces([Face.LEFT, Face.TOP]);
	shape.addCube([1, 0, 0]).hideFaces([Face.BOTTOM, Face.BACK]);
	shape.addCube([1, 0, 1]).hideFaces([Face.FRONT]);
	return shape;
}
