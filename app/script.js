(function (run) {
	document.addEventListener("DOMContentLoaded", run);
})(function () {

	const environment = {dev: true};
	const LETTERS = "А,Б,В,Г,Д,Е,Ж,З,И,К".split(",");
	let dragMonitor = null;
	let gameStarted = false;
	let draggable = null;

	setTimeout(() => {
		if (environment.dev) {
			const dragMonitorElem = getElementById('drag-monitor');
			const dragPointElem = getElementById('point');
			dragMonitor = new DragMonitor({
				pointElem: dragPointElem,
				monitorElem: dragMonitorElem,
				template: getTemplate('drag-monitor-tmpl')
			});
			dragMonitorElem.classList.add('active');
			dragPointElem.classList.add('active');
		}

		const userField = new Field({
			fieldElement: getElementById('player-battlefield'),
			fieldTemplate: getTemplate('battlefield-tmpl')
		});
		userField.renderField();
	}, 0);

	document.onmousedown = function (event) {
		if (event.button !== 0 || gameStarted) {
			return false;
		}
		const draggableShipElem = event.target.closest('.ship');
		if (!draggableShipElem) {
			return;
		}
		draggable = new Draggable({
			elem: draggableShipElem,
			startPageX: event.pageX,
			startPageY: event.pageY
		});

		// Monitoring =========================
		if (environment.dev) {
			const coords = getCoords(draggableShipElem);
			dragMonitor.update([
				{
					property: 'shipSize',
					value: `W: ${draggableShipElem.offsetWidth} / H: ${draggableShipElem.offsetHeight}`
				},
				{
					property: 'shipCords',
					value: `L: ${coords.left} / T: ${coords.top}`
				},
			]);
		}
	};

	document.onmousemove = function (event) {
		if (!draggable) {
			return;
		}
		const dropZoneSearchPoint = draggable.getDropZoneSearchPoint(event);
		draggable.hide();
		if (environment.dev) {
			dragMonitor.hidePoint();
		}
		const dropZone = getElementUnderClientXY(dropZoneSearchPoint);
		draggable.show();
		if (environment.dev) {
			dragMonitor.showPoint();
		}
		if (dropZone.classList.contains('battlefield-cell')) {
			if (draggable.dropZone !== dropZone) {
				draggable.dropTo(dropZone);
			}
		} else {
			if (draggable.elem.parent !== document.body) {
				document.body.appendChild(draggable.elem);
			}
			draggable.drag(event.pageX, event.pageY);
		}

		// Monitoring =========================
		if (environment.dev) {
			const pointX = event.pageX - draggable.centerShiftX;
			const pointY = event.pageY - draggable.centerShiftY;
			dragMonitor.pointElem.style.left = Measures.toPx(pointX);
			dragMonitor.pointElem.style.top = Measures.toPx(pointY);
			dragMonitor.pointElem.firstElementChild.innerHTML = `x: ${pointX} y: ${pointY}`;
			dragMonitor.update([
				{property: 'mouseX', value: event.pageX},
				{property: 'mouseY', value: event.pageY}
			]);
		}
	};

	document.onmouseup = function () {
		if (!draggable) {
			return;
		}
		draggable = null;
	};

	function Field(params) {
		this.fieldElement = params.fieldElement;
		this.fieldTemplate = params.fieldTemplate;
	}

	function Draggable(params) {
		const coords = getCoords(params.elem);
		this.halfOfWidth = params.elem.offsetHeight / 2;
		this.elem = params.elem;
		this.shiftX = params.startPageX - coords.left;
		this.shiftY = params.startPageY - coords.top;
		this.centerShiftX = this.shiftX - this.halfOfWidth;
		this.centerShiftY = this.shiftY - this.halfOfWidth;
	}

	Draggable.prototype.dropTo = function (dropZone) {
		dropZone.appendChild(this.elem);
		this.elem.style.left = '0';
		this.elem.style.top = '0';
		this.dropZone = dropZone;
	};

	Draggable.prototype.getDropZoneSearchPoint = function (event) {
		return new Point(
			event.clientX - this.centerShiftX,
			event.clientY - this.centerShiftY
		);
	};

	Draggable.prototype.hide = function () {
		this._display = this.elem.style.display || '';
		this.elem.style.display = 'none';
	};

	Draggable.prototype.show = function () {
		this.elem.style.display = this._display;
	};

	Draggable.prototype.drag = function (x, y) {
		this.elem.style.left = Measures.toPx(x - this.shiftX);
		this.elem.style.top = Measures.toPx(y - this.shiftY);
	};

	Draggable.prototype.rollback = function () {
		// TODO ...
	};

	Field.prototype.renderField = function () {
		const rows = [];
		for (let row = 0; row < 10; row++) {
			const cells = [];
			for (let col = 0; col < 10; col++) {
				const rowLabel = col === 0 && (row + 1);
				const colLabel = row === 0 && LETTERS[col];
				cells.push({row, col, rowLabel, colLabel});
			}
			rows.push(cells);
		}
		this.fieldElement.innerHTML = this.fieldTemplate({rows});
	};

	function Point(x, y) {
		this.x = x;
		this.y = y;
	}

	function DragMonitor(properties) {
		this.monitorElem = properties.monitorElem;
		this.template = properties.template;
		this.pointElem = properties.pointElem;
		this.indicators = [];
	}

	DragMonitor.prototype.hidePoint = function () {
		this._pointElemTmpDisplay = this.pointElem.style.display || '';
		this.pointElem.style.display = 'none';
	};

	DragMonitor.prototype.showPoint = function () {
		this.pointElem.style.display = this._pointElemTmpDisplay;
	};

	DragMonitor.prototype.update = function (indicators) {
		indicators.forEach(indicator => {
			const foundIndicator = this.indicators.find(i => i.property === indicator.property);
			if (foundIndicator) {
				foundIndicator.value = indicator.value;
			} else {
				this.indicators.push(indicator);
			}
		});
		this.monitorElem.innerHTML = this.template({indicators: this.indicators});
	};

	// Utils functions ==========================================
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

	function getCoords(elem) {
		const elemRect = elem.getBoundingClientRect();
		const body = document.body;
		const docElem = document.documentElement;
		const scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
		const scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
		const clientTop = docElem.clientTop || body.clientTop || 0;
		const clientLeft = docElem.clientLeft || body.clientLeft || 0;
		return {
			top: Math.round(elemRect.top + scrollTop - clientTop),
			left: Math.round(elemRect.left + scrollLeft - clientLeft)
		};
	}

	function getElementUnderClientXY(point) {
		let target = document.elementFromPoint(point.x, point.y);
		if (!target || target === document) {
			target = document.body;
		}
		return target;
	}
});