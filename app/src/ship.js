import {Point} from './point.js';
import {Orientation} from './orientations.js';
import {Utils} from './utils/utils.js';
import {MeasuresUtils} from './utils/measures.utils.js';
import {ShipStatus} from './ship-status.js';

const READY_TO_DROP_CLASS = 'ship-ready-to-drop';
const SHIP_ON_DRAG_CLASS = 'ship-on-drug';

export class Ship {

	constructor(params) {
		this.id = params.id;
		this.elem = params.elem;
		this.decks = params.decks;
		this.orientation = Orientation.HORIZONTAL;
		this.status = ShipStatus.NONE;
		this.containerToRoollback = params.container;
		this.cells = [];
	}

	setContainerToRollback(container) {
		this.containerToRoollback = container;
	}

	setStatus(status) {
		if (this.status === status) {
			return;
		}
		this.elem.classList.remove(READY_TO_DROP_CLASS);
		this.elem.classList.remove(SHIP_ON_DRAG_CLASS);
		if (status === ShipStatus.DRAGGING) {
			this.elem.classList.add(SHIP_ON_DRAG_CLASS);
		}
		if (status === ShipStatus.FIXED) {
			this.elem.classList.add(READY_TO_DROP_CLASS);
		}
		this.status = status;
	}

	onDragStart(mouseX, mouseY) {
		const coords = Utils.getCoordsRect(this.elem);
		this.shiftX = mouseX - coords.left;
		this.shiftY = mouseY - coords.top;
		this.centerShiftX = this.shiftX - this.getWith() / 2;
		this.centerShiftY = this.shiftY - this.getWith() / 2;
	}

	switchOrientation() {
		this.orientation = this.orientation === Orientation.VERTICAL
			? Orientation.HORIZONTAL
			: Orientation.VERTICAL;
		const newWidth = MeasuresUtils.toPx(this.elem.offsetHeight);
		const newHeight = MeasuresUtils.toPx(this.elem.offsetWidth);
		this.elem.style.width = newWidth;
		this.elem.style.height = newHeight;
	}

	getCoordsCenter(event) {
		return new Point(
			event.pageX - this.centerShiftX,
			event.pageY - this.centerShiftY
		);
	}

	drag(x, y) {
		this.elem.style.left = MeasuresUtils.toPx(x - this.shiftX);
		this.elem.style.top = MeasuresUtils.toPx(y - this.shiftY);
	}

	rollbackDrag() {
		this.setStatus(ShipStatus.NONE);
		this.containerToRoollback.elem.appendChild(this.elem);
		this.elem.style.left = '0';
		this.elem.style.top = '0';
	}

	shake() {
		this.elem.classList.add('shake');
		setTimeout(() => {
			this.elem.classList.remove('shake');
		}, 300);
	}

	getWith() {
		return Math.min(this.elem.offsetHeight, this.elem.offsetWidth);
	}
}