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

DragMonitor.prototype.show = function () {
	this.monitorElem.classList.add('active');
	this.pointElem.classList.add('active');
};