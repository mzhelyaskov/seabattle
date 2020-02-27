function Ship(params) {
	this.id = params.id;
	this.elem = params.elem;
	this.decks = params.decks;
	this.orientation = Orientation.HORIZONTAL;
}

Ship.prototype.onDragStart = function (mouseX, mouseY) {
	const coords = getCoordsRect(this.elem);
	this.shiftX = mouseX - coords.left;
	this.shiftY = mouseY - coords.top;
	this.centerShiftX = this.shiftX - this.getWith() / 2;
	this.centerShiftY = this.shiftY - this.getWith() / 2;
};

Ship.prototype.switchOrientation = function () {
	this.orientation = this.orientation === Orientation.VERTICAL
		? Orientation.HORIZONTAL
		: Orientation.VERTICAL;
	const newWidth = Measures.toPx(this.elem.offsetHeight);
	const newHeight = Measures.toPx(this.elem.offsetWidth);
	this.elem.style.width = newWidth;
	this.elem.style.height = newHeight;
};

Ship.prototype.getCoordsCenter = function (event) {
	return new Point(
		event.pageX - this.centerShiftX,
		event.pageY - this.centerShiftY
	);
};

Ship.prototype.drag = function (x, y) {
	this.elem.style.left = Measures.toPx(x - this.shiftX);
	this.elem.style.top = Measures.toPx(y - this.shiftY);
};

Ship.prototype.rollback = function () {
	// TODO ...
};

Ship.prototype.shake = function () {
	this.elem.classList.add('shake');
	setTimeout(() => {
		this.elem.classList.remove('shake');
	}, 300);
};

Ship.prototype.getWith = function () {
	return Math.min(this.elem.offsetHeight, this.elem.offsetWidth);
};