(function (run) {
	document.addEventListener("DOMContentLoaded", run);
})(function () {

	const environment = {dev: true};
	const LETTERS = "А,Б,В,Г,Д,Е,Ж,З,И,К".split(",");
	let dragMonitor = null;
	let gameStarted = false;
	let draggableShip = null;
	let playerBattleField = null;
	let playerShips = [];

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
		document.querySelectorAll('.ship').forEach((elem) => {
			playerShips.push(new Ship({
				id: elem.id,
				elem: elem,
				decks: +elem.dataset.decks
			}));
		});
		playerBattleField = new BattleField({
			fieldElement: getElementById('player-battlefield'),
			fieldTemplate: getTemplate('battlefield-tmpl')
		});
		playerBattleField.render();
	}, 0);

	document.onmousedown = function (event) {
		if (event.button !== 0 || gameStarted) {
			return false;
		}
		draggableShip = getShipFromEventTarget(event);
		draggableShip.onDragStart(event.pageX, event.pageY);
		playerBattleField.detachShip(draggableShip);
		// Monitoring =========================
		if (environment.dev) {
			// console.table(playerBattleField.stateMatrix.map(cells => cells.map(c => c.status === 'D' ? 'X' : '')));
			updateDragMonitorOnDragStart(draggableShip);
		}
	};

	document.onmousemove = function (event) {
		if (!draggableShip) {
			return;
		}
		const shipCoordsCenter = draggableShip.getCoordsCenter(event);
		const cellUnderShip = playerBattleField.getCellUnderCoordsPoint(shipCoordsCenter);
		if (playerBattleField.isCellAvailableToAttachShip(cellUnderShip, draggableShip)) {
			playerBattleField.stickShipToCell(cellUnderShip, draggableShip);
		} else {
			// draggableShip.holderCell = null;
			// if (playerBattleField.hasShip(draggableShip)) {
			// 	playerBattleField.removeShip(draggableShip);
			// }
			if (draggableShip.elem.parent !== document.body) {
				document.body.appendChild(draggableShip.elem);
				draggableShip.dropZone = null;
			}
			draggableShip.drag(event.pageX, event.pageY);
		}

		// Monitoring =========================
		if (environment.dev) {
			const pointX = event.pageX - draggableShip.centerShiftX;
			const pointY = event.pageY - draggableShip.centerShiftY;
			dragMonitor.pointElem.style.left = Measures.toPx(pointX);
			dragMonitor.pointElem.style.top = Measures.toPx(pointY);
			dragMonitor.pointElem.firstElementChild.innerHTML = `x: ${pointX} y: ${pointY}`;
			dragMonitor.update([
				{property: 'mouseX', value: event.pageX},
				{property: 'mouseY', value: event.pageY}
			]);
		}
	};

	document.onmouseup = function (event) {
		if (event.button !== 0) {
			return false;
		}
		if (!draggableShip) {
			return;
		}
		if (draggableShip.holderCell) {
			playerBattleField.attachShip(draggableShip.holderCell, draggableShip);
		}
		draggableShip = null;
	};

	document.onclick = function (event) {
		if (event.button !== 0 || gameStarted) {
			return false;
		}
		const ship = getShipFromEventTarget(event);
		const holderCell = ship.holderCell;
		if (holderCell) {
			ship.switchOrientation();
			if (playerBattleField.isCellAvailableToAttachShip(holderCell, ship)) {
				playerBattleField.stickShipToCell(holderCell, ship);
			} else {
				ship.switchOrientation();
			}
		}
	};

	function getShipFromEventTarget(event) {
		const draggableShipElem = event.target.closest('.ship');
		if (!draggableShipElem) {
			return;
		}
		return playerShips.find(s => s.id === draggableShipElem.id);
	}

	function updateDragMonitorOnDragStart(ship) {
		const coords = getCoordsRect(ship.elem);
		dragMonitor.update([
			{
				property: 'shipSize',
				value: `W: ${ship.elem.offsetWidth} / H: ${ship.elem.offsetHeight}`
			},
			{
				property: 'shipCords',
				value: `L: ${coords.left} / T: ${coords.top}`
			}
		]);
	}

	// Ship ===============================================
	function Ship(params) {
		this.id = params.id;
		this.elem = params.elem;
		this.decks = params.decks;
		this.width = params.elem.offsetHeight;
		this.length = this.decks * this.width;
		this.orientation = Orientation.HORIZONTAL;
	}

	Ship.prototype.onDragStart = function (mouseX, mouseY) {
		const coords = getCoordsRect(this.elem);
		this.shiftX = mouseX - coords.left;
		this.shiftY = mouseY - coords.top;
		this.centerShiftX = this.shiftX - this.width / 2;
		this.centerShiftY = this.shiftY - this.width / 2;
		this.headCell = null;
	};

	Ship.prototype.switchOrientation = function () {
		this.orientation = this.orientation === Orientation.VERTICAL
			? Orientation.HORIZONTAL
			: Orientation.VERTICAL;
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

	// BattleField ===============================================
	function BattleField(params) {
		this.elem = params.fieldElement;
		this.size = 10;
		this.stateMatrix = [];
		this.fieldTemplate = params.fieldTemplate;
		this.cellsSelector = 'battlefield-cell';
		this.cellSize = undefined;
		this.cells = [];
	}

	BattleField.prototype.getCellUnderCoordsPoint = function (point) {
		const fieldCoordsRect = getCoordsRect(this.elem);
		if (isPointUnderPageRect(fieldCoordsRect, point)) {
			const row = Math.trunc((point.y - fieldCoordsRect.top) / this.cellSize);
			const col = Math.trunc((point.x - fieldCoordsRect.left) / this.cellSize);
			return this.stateMatrix[row][col];
		}
		return null;
	};

	BattleField.prototype.attachShip = function (cell, ship) {
		const fromCol = cell.col;
		const toCol = ship.orientation === Orientation.HORIZONTAL ? cell.col + ship.decks - 1 : cell.col;
		const fromRow = cell.row;
		const toRow = ship.orientation === Orientation.VERTICAL ? cell.row + ship.decks - 1 : cell.row;
		for (let r = fromRow; r <= toRow; r++) {
			for (let c = fromCol; c <= toCol; c++) {
				const cell = this.stateMatrix[r][c];
				cell.status = CellStatus.DECK;
				cell.ship = ship;
				ship.cells.push(cell);
			}
		}
		// console.table(this.stateMatrix.map(cells => cells.map(c => c.status === 'D' ? 'X' : '')));
	};

	BattleField.prototype.detachShip = function (ship) {
		this.cells
			.filter(cell => cell.ship === ship)
			.forEach(cell => {
				cell.status = CellStatus.EMPTY;
				cell.ship = null;
			});
	};

	BattleField.prototype.stickShipToCell = function (cell, ship) {
		cell.elem.appendChild(ship.elem);
		ship.elem.style.left = '0';
		ship.elem.style.top = '0';
		ship.holderCell = cell;
	};

	BattleField.prototype.isCellAvailableToAttachShip = function (cell, ship) {
		if (!cell || cell.status !== CellStatus.EMPTY) {
			return false;
		}
		if (ship.orientaion === Orientation.HORIZONTAL && (cell.col + ship.decks) > this.size) {
			return false;
		}
		if (ship.orientaion === Orientation.VERTICAL && (cell.row + ship.decks) > this.size) {
			return false;
		}
		const maxIndex = this.size - 1;
		const fromCol = Math.max(cell.col - 1, 0);
		const toCol = ship.orientaion === Orientation.HORIZONTAL
			? Math.min(cell.col + ship.decks, maxIndex)
			: Math.min(cell.col + 1, maxIndex);
		const fromRow = Math.max(cell.row - 1, 0);
		const toRow = ship.orientaion === Orientation.VERTICAL
			? Math.min(cell.row + ship.decks, maxIndex)
			: Math.min(cell.row + 1, maxIndex);
		for (let row = fromRow; row <= toRow; row++) {
			for (let col = fromCol; col <= toCol; col++) {
				const cell = this.stateMatrix[row][col];
				if (cell.status !== CellStatus.EMPTY) {
					return false
				}
			}
		}
		return true;
	};

	BattleField.prototype.render = function () {
		const rows = [];
		for (let row = 0; row < this.size; row++) {
			const cells = [];
			for (let col = 0; col < this.size; col++) {
				const rowLabel = col === 0 && (row + 1);
				const colLabel = row === 0 && LETTERS[col];
				cells.push({row, col, rowLabel, colLabel});
			}
			rows.push(cells);
		}
		this.elem.innerHTML = this.fieldTemplate({rows});

		this.stateMatrix = new Array(this.size).fill(null).map(item => {
			return new Array(this.size).fill(null);
		});
		this.elem.querySelectorAll('.' + this.cellsSelector).forEach(cellElem => {
			const row = cellElem.dataset.row;
			const col = cellElem.dataset.col;
			const cell = new Cell({
				elem: cellElem,
				status: CellStatus.EMPTY,
				row: +row,
				col: +col
			});
			this.cells.push(cell);
			this.stateMatrix[row][col] = cell;
		});
		const coords = getCoordsRect(this.elem);
		this.cellSize = (coords.bottom - coords.top) / this.size;
	};

	function Cell(props) {
		this.elem = props.elem;
		this.status = props.status;
		this.row = props.row;
		this.col = props.col;
		this.ship = null;
	}

	// DragMonitor ===============================================
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

	// Util functions ==========================================
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
});