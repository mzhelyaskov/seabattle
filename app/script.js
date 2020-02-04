(function (run) {
	Sqrl.autoEscaping(false);
	document.addEventListener("DOMContentLoaded", run);
})(function () {

	const playerFieldElem = getElementById('player-field');
	const fieldTmpl = Sqrl.Compile(getTemplate('field-tmpl'));

	generateField(playerFieldElem);

	function generateField(fieldContainer) {
		const rows = [];
		for (let row = 0; row < 10; row++) {
			const cells = [];
			for (let col = 0; col < 10; col++) {
				cells.push({row: row, col: col});
			}
			rows.push(cells);
		}
		fieldContainer.innerHTML = fieldTmpl({rows: rows}, Sqrl);
	}

	function getElementById(id) {
		return document.getElementById(id);
	}

	function getTemplate(id) {
		return getElementById(id).innerHTML;
	}
});