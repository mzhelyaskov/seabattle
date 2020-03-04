import {Utils} from './utils/utils.js';
import {MeasuresUtils} from './utils/measures.utils.js';
import {Orientation} from './orientations.js';
import {DragMonitor} from './drag-monitor.js';
import {BattleField} from './battlefield.js';
import {Ship} from './ship.js';
import {ShipStatus} from './ship-status.js';
import {Port} from './port.js';
import {Cell} from './cell.js';

export class AppController {

	static run() {
		const environment = {dev: false};
		const dragMonitor = new DragMonitor({
			pointElem: Utils.getElementById('point'),
			monitorElem: Utils.getElementById('drag-monitor'),
			template: Utils.getTemplate('drag-monitor-tmpl')
		});
		const playerBattleField = new BattleField({
			fieldElement: Utils.getElementById('player-battlefield'),
			fieldTemplate: Utils.getTemplate('battlefield-tmpl')
		});
		let playerShips = createPlayerShips();
		let gameStarted = false;
		let draggableShip = null;

		if (environment.dev) {
			dragMonitor.show();
		}
		playerBattleField.render();

		document.addEventListener('mousedown', function (event) {
			if (event.button !== 0 || gameStarted) {
				return false;
			}
			draggableShip = getShipFromEventTarget(event);
			if (!draggableShip) {
				return;
			}
			draggableShip.onDragStart(event.pageX, event.pageY);
			playerBattleField.detachShipFromCell(draggableShip);
			playerBattleField.updateCoordsRect();

			// Monitoring =========================
			if (environment.dev) {
				updateDragMonitorOnDragStart(draggableShip);
			}
		});

		document.addEventListener('mousemove', function (event) {
			if (!draggableShip) {
				return;
			}
			const shipCoordsCenter = draggableShip.getCoordsCenter(event);
			const cell = playerBattleField.getCellUnderCoordsPoint(shipCoordsCenter);
			const decks = draggableShip.decks;
			const orientation = draggableShip.orientation;
			if (playerBattleField.isCellAvailableToAttachShip(cell, decks, orientation)) {
				cell.attachShip(draggableShip);
				draggableShip.holderCell = cell;
				draggableShip.setStatus(ShipStatus.FIXED);
			} else {
				draggableShip.holderCell = null;
				if (draggableShip.elem.parentElement !== document.body) {
					document.body.appendChild(draggableShip.elem);
				}
				draggableShip.drag(event.pageX, event.pageY);
				draggableShip.setStatus(ShipStatus.DRAGGING);
			}

			// Monitoring =========================
			if (environment.dev) {
				const pointX = event.pageX - draggableShip.centerShiftX;
				const pointY = event.pageY - draggableShip.centerShiftY;
				dragMonitor.pointElem.style.left = MeasuresUtils.toPx(pointX);
				dragMonitor.pointElem.style.top = MeasuresUtils.toPx(pointY);
				dragMonitor.pointElem.firstElementChild.innerHTML = `x: ${pointX} y: ${pointY}`;
				dragMonitor.update([
					{property: 'mouseX', value: event.pageX},
					{property: 'mouseY', value: event.pageY}
				]);
			}
		});

		document.addEventListener('mouseup', function (event) {
			if (event.button !== 0 || !draggableShip) {
				return false;
			}
			const ship = draggableShip;
			draggableShip = null;
			if (ship.holderCell) {
				playerBattleField.attachShipToCell(ship.holderCell, ship);
				ship.setContainerToRollback(ship.holderCell);
				ship.setStatus(ShipStatus.ATTACHED);
			} else {
				ship.rollbackDrag();
				if (ship.containerToRoollback instanceof Cell) {
					playerBattleField.attachShipToCell(ship.containerToRoollback, ship);
				}
			}
		});

		document.addEventListener('contextmenu', function (event) {
			if (event.button !== 2 || gameStarted) {
				return;
			}
			const ship = getShipFromEventTarget(event);
			if (ship && playerBattleField.containsShip(ship)) {
				event.preventDefault();
				playerBattleField.detachShipFromCell(ship);
				const orientation = ship.orientation === Orientation.VERTICAL ? Orientation.HORIZONTAL : Orientation.VERTICAL;
				if (playerBattleField.isCellAvailableToAttachShip(ship.holderCell, ship.decks, orientation)) {
					ship.switchOrientation();
				} else {
					ship.shake();
				}
				playerBattleField.attachShipToCell(ship.holderCell, ship);
			}
		});

		function createPlayerShips() {
			const shipElems = document.querySelectorAll('.ship');
			return Array.prototype.reduce.call(shipElems, (ships, shipElem) => {
				ships.push(new Ship({
					id: shipElem.id,
					elem: shipElem,
					decks: +shipElem.dataset.decks,
					container: new Port(shipElem.parentNode)
				}));
				return ships;
			}, []);
		}

		function getShipFromEventTarget(event) {
			const draggableShipElem = event.target.closest('.ship');
			if (!draggableShipElem) {
				return;
			}
			return playerShips.find(s => s.id === draggableShipElem.id);
		}

		function updateDragMonitorOnDragStart(ship) {
			const coords = Utils.getCoordsRect(ship.elem);
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
	}
}