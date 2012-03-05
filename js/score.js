var Score = OZ.Class();
Score.prototype.init = function(container) {
	this._top = localStorage.topScore || 0;
	this._current = 0;
	
	this._dom = {
		current: OZ.DOM.elm("div", {innerHTML:"0"}),
		top: OZ.DOM.elm("div", {innerHTML:this._top || "N/A"})
	}
	
	container.appendChild(OZ.DOM.elm("h2", {innerHTML:"Score"}));
	
	var top = OZ.DOM.elm("div", {innerHTML:"<h3>Top</h3>"});
	top.appendChild(this._dom.top);
	container.appendChild(top);
	
	var current = OZ.DOM.elm("div", {innerHTML:"<h3>Current</h3>"});
	current.appendChild(this._dom.current);
	container.appendChild(current);
	
	OZ.Event.add(null, "score", this._score.bind(this));
}

Score.prototype._score = function(e) {
	this._current += e.data.score;
	this._dom.current.innerHTML = this._current;
}
