 // Namibia Info Widget script
// Replace with your OpenWeatherMap API key
const OWM_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // <-- put your API key here
const DEFAULT_CITY = "Windhoek,NA";

// --- DOM refs
const localTimeEl = document.getElementById("localTime");
const tempEl = document.getElementById("temp");
const condEl = document.getElementById("conditions");
const locNameEl = document.getElementById("locName");
const weatherEmojiEl = document.getElementById("weatherEmoji");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const sunTimesEl = document.getElementById("sunTimes");

const weatherPanel = document.getElementById("weatherPanel");
const calendarPanel = document.getElementById("calendarPanel");
const countdownPanel = document.getElementById("countdownPanel");

const btnWeather = document.getElementById("btnWeather");
const btnCalendar = document.getElementById("btnCalendar");
const btnCountdown = document.getElementById("btnCountdown");

const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const monthYearEl = document.getElementById("monthYear");
const calendarGrid = document.getElementById("calendar");

const themeToggle = document.getElementById("themeToggle");
const refreshWeatherBtn = document.getElementById("refreshWeather");

const noteModal = document.getElementById("noteModal");
const noteText = document.getElementById("noteText");
const noteModalTitle = document.getElementById("noteModalTitle");
const saveNoteBtn = document.getElementById("saveNote");
const deleteNoteBtn = document.getElementById("deleteNote");
const closeModalBtn = document.getElementById("closeModal");

const countdownEl = document.getElementById("countdown");

// panel nav
btnWeather.addEventListener("click", ()=>showPanel("weather"));
btnCalendar.addEventListener("click", ()=>showPanel("calendar"));
btnCountdown.addEventListener("click", ()=>showPanel("countdown"));

function showPanel(name){
  weatherPanel.classList.remove("visible");
  calendarPanel.classList.remove("visible");
  countdownPanel.classList.remove("visible");
  if(name==="weather") weatherPanel.classList.add("visible");
  if(name==="calendar") calendarPanel.classList.add("visible");
  if(name==="countdown") countdownPanel.classList.add("visible");
}

// initial
showPanel("weather");

// theme
themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", themeToggle.checked);
});

// Live clock using machine time (local)
function updateLocalTime(){
  const now = new Date();
  localTimeEl.textContent = now.toLocaleTimeString();
}
setInterval(updateLocalTime, 1000);
updateLocalTime();

// -------------- WEATHER --------------
async function fetchWeather(){
  if(!OWM_KEY || OWM_KEY==="YOUR_OPENWEATHERMAP_API_KEY"){
    applyFallbackWeather();
    return;
  }

  try{
    const q = encodeURIComponent(DEFAULT_CITY);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${q}&units=metric&appid=${OWM_KEY}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error("Weather fetch failed");
    const data = await res.json();
    renderWeather(data);
  }catch(e){
    console.warn("Weather failed:", e);
    applyFallbackWeather();
  }
}

function applyFallbackWeather(){
  locNameEl.textContent = "Windhoek, NA";
  tempEl.textContent = "24°C";
  condEl.textContent = "Partly Cloudy";
  weatherEmojiEl.textContent = "⛅";
  humidityEl.textContent = "45%";
  windEl.textContent = "3 m/s";
  sunTimesEl.textContent = "-- / --";
}

function renderWeather(data){
  const t = Math.round(data.main.temp);
  tempEl.textContent = `${t}°C`;
  condEl.textContent = `${data.weather[0].description}`;
  locNameEl.textContent = `${data.name}, ${data.sys?.country || "NA"}`;
  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = `${data.wind.speed} m/s`;
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
  sunTimesEl.textContent = `${sunrise} / ${sunset}`;

  weatherEmojiEl.textContent = weatherEmojiFromId(data.weather[0].id);
}

function weatherEmojiFromId(id){
  // map OpenWeather codes to emoji
  if(id >= 200 && id < 300) return "⛈️";
  if(id >= 300 && id < 600) return "🌧️";
  if(id >= 600 && id < 700) return "❄️";
  if(id >= 700 && id < 800) return "🌫️";
  if(id === 800) return "☀️";
  if(id === 801) return "🌤️";
  if(id === 802) return "⛅";
  if(id === 803 || id === 804) return "☁️";
  return "🌤️";
}

refreshWeatherBtn.addEventListener("click", fetchWeather);
fetchWeather();

// -------------- HOLIDAYS (Namibia) --------------
// We include fixed-date holidays and compute those tied to Easter (Good Friday, Easter Monday, Ascension)
function easterSunday(year){
  // Meeus/Jones algorithm (valid for Gregorian calendar)
  const a = year % 19;
  const b = Math.floor(year/100);
  const c = year % 100;
  const d = Math.floor(b/4);
  const e = b % 4;
  const f = Math.floor((b+8)/25);
  const g = Math.floor((b-f+1)/3);
  const h = (19*a + b - d - g + 15) % 30;
  const i = Math.floor(c/4);
  const k = c % 4;
  const l = (32 + 2*e + 2*i - h - k) % 7;
  const m = Math.floor((a + 11*h + 22*l)/451);
  const month = Math.floor((h + l - 7*m + 114)/31);
  const day = ((h + l - 7*m + 114) % 31) + 1;
  return new Date(year, month-1, day);
}

function addDays(d, days){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()+days); }

// build holiday list for a given year
function getNamibiaHolidays(year){
  const list = [];

  // fixed
  const fixed = [
    {m:0,d:1,name:"New Year's Day"},
    {m:2,d:21,name:"Independence Day"},
    {m:4,d:1,name:"Workers' Day"},
    {m:4,d:4,name:"Cassinga Day"}, // May 4
    {m:4,d:25,name:"Africa Day"},
    {m:4,d:28,name:"Genocide Remembrance Day"},
    {m:7,d:26,name:"Heroes' Day"},
    {m:11,d:10,name:"Day of the Namibian Women / Human Rights Day"},
    {m:11,d:25,name:"Christmas Day"},
    {m:11,d:26,name:"Family Day"}
  ];
  fixed.forEach(f=> list.push({date:new Date(year,f.m,f.d),name:f.name}));

  // Sometimes additional ceremonial public holidays occur (e.g., Feb 28, Mar 1) — commonly included in resources.

  // Easter-based
  const easter = easterSunday(year);
  const goodFriday = addDays(easter, -2);
  const easterMonday = addDays(easter, 1);
  list.push({date:goodFriday, name:"Good Friday"});
  list.push({date:easterMonday, name:"Easter Monday"});

  // Ascension Day: 39 days after Easter Sunday
  const ascension = addDays(easter, 39);
  list.push({date:ascension, name:"Ascension Day"});

  // If holiday falls on Sunday, Namibia observes the next Monday (public holiday in lieu).
  // We'll generate "observed" days automatically: if any holiday is Sunday, add observed Monday.
  const observed = [];
  list.forEach(h=>{
    const dow = h.date.getDay();
    if(dow === 0){ // Sunday
      const obs = addDays(h.date, 1);
      observed.push({date:obs, name: h.name + " (observed)"});
    }
  });
  return list.concat(observed);
}

// -------------- CALENDAR UI --------------
let viewDate = new Date(); // date representing the current calendar view (first of month)
viewDate.setDate(1);

function renderCalendar(){
  calendarGrid.innerHTML = "";
  // weekday labels
  const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  for(let w of weekdays){
    const lbl = document.createElement("div");
    lbl.className = "weekday-label";
    lbl.textContent = w;
    calendarGrid.appendChild(lbl);
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  monthYearEl.textContent = `${viewDate.toLocaleString(undefined,{month:"long"})} ${year}`;

  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  // previous month's trailing days count
  const prevMonthDays = new Date(year, month, 0).getDate();

  // holidays for year
  const holidays = getNamibiaHolidays(year).map(h=>({
    key: dateKey(h.date), name:h.name
  }));
  const holidayMap = {};
  holidays.forEach(h=>holidayMap[h.key]=h.name);

  // fill grid: total boxes = weekday labels (7) + day cells; but we already added labels separately, so just render day cells 7x6
  const totalCells = 7*6;
  for(let i=0;i<totalCells;i++){
    const cell = document.createElement("div");
    cell.className = "day-cell";

    const cellIndex = i;
    const dayNum = i - startDow + 1;
    let cellDate;
    if(i < startDow){
      // previous month
      const d = prevMonthDays - (startDow - 1 - i);
      cell.classList.add("other-month");
      cellDate = new Date(year, month-1, d);
    } else if(dayNum > daysInMonth){
      // next month
      cell.classList.add("other-month");
      cellDate = new Date(year, month+1, dayNum - daysInMonth);
    } else {
      cellDate = new Date(year, month, dayNum);
    }

    const dayNumEl = document.createElement("div");
    dayNumEl.className = "day-num";
    dayNumEl.textContent = cellDate.getDate();
    cell.appendChild(dayNumEl);

    // mark weekend with dancing emoji (Saturday=6 Sunday=0)
    const dow = cellDate.getDay();
    if(dow===0 || dow===6){
      const wEmoji = document.createElement("div");
      wEmoji.className = "weekend-emoji";
      wEmoji.textContent = "💃";
      cell.appendChild(wEmoji);
    }

    // holiday check
    const key = dateKey(cellDate);
    if(holidayMap[key]){
      cell.classList.add("holiday");
      const hEmoji = document.createElement("div");
      hEmoji.style.position = "absolute";
      hEmoji.style.right = "8px";
      hEmoji.style.bottom = "8px";
      hEmoji.textContent = "🎉";
      cell.appendChild(hEmoji);

      const title = document.createElement("div");
      title.style.fontSize = "12px";
      title.style.marginTop = "26px";
      title.textContent = holidayMap[key];
      cell.appendChild(title);
    }

    // saved note indicator
    const note = loadNoteForDate(key);
    if(note){
      const mark = document.createElement("div");
      mark.className = "mark-dot";
      mark.textContent = "📝";
      cell.appendChild(mark);
    }

    // click to add / edit mark
    cell.addEventListener("click", ()=>{
      openNoteModal(cellDate);
    });

    calendarGrid.appendChild(cell);
  }
}

function dateKey(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

prevMonthBtn.addEventListener("click", ()=>{
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1);
  renderCalendar();
});
nextMonthBtn.addEventListener("click", ()=>{
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1);
  renderCalendar();
});

renderCalendar();

// -------------- Notes (localStorage) --------------
function loadNoteForDate(key){
  const notes = JSON.parse(localStorage.getItem("niw_notes") || "{}");
  return notes[key] || null;
}
function saveNoteForDate(key, text){
  const notes = JSON.parse(localStorage.getItem("niw_notes") || "{}");
  if(text && text.trim().length>0) notes[key] = text.trim();
  else delete notes[key];
  localStorage.setItem("niw_notes", JSON.stringify(notes));
  renderCalendar();
}

// modal logic
let modalDateKey = null;
function openNoteModal(date){
  modalDateKey = dateKey(date);
  const note = loadNoteForDate(modalDateKey);
  noteText.value = note || "";
  noteModalTitle.textContent = `Note — ${modalDateKey}`;
  noteModal.classList.remove("hidden");
}
saveNoteBtn.addEventListener("click", ()=>{
  saveNoteForDate(modalDateKey, noteText.value);
  noteModal.classList.add("hidden");
});
deleteNoteBtn.addEventListener("click", ()=>{
  saveNoteForDate(modalDateKey, "");
  noteModal.classList.add("hidden");
});
closeModalBtn.addEventListener("click", ()=> noteModal.classList.add("hidden"));

// -------------- WEEKEND COUNTDOWN --------------
function updateCountdown(){
  const now = new Date();
  const year = now.getFullYear();
  // find upcoming Friday at 17:00
  const target = new Date(now);
  // set to this week's Friday
  const curDow = now.getDay();
  const daysToFri = (5 - curDow + 7) % 7; // 5 == Friday
  target.setDate(now.getDate() + daysToFri);
  target.setHours(17,0,0,0);
  // if we are already past this Friday 17:00, jump to next week's Friday
  if(target <= now){
    target.setDate(target.getDate() + 7);
  }
  const diffMs = target - now;
  const diffDays = Math.floor(diffMs / (1000*60*60*24));
  const hrs = Math.floor((diffMs % (1000*60*60*24)) / (1000*60*60));
  const mins = Math.floor((diffMs % (1000*60*60)) / (1000*60));
  const secs = Math.floor((diffMs % (1000*60)) / 1000);
  countdownEl.textContent = `${diffDays} days ${String(hrs).padStart(2,"0")}:${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// -------------- Helpers --------------
/* Ensure when view changes we re-render */
window.addEventListener("focus", ()=>{ updateLocalTime(); renderCalendar(); });

// On load: make calendar visible by default in the center
// (weather already asked for data)
