import {Orientation} from './orientations.js';
import {CellStatus} from './cell-status.js';
import {Utils} from './utils/utils.js';
import {Cell} from './cell.js';
import {ShipStatus} from "./ship-status";

export class BattleField {

	constructor(params) {
		this.elem = params.fieldElement;
		this.size = 10;
		this.stateMatrix = [];
		this.fieldTemplate = params.fieldTemplate;
		this.cellSize = null;
		this.cells = [];
		this.coordsRect = {};
		this.shipToBindCells = new Map();
	}

	getCellUnderCoordsPoint(point) {
		if (Utils.isPointUnderPageRect(this.coordsRect, point)) {
			const row = ~~((point.y - this.coordsRect.top) / this.cellSize);
			const col = ~~((point.x - this.coordsRect.left) / this.cellSize);
			return this.stateMatrix[row][col];
		}
		return null;
	}

	updateCoordsRect() {
		const coords = Utils.getCoordsRect(this.elem);
		this.coordsRect = coords;
		this.cellSize = (coords.bottom - coords.top) / this.size;
	}

	render() {
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
		this.elem.querySelectorAll('.battlefield-cell').forEach(cellElem => {
			const row = cellElem.dataset.row;
			const col = cellElem.dataset.col;
			const cell = new Cell({elem: cellElem, status: CellStatus.EMPTY, row: +row, col: +col});
			this.cells.push(cell);
			this.stateMatrix[row][col] = cell;
		});
	}

	containsShip(ship) {
		return this.shipToBindCells.has(ship);
	}

	attachShip(mainCell, ship) {
		const bindCells = [];
		const fromCol = mainCell.col;
		const toCol = ship.orientation === Orientation.HORIZONTAL ? mainCell.col + ship.decks - 1 : mainCell.col;
		const fromRow = mainCell.row;
		const toRow = ship.orientation === Orientation.VERTICAL ? mainCell.row + ship.decks - 1 : mainCell.row;
		for (let row = fromRow; row <= toRow; row++) {
			for (let col = fromCol; col <= toCol; col++) {
				const stateCell = this.stateMatrix[row][col];
				stateCell.status = CellStatus.DECK;
				bindCells.push(stateCell);
			}
		}
		this.shipToBindCells.set(ship, bindCells);
	}

	detachShip(ship) {
		if (this.shipToBindCells.has(ship)) {
			this.shipToBindCells.get(ship).forEach(cell => cell.status = CellStatus.EMPTY); // Очистить статус ячеек
			this.shipToBindCells.delete(ship); // Убрать связь между ship и cells
		}
	}

	logState() {
		let logStr = '';
		this.stateMatrix.map(row => {
			logStr += row.map(cell => cell.status === 'D' ? '▦' : '▢').join('') + '\n';
		});
		console.log(logStr);
		console.log('---------------------------------------------------');
	}

	isCellAvailableToAttachShip(cell, decks, orientation) {
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
				const stateCell = this.stateMatrix[row][col];
				if (stateCell.status !== CellStatus.EMPTY) {
					return false
				}
			}
		}
		return true;
	}

	randomShipsLocation(ships) {
		ships.forEach(ship => this.detachShip(ship));
		ships.forEach(ship => {
			let x, y, orientation, cell;
			do {
				x = Utils.randomInteger(0, 9);
				y = Utils.randomInteger(0, 9);
				orientation = Utils.randomInteger(0, 1) ? Orientation.VERTICAL : Orientation.HORIZONTAL;
				cell = this.stateMatrix[y][x];
			} while (!this.isCellAvailableToAttachShip(cell, ship.decks, orientation));
			ship.setOrientation(orientation);
			cell.insertShip(ship);
			ship.setContainerToRollback(cell);
			ship.setStatus(ShipStatus.ATTACHED);
			this.attachShip(cell, ship);
			ship.mainCell = cell;
		});
	}
}
