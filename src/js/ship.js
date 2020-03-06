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
		this.mainCell = null;
	}

	setOrientation(orientation) {
		if (this.orientation !== orientation) {
			this.elem.classList.remove(this.orientation);
			this.elem.classList.add(orientation);
			this.orientation = orientation;
		}
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
		if (status === ShipStatus.INSERTED) {
			this.elem.classList.add(READY_TO_DROP_CLASS);
		}
		this.status = status;
	}

	onDragStart(downX, downY) {
		const coords = Utils.getCoordsRect(this.elem);
		const shipWidth = Math.min(this.elem.offsetHeight, this.elem.offsetWidth);
		this.shiftX = downX - coords.left;
		this.shiftY = downY - coords.top;
		this.centerShiftX = this.shiftX - shipWidth / 2;
		this.centerShiftY = this.shiftY - shipWidth / 2;
	}

	switchOrientation() {
		const orientation = this.orientation === Orientation.VERTICAL
			? Orientation.HORIZONTAL
			: Orientation.VERTICAL;
		this.setOrientation(orientation);
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
}