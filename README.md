🇳🇦 NAMIBIA INFO WIDGET PROJECT
📘 OVERVIEW
The Namibia Info Widget is a functional and responsive web application designed to display local weather, Namibian public holidays, a real-time clock, and a markable calendar with notes.
It uses the OpenWeatherMap API to fetch live weather data for Namibian cities, includes a dark and light mode, and uses emojis to highlight weekends, holidays, and notes.
The project is ideal for schools, government offices, or personal use to provide at-a-glance access to Namibian weather and holiday information.

✨ KEY FEATURES
Feature	Description
🌤️ Live Weather Dashboard	Displays current weather for Windhoek (or any Namibian city). Shows temperature, humidity, wind speed, and sunrise/sunset times with matching weather emojis.
🕒 Real-Time Clock	Displays your computer’s local time, updated every second.
🗓️ Interactive Calendar	Shows the current month and allows navigation to previous or next months. Weekends are marked with 💃 and Namibian holidays with 🎉.
📝 Mark and Save Notes	Lets users click any calendar date to add or remove notes (saved automatically in the browser using LocalStorage).
🎚️ Dark / Light Mode	Switches smoothly between light and dark modes.
⏳ Weekend Countdown	Displays a live countdown to Friday at 17:00 (weekend time).
🇳🇦 Namibian Public Holidays	Includes all fixed and Easter-related Namibian holidays, with automatic handling of “observed” holidays when they fall on a Sunday.

🌦️ API DETAILS
Tool / API	Purpose
OpenWeatherMap API	Provides real-time weather data for Namibian cities.
JavaScript fetch() API	Retrieves weather data from OpenWeatherMap servers.
LocalStorage API	Saves personal notes locally in the browser.
JavaScript Date() Object	Handles dates, holidays, and the weekend countdown timer.

🔑 HOW TO GET YOUR API KEY
1.	Visit https://openweathermap.org/api
2.	Create a free account and log in.
3.	Go to your profile → “API Keys”.
4.	Copy your key.
5.	Open the script.js file and replace this line:
6.	const OWM_KEY = "YOUR_OPENWEATHERMAP_API_KEY";
with:
const OWM_KEY = "your_real_api_key_here";

🗓️ NAMIBIAN PUBLIC HOLIDAYS
Month	Date	Holiday
January	1	New Year’s Day
March	21	Independence Day
March / April	Variable	Good Friday (Easter – 2 days)
March / April	Variable	Easter Monday (Easter + 1 day)
May	1	Workers’ Day
May	4	Cassinga Day
May	25	Africa Day
May	28	Genocide Remembrance Day
June	Variable	Ascension Day (Easter + 39 days)
August	26	Heroes’ Day
December	10	Day of the Namibian Women / Human Rights Day
December	25	Christmas Day
December	26	Family Day
🗒️ Note:
If a holiday falls on a Sunday, the system automatically adds an observed holiday on Monday.
⚙️ SETUP INSTRUCTIONS
Step	Action
1️⃣	Download or clone the project files: index.html, style.css, and script.js.
2️⃣	Get your free API key from OpenWeatherMap.
3️⃣	Paste your API key inside script.js as shown above.
4️⃣	Open index.html in your web browser.
5️⃣	Explore the features: live weather, real-time clock, interactive calendar, and weekend countdown.
________________________________________
📁 FOLDER STRUCTURE
File / Folder	Description
index.html	The main webpage structure and layout.
style.css	All styling, color themes (blue/white + dark mode), and layout design.
script.js	The main JavaScript logic, weather API integration, and calendar functions.
README.md	Project documentation and setup instructions.
________________________________________
🧰 TECHNOLOGIES USED
Category	Tools / Technologies
Frontend	HTML5, CSS3, Vanilla JavaScript
Data API	OpenWeatherMap API
Local Data	Browser LocalStorage
Layout	CSS Grid, Flexbox
Time / Date Handling	JavaScript Date() object
Design	Blue & White theme with responsive layout
________________________________________
🎨 COLOR SCHEME AND EMOJIS
Element	Description	Emoji / Color
Theme Colors	Blue (#2b7cff) and White (#ffffff)	
Dark Mode	Deep Navy Backgrounds with Light Text	
Weekend Indicator	💃	
Holiday Indicator	🎉	
Note Indicator	📝	
Weather Emojis	☀️ / 🌧️ / ⛅ / ❄️ (based on real weather)	
________________________________________
💾 DATA STORAGE
Feature	Storage Method
User Notes	Saved locally in browser LocalStorage
Weather Data	Retrieved live from OpenWeatherMap API
Calendar Data	Generated dynamically with JavaScript
Settings (theme, etc.)	Saved per session using browser memory
🧠 Notes are automatically saved and remain after page refresh or reopening the browser.
________________________________________
🕒 REAL-TIME FUNCTIONALITIES
Function	Description
Live Clock	Updates every second using system time.
Live Weather Refresh	Refresh button manually fetches updated weather.
Weekend Countdown	Counts down to Friday 17:00.
Dynamic Calendar	Updates automatically when switching months.
________________________________________
🧾 EXAMPLE USE CASES
Use Case	Example
School Dashboard	Students view holidays and weather for planning activities.
Office Planner	Staff mark meetings and reminders on the calendar.
Tourist Information	Visitors can check public holidays and local weather in Namibia.
Personal Use	Track holidays, add daily notes, and monitor local time.
________________________________________
🧩 PROJECT METADATA
Item	Detail
Project Title	Namibia Info Widget
Developer Team	Team LMM
Country	Namibia 🇳🇦
Version	1.0
Languages Used	HTML, CSS, JavaScript
API Used	OpenWeatherMap
Theme	Blue & White, with optional Dark Mode
________________________________________
🔒 API POLICY NOTICE
⚠️ The OpenWeatherMap Free API key has usage limits (60 requests/minute).
Avoid excessive manual refreshing to prevent temporary blocking.
If the API key is missing or invalid, the system will automatically display fallback weather data for Windhoek.
________________________________________
🧑💻 AUTHOR AND TEAM
Role	Name / Description
Developed By	Team LMM
Country	Namibia 🇳🇦
Built With	❤️ HTML, CSS, JavaScript
Purpose	Educational and community information display
Version	1.0
________________________________________
🏁 LICENSE AND USAGE
This project is free for educational and non-commercial use.
You may modify, customize, or enhance it for school assignments, training projects, or community dashboards.
________________________________________
💡 FUTURE IMPROVEMENTS
Feature	Description
🌍 Location Detection	Add GPS to automatically detect user’s city.
📆 Calendar Sync	Sync with Google Calendar or Outlook.
📱 PWA Support	Make the site installable on mobile devices.
🌙 Animated Icons	Add moving weather icons for better visuals.
☁️ Forecast View	Show 3-day or 7-day weather forecast.
________________________________________
✅ SUMMARY
The Namibia Info Widget is a powerful and educational web-based tool that combines live weather data, public holiday tracking, and a personal calendar system — all within a blue and white Namibia-themed design.
It is:
•	100% browser-based (no installation needed)
•	Lightweight and responsive
•	Functional with or without an internet connection (for notes and holidays)
•	Easy to customize for schools, institutions, or individuals
________________________________________
Created by: Team MRT 🇳🇦
Project Title: Namibia Info Widget
Version: 1.0
Built with: HTML • CSS • JavaScript
________________________________________

