var Score = OZ.Class();
Score.prototype.init = function(container) {
	this._top = localStorage.topScore || 0;
	this._current = 0;
	
	this._dom = {
		current: OZ.DOM.elm("div", {innerHTML:"0"}),
		top: OZ.DOM.elm("div", {innerHTML:this._top || "N/A"}),
		gameover: OZ.$("gameover")
	}
	
	OZ.CSS3.set(this._dom.gameover, "transform", "translate(-50%, -50%)");
	this._dom.gameover.parentNode.removeChild(this._dom.gameover);
	
	container.appendChild(OZ.DOM.elm("h2", {innerHTML:"Score"}));
	
	var top = OZ.DOM.elm("div", {innerHTML:"<h3>Top</h3>"});
	top.appendChild(this._dom.top);
	container.appendChild(top);
	
	var current = OZ.DOM.elm("div", {innerHTML:"<h3>Current</h3>"});
	current.appendChild(this._dom.current);
	container.appendChild(current);
	
	OZ.Event.add(null, "score", this._score.bind(this));
	OZ.Event.add(null, "gameover", this._gameover.bind(this));
}

Score.prototype._score = function(e) {
	this._current += e.data.score;
	this._dom.current.innerHTML = this._current;
}

Score.prototype._gameover = function(e) {
	document.body.appendChild(this._dom.gameover);
	var p = OZ.DOM.elm("p");
	if (this._current > this._top) {
		localStorage.topScore = this._current;
		this._dom.top.innerHTML = this._current;
		
		p.innerHTML = "<strong>Congratulations!</strong> You just created a new Top score of " + this._current + " points!";
	} else {
		p.innerHTML = "You scored " + this._current + " points; the top score is still " + this._top + " points.";
	}
	
	this._dom.gameover.appendChild(p);
	p = OZ.DOM.elm("p");
	var a = OZ.DOM.elm("a", {href:"#", innerHTML:"Play again?"});
	
	OZ.Event.add(a, "click", function(e) {
		OZ.Event.prevent(e);
		location.reload();
	});
	p.appendChild(a);
	this._dom.gameover.appendChild(p);
	
}
