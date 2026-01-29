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

// Checks if the server passed a schedule that already exists for student use.
document.addEventListener("DOMContentLoaded", initializeSchedulePage);

// Checks if the server passed a schedule that already exists for admin use.
document.body.addEventListener("htmx:afterSwap", (e) => {
    if(e.target.id === "scheduleReviewer")
	{
        initializeSchedulePage();
    }
});

// Button lister to toggle between Select & Deselect mode
if (selectBtn)
{
	selectBtn.addEventListener('click', e => {
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
	});
}

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

	let weeklyMinuteCount = 0;
	for(let i = 0; i < displayedTotals.length; i++)
	{
		let minuteCount = dailyTotals[i];
		displayedTotals[i].textContent = getHours(minuteCount).toString() + "hrs " + getMinutes(minuteCount).toString() + "mins";

		weeklyMinuteCount += minuteCount;
	}

	document.getElementById("weekTotal").textContent = "Weekly Total: " + getHours(weeklyMinuteCount).toString() + "hrs " + getMinutes(weeklyMinuteCount).toString() + "mins";
});

document.addEventListener("mouseover", e => {
	if(isDragging && e.target.classList.contains("minuteSlot")) {
		toggleCell(e.target);
	}
});

// Visual Toggle of Element & Manage selectedCells list
function toggleCell(cell)
{
	if(isSelecting && !cell.classList.contains("selected"))
	{	
		cell.classList.add("selected");
		selectedCells.push(cell);
		addToTotals(cell);
	}
	else if(!isSelecting && cell.classList.contains("selected"))
	{
		cell.classList.remove("selected");
		selectedCells = selectedCells.filter(c => c !== cell);
		removeFromTotals(cell);
	}
}

// Disables submit button once a schedule has been successfully submitted
document.body.addEventListener("pending-review", e => {
	const btn = document.getElementById("submitBtn");
	btn.disabled = true;
	btn.textContent = "Submitted";

	document.querySelector(".week").style.pointerEvents = "none";
})

// Parses through selectedCells to create list of shifts to send to server.
function buildSchedulePayload()
{
	const shifts = [];

	const cellsByDay = {};
	selectedCells.forEach(cell =>
	{
		const day = cell.getAttribute("day");
		const hour = parseInt(cell.getAttribute("hour"));
		const minute = parseInt(cell.getAttribute("minute"));
		const time = hour * 60 + minute; // minutes since midnight

		if (!cellsByDay[day]) cellsByDay[day] = [];
		cellsByDay[day].push(time);
	});

	// For each day, sort and merge into shifts
	Object.keys(cellsByDay).forEach(day =>
	{
		const times = cellsByDay[day].sort((a, b) => a - b);

		let start = times[0];
		let prev = times[0];

		for (let i = 1; i < times.length; i++)
		{
			if (times[i] !== prev + 10)
			{
				// break in continuity → close current shift
				shifts.push(makeShift(day, start, prev));
				start = times[i];
			}

			prev = times[i];	
		}

		// close last shift
		shifts.push(makeShift(day, start, prev));
	});

	return {Shifts: shifts, Approved: null};
}

// Helper function for buildSchedulePayload that aggregates selected timeSlot cells that are continuous.
function makeShift(day, startMinutes, endMinutes)
{
	const startHour = Math.floor(startMinutes /60);
	const startMin = startMinutes % 60;
	const endHour = Math.floor((endMinutes + 10) / 60);
	const endMin = (endMinutes + 10) % 60;

	const minutes = endMinutes - startMinutes + 10;

	return {
		Day: day,
		Start: `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`,
		End: `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`,
		Minutes: minutes
  	};
}

// Helper function for displaying a preexisting schedule from the server
function selectShift(shift)
{
	const [startHour, startMin] = shift.Start.split(":").map(Number);
	const [endHour, endMin] = shift.End.split(":").map(Number);

	const start = startHour * 60 + startMin;
	const end = endHour * 60 + endMin;

	document.querySelectorAll(`.minuteSlot[day = "${shift.Day}"]`).forEach(cell => {
		const hour = parseInt(cell.getAttribute("hour"));
		const minute = parseInt(cell.getAttribute("minute"));
		const time = hour * 60 + minute;

		if (time >= start && time < end)
		{
			toggleCell(cell)
		}
	});
}

// Helper function for page initialization
function initializeSchedulePage() {
    if(window.readOnlyMode)
	{
        document.querySelector(".week").style.pointerEvents = "none";
    }

    if(window.preloadedSchedule)
	{
        window.preloadedSchedule.Shifts.forEach(shift => {
            selectShift(shift);
        });
    }
}


// Daily & Weekly Total Calculation and Update
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