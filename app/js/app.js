(function (run) {
	document.addEventListener("DOMContentLoaded", run);
})(function () {

	const environment = {dev: false};
	const dragMonitor = new DragMonitor({
		pointElem: getElementById('point'),
		monitorElem: getElementById('drag-monitor'),
		template: getTemplate('drag-monitor-tmpl')
	});
	const playerBattleField = new BattleField({
		fieldElement: getElementById('player-battlefield'),
		fieldTemplate: getTemplate('battlefield-tmpl')
	});
	let playerShips = createShips();
	let gameStarted = false;
	let draggableShip = null;

	if (environment.dev) {
		dragMonitor.show();
	}
	playerBattleField.render();

	document.onmousedown = function (event) {
		if (event.button !== 0 || gameStarted) {
			return false;
		}
		draggableShip = getShipFromEventTarget(event);
		if (!draggableShip) {
			return;
		}
		draggableShip.onDragStart(event.pageX, event.pageY);
		playerBattleField.detachShip(draggableShip);

		// Monitoring =========================
		if (environment.dev) {
			updateDragMonitorOnDragStart(draggableShip);
		}
	};

	document.onmousemove = function (event) {
		if (!draggableShip) {
			return;
		}
		const shipCoordsCenter = draggableShip.getCoordsCenter(event);
		const cellUnderShip = playerBattleField.getCellUnderCoordsPoint(shipCoordsCenter);
		if (playerBattleField.isCellAvailableToAttachShip(cellUnderShip, draggableShip.decks, draggableShip.orientation)) {
			playerBattleField.stickShipToCell(cellUnderShip, draggableShip);
		} else {
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
		if (draggableShip.headCell) {
			playerBattleField.attachShip(draggableShip.headCell, draggableShip);
		}
		draggableShip = null;
	};

	document.oncontextmenu = function (event) {
		event.preventDefault();
		if (event.button !== 2 || gameStarted) {
			return;
		}
		const ship = getShipFromEventTarget(event);
		if (ship && playerBattleField.containsShip(ship)) {
			playerBattleField.detachShip(ship);
			const orientation = ship.orientation === Orientation.VERTICAL ? Orientation.HORIZONTAL : Orientation.VERTICAL;
			if (playerBattleField.isCellAvailableToAttachShip(ship.headCell, ship.decks, orientation)) {
				ship.switchOrientation();
			} else {
				ship.shake();
			}
			playerBattleField.attachShip(ship.headCell, ship);
		}
	};

	function createShips() {
		return Array.prototype.reduce.call(document.querySelectorAll('.ship'), (ships, shipElem) => {
			ships.push(new Ship({
				id: shipElem.id,
				elem: shipElem,
				decks: +shipElem.dataset.decks
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
});