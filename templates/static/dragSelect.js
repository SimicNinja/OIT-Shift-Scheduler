let isDragging = false;
let selectedCells = [];

document.addEventListener("mousedown", e => {
	if(e.target.classList.contains("timeSlot"))
	{
		isDragging = true;
		toggleCell(e.target);
	}
});

document.addEventListener("mouseup", e => {
	isDragging = false;
});

document.addEventListener("mouseover", e => {
	if (isDragging && e.target.classList.contains("timeSlot")) {
		toggleCell(e.target);
	}
});

// Toggles selected 
function toggleCell(cell) {
	cell.classList.toggle("selected");

	if(cell.classList.contains("selected"))
	{
		selectedCells.push(cell);
	}
	else
	{
		selectedCells = selectedCells.filter(c => c !== cell);
	}
}