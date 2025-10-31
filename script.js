const OPENWEATHER_API_KEY = "418cf366faa52b1dd1bd71328f11e271";
const WEATHER_API_BASE = "https://api.openweathermap.org/data/2.5/weather";
const DEFAULT_CITY = "Windhoek,NA";

let state = {
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth(), // 0-indexed
  holidaysRaw: [],
  holidaysComputed: [], // {dateISO, name, description, emoji}
  events: loadEvents(),
};

document.addEventListener("DOMContentLoaded", init);

// ---------- init ----------
async function init() {
  bindUI();
  await loadHolidays();
  renderCalendar();
  renderUpcoming();
  startClock();
  startCountdown();
  // initial weather load (Windhoek)
  fetchWeatherByCity(DEFAULT_CITY);
}

// ---------- UI Bindings ----------
function bindUI() {
  document.getElementById("prevMonth").addEventListener("click", () => { changeMonth(-1); });
  document.getElementById("nextMonth").addEventListener("click", () => { changeMonth(1); });
  document.getElementById("prevYear").addEventListener("click", () => { changeYear(-1); });
  document.getElementById("nextYear").addEventListener("click", () => { changeYear(1); });
  document.getElementById("todayBtn").addEventListener("click", goToToday);
  document.getElementById("addEventBtn").addEventListener("click", () => openAddEventModalForDate(new Date()));
  document.getElementById("searchBtn").addEventListener("click", onSearch);
  document.getElementById("searchInput").addEventListener("keypress", (e)=>{ if(e.key==='Enter') onSearch() });
  document.getElementById("geoBtn").addEventListener("click", geoLocate);
  document.getElementById("refreshBtn").addEventListener("click", refreshEverything);
  document.getElementById("modeToggle").addEventListener("click", toggleMode);

  // modal actions
  document.getElementById("modalCancel").addEventListener("click", closeModal);
  document.getElementById("modalSave").addEventListener("click", modalSave);
}

// ---------- Holidays ----------
async function loadHolidays(){
  try {
    const r = await fetch("./holidays.json");
    const j = await r.json();
    state.holidaysRaw = j.holidays || [];
    computeHolidaysForYear(state.viewYear);
  } catch (err){
    console.error("Failed to load holidays.json", err);
  }
}

function computeHolidaysForYear(year){
  const out = [];
  for (const h of state.holidaysRaw){
    if (h.type === "fixed"){
      const dt = new Date(Date.UTC(year, h.month -1, h.day));
      out.push({
        id: h.id,
        name: h.name,
        description: h.description || "",
        emoji: h.emoji || "🎉",
        dateISO: dt.toISOString().slice(0,10)
      });
    } else if (h.type === "easter_offset"){
      const easter = computeEasterSunday(year);
      const dt = new Date(easter);
      dt.setDate(dt.getDate() + (h.offset || 0));
      out.push({
        id: h.id,
        name: h.name,
        description: h.description || "",
        emoji: h.emoji || "🎉",
        dateISO: dt.toISOString().slice(0,10)
      });
    }
  }
  state.holidaysComputed = out;
}

// compute Easter Sunday
function computeEasterSunday(y){
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const L = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * L) / 451);
  const month = Math.floor((h + L - 7 * m + 114) / 31); // 3=March,4=April
  const day = ((h + L - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(y, month - 1, day));
}

// ---------- Calendar Rendering ----------
function renderCalendar(){
  computeHolidaysForYear(state.viewYear);
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";

  // Weekday headers
  const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  for (let wd of weekdays){
    const el = document.createElement("div");
    el.className = "weekday";
    el.textContent = wd;
    cal.appendChild(el);
  }

  const firstOfMonth = new Date(state.viewYear, state.viewMonth, 1);
  const startDay = firstOfMonth.getDay(); // 0-6
  const daysInMonth = new Date(state.viewYear, state.viewMonth+1, 0).getDate();

  // previous month's trailing days
  const prevMonthDays = new Date(state.viewYear, state.viewMonth, 0).getDate();
  const totalCells = Math.ceil((startDay + daysInMonth)/7)*7;
  let dayCounter = 1;
  for (let i=0;i<totalCells;i++){
    const cell = document.createElement("div");
    cell.className = "day";
    if (i < startDay){
      // previous month
      const d = prevMonthDays - (startDay - 1 - i);
      cell.classList.add("other-month");
      cell.dataset.date = formatISO(new Date(state.viewYear, state.viewMonth -1, d));
      cell.innerHTML = `<div class="date">${d}</div>`;
    } else if (i >= startDay + daysInMonth){
      // next month
      const d = dayCounter++;
      cell.classList.add("other-month");
      cell.dataset.date = formatISO(new Date(state.viewYear, state.viewMonth +1, d));
      cell.innerHTML = `<div class="date">${d}</div>`;
    } else {
      const d = i - startDay + 1;
      const dateObj = new Date(state.viewYear, state.viewMonth, d);
      const iso = formatISO(dateObj);
      cell.dataset.date = iso;
      cell.innerHTML = `<div class="date">${d}</div>`;
      // mark today
      const todayISO = formatISO(new Date());
      if (iso === todayISO){
        cell.classList.add("today");
      }
      // check holiday
      const holiday = state.holidaysComputed.find(h=>h.dateISO===iso);
      if (holiday){
        cell.classList.add("holiday");
        const em = document.createElement("div");
        em.className = "emoji";
        em.textContent = holiday.emoji || "🎉";
        cell.appendChild(em);
      } else {
        // weekend emoji (Saturday or Sunday)
        const wd = dateObj.getDay();
        if (wd === 0 || wd === 6){
          const em = document.createElement("div");
          em.className = "emoji";
          em.textContent = "🕺";
          cell.appendChild(em);
        }
      }
      // show events for this date
      const evs = getEventsForDate(iso);
      if (evs.length){
        const pill = document.createElement("div");
        pill.className = "event-pill";
        pill.textContent = evs[0].title;
        cell.appendChild(pill);
      }
      // click handler
      cell.addEventListener("click", ()=> onDateClick(iso));
    }
    cal.appendChild(cell);
  }

  // update month-year label
  const monNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  document.getElementById("monthYear").textContent = `${monNames[state.viewMonth]} ${state.viewYear}`;
}

// format date to yyyy-mm-dd
function formatISO(d){
  const dt = new Date(d.getTime() - (d.getTimezoneOffset()*60000)); // align to local date
  return dt.toISOString().slice(0,10);
}

// prev/next
function changeMonth(delta){
  state.viewMonth += delta;
  if (state.viewMonth < 0){ state.viewMonth = 11; state.viewYear--; }
  if (state.viewMonth > 11){ state.viewMonth = 0; state.viewYear++; }
  renderCalendar();
  renderUpcoming();
}
function changeYear(delta){
  state.viewYear += delta;
  renderCalendar();
  renderUpcoming();
}
function goToToday(){
  const now = new Date();
  state.viewYear = now.getFullYear();
  state.viewMonth = now.getMonth();
  renderCalendar();
  renderUpcoming();
}

// ---------- Date click: show options (add event / holiday details) ----------
function onDateClick(iso){
  const holiday = state.holidaysComputed.find(h=>h.dateISO===iso);
  const evs = getEventsForDate(iso);
  const dateObj = new Date(iso + "T00:00:00Z");
  const title = `${iso} — ${dateObj.toDateString()}`;
  openModal(title, buildModalBody(iso, holiday, evs), false, {iso});
}

function buildModalBody(iso, holiday, evs){
  const container = document.createElement("div");
  if (holiday){
    const h = document.createElement("div");
    h.innerHTML = `<strong>${holiday.emoji} ${holiday.name}</strong><p class="small">${holiday.description}</p>`;
    container.appendChild(h);
  }
  const evList = document.createElement("div");
  evList.style.marginTop = "8px";
  evList.innerHTML = `<div><strong>Events</strong></div>`;
  const ul = document.createElement("ul");
  ul.style.paddingLeft="14px";
  ul.style.marginTop="6px";
  if (evs.length===0){
    const li = document.createElement("li");
    li.textContent = "(No events)";
    ul.appendChild(li);
  } else {
    for (const e of evs){
      const li = document.createElement("li");
      li.textContent = `${e.title} (${e.createdAt || ""}) `;
      const del = document.createElement("button");
      del.textContent = "Delete";
      del.style.marginLeft="8px";
      del.addEventListener("click", ()=>{
        deleteEvent(e.id);
        closeModal();
        renderCalendar();
        renderEventsList();
      });
      li.appendChild(del);
      ul.appendChild(li);
    }
  }
  container.appendChild(evList);
  container.appendChild(ul);

  // add quick-add form
  const form = document.createElement("div");
  form.innerHTML = `<hr><div><label>New event title</label><input id="modalEventTitle" placeholder="Event title" style="width:100%;padding:8px;margin-top:6px;border-radius:8px"></div>`;
  container.appendChild(form);
  return container;
}

// ---------- Modal helpers ----------
let modalState = {};
function openModal(title, bodyEl, showSave=true, meta={}){
  modalState.meta = meta || {};
  document.getElementById("modalTitle").textContent = title;
  const body = document.getElementById("modalBody");
  body.innerHTML = "";
  body.appendChild(bodyEl);
  document.getElementById("modalSave").style.display = showSave? "inline-block":"none";
  document.getElementById("modalBackdrop").classList.remove("hidden");
}
function closeModal(){
  document.getElementById("modalBackdrop").classList.add("hidden");
}
function modalSave(){
  // modal save used for adding event
  const titleInput = document.getElementById("modalEventTitle");
  if (!titleInput || !titleInput.value.trim()){
    // nothing entered: just close
    closeModal();
    return;
  }
  const title = titleInput.value.trim();
  const iso = modalState.meta.iso;
  addEvent(iso, title);
  closeModal();
  renderCalendar();
  renderEventsList();
}

// ---------- Events storage ----------
function loadEvents(){
  try {
    const raw = localStorage.getItem("namibia-widget-events");
    return raw ? JSON.parse(raw) : [];
  } catch (e){ return []; }
}
function saveEvents(){
  localStorage.setItem("namibia-widget-events", JSON.stringify(state.events));
}
function getEventsForDate(iso){
  return state.events.filter(e=>e.dateISO === iso);
}
function addEvent(iso, title){
  const ev = {
    id: "ev_" + Date.now(),
    dateISO: iso,
    title,
    createdAt: new Date().toLocaleString()
  };
  state.events.push(ev);
  saveEvents();
}
function deleteEvent(id){
  state.events = state.events.filter(e=>e.id!==id);
  saveEvents();
}
function renderEventsList(){
  const ul = document.getElementById("eventsList");
  ul.innerHTML = "";
  const evs = [...state.events].sort((a,b)=>a.dateISO.localeCompare(b.dateISO));
  if (evs.length===0){
    ul.innerHTML = "<li class='small'>No user events. Click a date to add one.</li>";
    return;
  }
  for (const e of evs){
    const li = document.createElement("li");
    li.innerHTML = `<strong>${e.title}</strong><div class="small">${e.dateISO} • ${e.createdAt}</div>`;
    const del = document.createElement("button");
    del.textContent = "Remove";
    del.style.marginTop="6px";
    del.addEventListener("click", ()=>{ deleteEvent(e.id); renderCalendar(); renderEventsList();});
    li.appendChild(del);
    ul.appendChild(li);
  }
}
renderEventsList();

// ---------- Upcoming holidays rendering ----------
function renderUpcoming(){
  // compute upcoming relative to today's date
  const todayISO = formatISO(new Date());
  const arr = state.holidaysComputed
    .map(h=>({...h, dateISO: h.dateISO}))
    .sort((a,b)=>a.dateISO.localeCompare(b.dateISO));
  const upcoming = arr.filter(h=>h.dateISO >= todayISO).slice(0,6);
  const list = document.getElementById("upcomingList");
  list.innerHTML = "";
  if (upcoming.length === 0){
    list.innerHTML = "<li class='small'>No upcoming holidays this year.</li>";
    return;
  }
  for (const h of upcoming){
    const li = document.createElement("li");
    const d = new Date(h.dateISO + "T00:00:00Z");
    li.innerHTML = `<strong>${h.emoji} ${h.name}</strong><div class="small">${h.dateISO} • ${d.toDateString()}</div>`;
    li.addEventListener("click", ()=> openModal(`${h.name}`, buildHolidayModal(h), false));
    list.appendChild(li);
  }
}

function buildHolidayModal(h){
  const div = document.createElement("div");
  div.innerHTML = `<p><strong>${h.emoji} ${h.name}</strong></p><p class="small">${h.description || ""}</p>`;
  return div;
}

// ---------- Weather ----------
async function onSearch(){
  const q = document.getElementById("searchInput").value.trim();
  if (!q) return alert("Type a town or region name (e.g., Swakopmund, Walvis Bay, Keetmanshoop).");
  showRefreshingOverlay("Fetching weather...");
  await fetchWeatherByCity(q + ",NA"); // append country code to bias search to Namibia
  hideRefreshingOverlay();
}

async function fetchWeatherByCity(q){
  try {
    const url = `${WEATHER_API_BASE}?q=${encodeURIComponent(q)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("Weather fetch failed");
    const data = await r.json();
    renderWeatherData(data);
  } catch (err){
    console.error(err);
    alert("Failed to fetch weather. Check API key and network. See console for details.");
  }
}

async function fetchWeatherByCoords(lat, lon){
  try {
    const url = `${WEATHER_API_BASE}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("Weather fetch failed");
    const data = await r.json();
    renderWeatherData(data);
  } catch (err){
    console.error(err);
    alert("Failed to fetch weather by coordinates.");
  }
}

function renderWeatherData(data){
  const name = `${data.name}, ${data.sys && data.sys.country ? data.sys.country : 'NA'}`;
  document.getElementById("locName").textContent = name;
  document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById("feelsLike").textContent = `${Math.round(data.main.feels_like)}°C`;
  document.getElementById("wind").textContent = `${data.wind.speed} m/s`;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
  document.getElementById("condition").textContent = data.weather[0].description;
  document.getElementById("weatherEmoji").textContent = mapWeatherToEmoji(data.weather[0].id, data.weather[0].main);
}

// Map OpenWeather weather codes to emoji
function mapWeatherToEmoji(code, main){
  // code is numeric ID, see OpenWeatherMap codes
  if (code >= 200 && code < 300) return "⛈️";
  if (code >= 300 && code < 600) return "🌧️";
  if (code >= 600 && code < 700) return "❄️";
  if (code >= 700 && code < 800) return "🌫️";
  if (code === 800) return "☀️";
  if (code === 801) return "🌤️";
  if (code === 802) return "⛅";
  if (code === 803 || code === 804) return "☁️";
  // fallback
  if (/rain/i.test(main)) return "🌧️";
  return "🌡️";
}

// ---------- Geolocation ----------
function geoLocate(){
  if (!navigator.geolocation) return alert("Geolocation not supported in this browser.");
  showRefreshingOverlay("Detecting location...");
  navigator.geolocation.getCurrentPosition(async (pos)=>{
    const {latitude, longitude} = pos.coords;
    await fetchWeatherByCoords(latitude, longitude);
    hideRefreshingOverlay();
  }, (err)=>{
    hideRefreshingOverlay();
    alert("Location access denied or failed.");
  }, {timeout:10000});
}

// ---------- Time & Countdown ----------
function startClock(){
  function tick(){
    const now = new Date();
    const bits = now.toLocaleString([], {weekday:'short',year:'numeric',month:'short',day:'numeric'});
    const time = now.toLocaleTimeString();
    document.getElementById("liveDateTime").textContent = `${bits} • ${time}`;
    requestAnimationFrame(()=>setTimeout(tick, 1000));
  }
  tick();
}

function startCountdown(){
  function update(){
    const now = new Date();
    // target: next Friday 00:00 local time (if today is Friday but after 00:00, it's this Friday)
    let target = nextFridayAt(0,0,0);
    const diff = target - now;
    if (diff <= 0){
      document.getElementById("countdown").textContent = "It's Friday! 🎉";
    } else {
      const days = Math.floor(diff / (24*3600*1000));
      const hrs = Math.floor((diff % (24*3600*1000)) / (3600*1000));
      const mins = Math.floor((diff % (3600*1000)) / (60*1000));
      const secs = Math.floor((diff % (60*1000)) / 1000);
      document.getElementById("countdown").textContent = `${days}d ${hrs}h ${mins}m ${secs}s`;
    }
    setTimeout(update, 1000);
  }
  update();
}

function nextFridayAt(hour, minute, second){
  const now = new Date();
  const today = now.getDay(); // 0 Sun .. 5 Fri ..6 Sat
  const daysUntilFriday = (5 - today + 7) % 7;
  let target = new Date(now);
  target.setDate(now.getDate() + daysUntilFriday);
  target.setHours(hour, minute, second, 0);
  // if today is Friday and time has passed, go to next week
  if (daysUntilFriday === 0 && now >= target){
    target.setDate(target.getDate() + 7);
  }
  return target;
}

// ---------- Refresh UI ----------
function showRefreshingOverlay(msg="Refreshing..."){
  const over = document.getElementById("refreshOverlay");
  over.textContent = msg;
  over.classList.remove("hidden");
}
function hideRefreshingOverlay(){
  document.getElementById("refreshOverlay").classList.add("hidden");
}

async function refreshEverything(){
  showRefreshingOverlay("Refreshing all data...");
  // quick visual delay to show the overlay
  try {
    await loadHolidays();
    renderCalendar();
    renderUpcoming();
    renderEventsList();
    // refresh current weather by reusing existing location name
    const name = document.getElementById("locName").textContent || DEFAULT_CITY;
    await fetchWeatherByCity(name);
  } catch (e) {
    console.warn(e);
  }
  setTimeout(()=>hideRefreshingOverlay(), 800);
}

// ---------- Mode Toggle ----------
function toggleMode(){
  const body = document.body;
  if (body.classList.contains("dark")){
    body.classList.remove("dark");
    body.classList.add("light");
    document.getElementById("modeToggle").textContent = "🌙";
  } else {
    body.classList.remove("light");
    body.classList.add("dark");
    document.getElementById("modeToggle").textContent = "☀️";
  }
}

// ---------- Events & UI helpers ----------
function onDateToISO(dateLike){
  return formatISO(new Date(dateLike));

function openAddEventModalForDate(date){
  const iso = formatISO(date);
  modalState.meta = {iso};
  const title = `Add event • ${iso}`;
  
  const inputEl = document.createElement("input");
  inputEl.id = "modalEventTitle";
  inputEl.placeholder = "Event title";
  inputEl.style = "width:100%;padding:8px;margin-top:6px;border-radius:8px";
  
  inputEl.addEventListener("keypress", (e) => {
    if(e.key === "Enter") modalSave();
  });
  
  const container = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = "Event title";
  container.appendChild(label);
  container.appendChild(inputEl);
  
  openModal(title, container, true, {iso});
}

  openModal(title, body, true, {iso});
}



// load events list on start
renderEventsList();
