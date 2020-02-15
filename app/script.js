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
		draggable.onDragStart();

		// Monitoring =========================
		if (environment.dev) {
			const coords = getCoords(draggableShipElem);
			dragMonitor.update([
				{
					property: 'shipSize',
					value: `W: ${draggableShipElem.offsetWidth} / H: ${draggableShipElem.offsetHeight}`
				},
				{property: 'shipCords', value: `L: ${coords.left} / T: ${coords.top}`},
			]);
		}
	};

	document.onmousemove = function (event) {
		if (!draggable) {
			return;
		}
		draggable.drag(event.clientX, event.clientY);

		// Monitoring =========================
		if (environment.dev) {
			const coords = getCoords(draggable.elem);
			const shift = draggable.elem.offsetHeight / 2;
			const pointX = coords.left + shift;
			const pointY = coords.top + shift;
			dragMonitor.pointElem.style.left = Measures.toPx(pointX);
			dragMonitor.pointElem.style.top = Measures.toPx(pointY);
			dragMonitor.pointElem.firstElementChild.innerHTML = `x: ${pointX} y: ${pointY}`;
			dragMonitor.update([
				{property: 'mouseX', value: event.clientX},
				{property: 'mouseY', value: event.clientY}
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
		this.elem = params.elem;
		this.shiftX = params.startPageX - coords.left;
		this.shiftY = params.startPageY - coords.top;
	}

	Draggable.prototype.drag = function (x, y) {
		this.elem.style.left = Measures.toPx(x - this.shiftX);
		this.elem.style.top = Measures.toPx(y - this.shiftY);
	};

	Draggable.prototype.onDragStart = function () {
		this.elem.classList.add('draggable');
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

	function DragMonitor(properties) {
		this.monitorElem = properties.monitorElem;
		this.template = properties.template;
		this.pointElem = properties.pointElem;
		this.indicators = [];
	}

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
});