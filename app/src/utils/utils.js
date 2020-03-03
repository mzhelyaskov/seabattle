import Handlebars from 'handlebars';

export class Utils {

	static getElementById(id) {
		return document.getElementById(id);
	}

	static getTemplate(id) {
		return Handlebars.compile(Utils.getElementById(id).innerHTML);
	}

	static isPointUnderPageRect(pageCoordsRect, point) {
		return point.x > pageCoordsRect.left
			&& point.x < pageCoordsRect.right
			&& point.y > pageCoordsRect.top
			&& point.y < pageCoordsRect.bottom;
	}

	static getCoordsRect(elem) {
		const box = elem.getBoundingClientRect();
		return {
			top: Math.round(box.top + window.pageYOffset),
			bottom: Math.round(box.bottom + window.pageYOffset),
			left: Math.round(box.left + window.pageXOffset),
			right: Math.round(box.right + window.pageXOffset)
		};
	}

	static getElementUnderClientXY(point) {
		let target = document.elementFromPoint(point.x, point.y);
		if (!target || target === document) {
			target = document.body;
		}
		return target;
	}

	static randomInteger(min, max) {
		let rand = min + Math.random() * (max + 1 - min);
		return Math.floor(rand);
	}
}