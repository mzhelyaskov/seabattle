export class DragMonitor {

	constructor(properties) {
		this.monitorElem = properties.monitorElem;
		this.template = properties.template;
		this.pointElem = properties.pointElem;
		this.indicators = [];
	}

	update(indicators) {
		indicators.forEach(indicator => {
			const foundIndicator = this.indicators.find(i => i.property === indicator.property);
			if (foundIndicator) {
				foundIndicator.value = indicator.value;
			} else {
				this.indicators.push(indicator);
			}
		});
		this.monitorElem.innerHTML = this.template({indicators: this.indicators});
	}

	show() {
		this.monitorElem.classList.add('active');
		this.pointElem.classList.add('active');
	}
}
