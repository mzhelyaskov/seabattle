(function (run) {
	document.addEventListener("DOMContentLoaded", run);
})(function () {

	const LETTERS = "А,Б,В,Г,Д,Е,Ж,З,И,К".split(",");
	const playerFieldElem = getElementById('player-field');
	const fieldTmpl = Handlebars.compile(getTemplate('field-tmpl'));

	generateField(playerFieldElem);

	function generateField(fieldContainer) {
		const rows = [];
		for (let row = 0; row < 10; row++) {
			const cells = [];
			for (let col = 0; col < 10; col++) {
				const rowLabel = col === 0 && (row + 1);
				const colLabel = row === 0 && LETTERS[col];
				cells.push({row, col, rowLabel, colLabel});
			}
			rows.push(cells);
		}
		fieldContainer.innerHTML = fieldTmpl({rows});
	}

	function getElementById(id) {
		return document.getElementById(id);
	}

	function getTemplate(id) {
		return getElementById(id).innerHTML;
	}
});