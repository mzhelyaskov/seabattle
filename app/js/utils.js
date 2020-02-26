const CellStatus = {
	EMPTY: 'E',
	DECK: 'D',
	LOCKED: 'L',
	MISS: 'M',
	WOUND: 'W'
};

const Orientation = {
	HORIZONTAL: 'H',
	VERTICAL: 'V',
};

function Point(x, y) {
	this.x = x;
	this.y = y;
}

const Measures = {
	toPx: function (value) {
		return `${value}px`;
	}
};

function getElementById(id) {
	return document.getElementById(id);
}

function getTemplate(id) {
	return Handlebars.compile(getElementById(id).innerHTML);
}

function isPointUnderPageRect(pageCoordsRect, point) {
	return point.x > pageCoordsRect.left
		&& point.x < pageCoordsRect.right
		&& point.y > pageCoordsRect.top
		&& point.y < pageCoordsRect.bottom;
}

function getCoordsRect(elem) {
	const box = elem.getBoundingClientRect();
	return {
		top: Math.round(box.top + window.pageYOffset),
		bottom: Math.round(box.bottom + window.pageYOffset),
		left: Math.round(box.left + window.pageXOffset),
		right: Math.round(box.right + window.pageXOffset)
	};
}

function getElementUnderClientXY(point) {
	let target = document.elementFromPoint(point.x, point.y);
	if (!target || target === document) {
		target = document.body;
	}
	return target;
}

function randomInteger(min, max) {
	let rand = min + Math.random() * (max + 1 - min);
	return Math.floor(rand);
}