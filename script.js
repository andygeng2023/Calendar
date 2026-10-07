const monthTitle = document.querySelector("#month-title");
const calendar = document.querySelector("#calendar");
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");
const todayButton = document.querySelector("#today");
const eventForm = document.querySelector("#event-form");
const eventTitle = document.querySelector("#event-title");
const eventDate = document.querySelector("#event-date");
const eventTime = document.querySelector("#event-time");
const eventDescription = document.querySelector("#event-description");
const eventsContainer = document.querySelector("#events");
const clearEventsButton = document.querySelector("#clear-events");

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric"
});

let currentDate = new Date();
let selectedDate = toDateKey(new Date());
let events = JSON.parse(localStorage.getItem("calendar-events") || "[]");

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function saveEvents() {
  localStorage.setItem("calendar-events", JSON.stringify(events));
}

function renderCalendar() {
  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthTitle.textContent = monthFormatter.format(currentDate);

  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) => {
    const header = document.createElement("div");
    header.className = "day-name";
    header.textContent = day;
    calendar.appendChild(header);
  });

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();

  for (let i = startOffset - 1; i >= 0; i--) {
    addDayCell(new Date(year, month - 1, daysInPreviousMonth - i), true);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    addDayCell(new Date(year, month, day), false);
  }

  const totalCells = startOffset + daysInMonth;
  const trailingCells = (7 - (totalCells % 7)) % 7;

  for (let day = 1; day <= trailingCells; day++) {
    addDayCell(new Date(year, month + 1, day), true);
  }

  renderEvents();
}

function addDayCell(date, otherMonth) {
  const key = toDateKey(date);
  const cell = document.createElement("button");

  cell.type = "button";
  cell.className = "calendar-cell";
  if (otherMonth) cell.classList.add("other-month");
  if (key === toDateKey(new Date())) cell.classList.add("today");
  if (key === selectedDate) cell.classList.add("selected");

  const number = document.createElement("span");
  number.className = "day-number";
  number.textContent = date.getDate();
  cell.appendChild(number);

  const dayEvents = events.filter((event) => event.date === key);
  dayEvents.slice(0, 2).forEach((event) => {
    const dot = document.createElement("span");
    dot.className = "event-dot";
    dot.textContent = event.time ? event.time + " " + event.title : event.title;
    cell.appendChild(dot);
  });

  cell.addEventListener("click", () => {
    selectedDate = key;
    eventDate.value = key;
    renderCalendar();
  });

  calendar.appendChild(cell);
}

function renderEvents() {
  const selectedEvents = events
    .filter((event) => event.date === selectedDate)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  eventsContainer.innerHTML = "";

  if (selectedEvents.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No events for " + selectedDate + ".";
    eventsContainer.appendChild(empty);
    return;
  }

  selectedEvents.forEach((event) => {
    const item = document.createElement("article");
    item.className = "event-item";

    const content = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = event.title;
    content.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "event-meta";
    meta.textContent = (event.time || "No time") + (event.description ? " — " + event.description : "");
    content.appendChild(meta);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      events = events.filter((item) => item.id !== event.id);
      saveEvents();
      renderCalendar();
    });

    item.append(content, remove);
    eventsContainer.appendChild(item);
  });
}

previousButton.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextButton.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

todayButton.addEventListener("click", () => {
  currentDate = new Date();
  selectedDate = toDateKey(new Date());
  eventDate.value = selectedDate;
  renderCalendar();
});

eventForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const newEvent = {
    id: crypto.randomUUID(),
    title: eventTitle.value.trim(),
    date: eventDate.value,
    time: eventTime.value,
    description: eventDescription.value.trim()
  };

  if (!newEvent.title || !newEvent.date) return;

  events.push(newEvent);
  selectedDate = newEvent.date;
  currentDate = new Date(newEvent.date + "T12:00:00");
  saveEvents();
  eventForm.reset();
  eventDate.value = selectedDate;
  renderCalendar();
});

clearEventsButton.addEventListener("click", () => {
  if (!confirm("Delete every saved event?")) return;
  events = [];
  saveEvents();
  renderCalendar();
});

eventDate.value = selectedDate;
renderCalendar();