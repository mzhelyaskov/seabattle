import './css/bootstrap.min.css';
import './scss/main.scss';
import {ShipDragController} from './js/ship-drag-controller.js';

document.addEventListener("DOMContentLoaded", () => {
	ShipDragController.init();
});