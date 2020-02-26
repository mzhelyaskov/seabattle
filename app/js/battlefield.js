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

BattleField.prototype.containsShip = function (ship) {
	return this.cells.some(cell => cell.ship === ship);
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
	ship.headCell = cell;
};

BattleField.prototype.isCellAvailableToAttachShip = function (cell, decks, orientation) {
	if (!cell || cell.status !== CellStatus.EMPTY) {
		return false;
	}
	if (orientation === Orientation.HORIZONTAL && (cell.col + decks) > this.size) {
		return false;
	}
	if (orientation === Orientation.VERTICAL && (cell.row + decks) > this.size) {
		return false;
	}
	const maxIndex = this.size - 1;
	const fromCol = Math.max(cell.col - 1, 0);
	const toCol = orientation === Orientation.HORIZONTAL
		? Math.min(cell.col + decks, maxIndex)
		: Math.min(cell.col + 1, maxIndex);
	const fromRow = Math.max(cell.row - 1, 0);
	const toRow = orientation === Orientation.VERTICAL
		? Math.min(cell.row + decks, maxIndex)
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
	const letters = "А,Б,В,Г,Д,Е,Ж,З,И,К".split(",");
	const rows = [];
	for (let row = 0; row < this.size; row++) {
		const cells = [];
		for (let col = 0; col < this.size; col++) {
			const rowLabel = col === 0 && (row + 1);
			const colLabel = row === 0 && letters[col];
			cells.push({row, col, rowLabel, colLabel});
		}
		rows.push(cells);
	}
	this.elem.innerHTML = this.fieldTemplate({rows});

	this.stateMatrix = new Array(this.size).fill(null).map(() => {
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