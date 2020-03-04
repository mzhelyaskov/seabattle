export class Cell {

	constructor(props) {
		this.elem = props.elem;
		this.status = props.status;
		this.row = props.row;
		this.col = props.col;
	}

	attachShip(ship) {
		this.elem.appendChild(ship.elem);
		ship.elem.style.left = '0';
		ship.elem.style.top = '0';
	}
}