let isDragging = false;
let isSelecting = true;
let selectedCells = [];
const dailyTotals = new Map([["Monday", 0], ["Tuesday", 0], ["Wednesday", 0], ["Thursday", 0], ["Friday", 0]]); // Count of 10 minute increments
const selectBtn = document.getElementById("selectBtn");

// Button lister to toggle between Select & Deselect mode
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

// Mouse listeners for schedule selection
document.addEventListener("mousedown", e => {
	if(e.target.classList.contains("minuteSlot"))
	{
		isDragging = true;
		toggleCell(e.target);
	}
});

document.addEventListener("mouseup", e => {
	isDragging = false;
});

document.addEventListener("mouseover", e => {
	if (isDragging && e.target.classList.contains("minuteSlot")) {
		toggleCell(e.target);
	}
});

// Visual Toggle of Element
function toggleCell(cell)
{
	if(isSelecting)
	{	
		cell.classList.add("selected");
		selectedCells.push(cell);
		addToTotals(cell);
	}
	else
	{
		cell.classList.remove("selected");
		selectedCells = selectedCells.filter(c => c !== cell);
		removeFromTotals(cell);
	}
}

// Daily & Weekly Total Calculation and update
function addToTotals(cell)
{
	if(!cell.classList.contains("calculated"))
	{
		cell.classList.add("calculated");
		switch(cell.attributes.day.value)
		{
			case "Monday":
				dailyTotals.set("Monday", dailyTotals.get("Monday") + 1);
				break;
			case "Tuesday":
				dailyTotals.set("Tuesday", dailyTotals.get("Tuesday") + 1);
				break;
			case "Wednesday":
				dailyTotals.set("Wednesday", dailyTotals.get("Wednesday") + 1);
				break;
			case "Thursday":
				dailyTotals.set("Thursday", dailyTotals.get("Thursday") + 1);
				break;
			case "Friday":
				dailyTotals.set("Friday", dailyTotals.get("Friday") + 1);
				break;
		}
	}
}

function removeFromTotals(cell)
{
	if(cell.classList.contains("calculated"))
	{
		cell.classList.remove("calculated")
		switch(cell.attributes.day.value)
		{
			case "Monday":
				dailyTotals.set("Monday", dailyTotals.get("Monday") - 1);
				break;
			case "Tuesday":
				dailyTotals.set("Tuesday", dailyTotals.get("Tuesday") - 1);
				break;
			case "Wednesday":
				dailyTotals.set("Wednesday", dailyTotals.get("Wednesday") - 1);
				break;
			case "Thursday":
				dailyTotals.set("Thursday", dailyTotals.get("Thursday") - 1);
				break;
			case "Friday":
				dailyTotals.set("Friday", dailyTotals.get("Friday") - 1);
				break;
		}
	}
}