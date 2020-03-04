import {Orientation} from './orientations.js';
import {CellStatus} from './cell-status.js';
import {Utils} from './utils/utils.js';
import {Cell} from './cell.js';

export class BattleField {

	constructor(params) {
		this.elem = params.fieldElement;
		this.size = 10;
		this.stateMatrix = [];
		this.fieldTemplate = params.fieldTemplate;
		this.cellSize = undefined;
		this.cells = [];
		this.coordsRect = {};
		this.ships = new Set();
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
		this.coordsRect = Utils.getCoordsRect(this.elem);
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
			const cell = new Cell({
				elem: cellElem,
				status: CellStatus.EMPTY,
				row: +row,
				col: +col
			});
			this.cells.push(cell);
			this.stateMatrix[row][col] = cell;
		});
		const coords = Utils.getCoordsRect(this.elem);
		this.cellSize = (coords.bottom - coords.top) / this.size;
	}

	containsShip(ship) {
		return this.ships.has(ship);
	}

	attachShipToCell(cellToAttach, ship) {
		const fromCol = cellToAttach.col;
		const toCol = ship.orientation === Orientation.HORIZONTAL ? cellToAttach.col + ship.decks - 1 : cellToAttach.col;
		const fromRow = cellToAttach.row;
		const toRow = ship.orientation === Orientation.VERTICAL ? cellToAttach.row + ship.decks - 1 : cellToAttach.row;
		for (let r = fromRow; r <= toRow; r++) {
			for (let c = fromCol; c <= toCol; c++) {
				const stateCell = this.stateMatrix[r][c];
				stateCell.status = CellStatus.DECK;
				ship.cells.push(stateCell);
			}
		}
		this.ships.add(ship);
	}

	detachShipFromCell(ship) {
		ship.cells.forEach(cell => cell.status = CellStatus.EMPTY);
		ship.cells = [];
		this.ships.delete(ship);
	}

	logState() {
		this.stateMatrix.map(row => {
			console.log(row.map(cell => cell.status === 'D' ? 'X' : '_'));
		});
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
}
