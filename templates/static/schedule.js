let isDragging = false;
let isSelecting = true;
let selectedCells = [];
const selectBtn = document.getElementById("selectBtn");
const dailyTotals = [0, 0, 0, 0, 0]; // Count of 10 minute increments; [Monday, Tuesday, Wednesday, Thursday, Friday]
const displayedTotals = [
	document.getElementById("MondayTotal"),
	document.getElementById("TuesdayTotal"),
	document.getElementById("WednesdayTotal"),
	document.getElementById("ThursdayTotal"),
	document.getElementById("FridayTotal")
];

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

	for(let i = 0; i < displayedTotals.length; i++)
	{
		let minuteCount = dailyTotals[i];
		displayedTotals[i].textContent = getHours(minuteCount).toString() + "hrs " + getMinutes(minuteCount).toString() + "mins";
	}
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
				dailyTotals[0]++;
				break;
			case "Tuesday":
				dailyTotals[1]++;
				break;
			case "Wednesday":
				dailyTotals[2]++;
				break;
			case "Thursday":
				dailyTotals[3]++;
				break;
			case "Friday":
				dailyTotals[4]++;
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
				dailyTotals[0]--;
				break;
			case "Tuesday":
				dailyTotals[1]--;
				break;
			case "Wednesday":
				dailyTotals[2]--;
				break;
			case "Thursday":
				dailyTotals[3]--;
				break;
			case "Friday":
				dailyTotals[4]--;
				break;
		}
	}
}

function getHours(minuteCount)
{
	return Math.trunc(minuteCount / 6);
}

function getMinutes(minuteCount)
{
		return (minuteCount % 6) * 10;
}