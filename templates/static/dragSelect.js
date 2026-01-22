let isDragging = false;
let isSelecting = true;
let selectedCells = [];
const selectBtn = document.getElementById("selectBtn");

selectBtn.addEventListener('click', function() {
	if(selectBtn.textContent === "Select Mode")
	{
		isSelecting = false;
		selectBtn.textContent = "Deselect Mode";
	}
	else if(selectBtn.textContent === "Deselect Mode")
	{
		isSelecting = true;
		selectBtn.textContent = "Select Mode";
	}
})

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

function toggleCell(cell)
{
	if(isSelecting)
	{	
		cell.classList.add("selected");
		selectedCells.push(cell);
	}
	else
	{
		cell.classList.remove("selected");
		selectedCells = selectedCells.filter(c => c !== cell);
	}
}