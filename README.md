<!-- TITLE + BADGES -->
# 🌤 Weatherly – PWA Weather App (HTML + CSS + JS)

[![Netlify Status](https://api.netlify.com/api/v1/badges/xxxx/deploy-status)](https://app.netlify.com/sites/your-site/deploys)
![Badge](https://img.shields.io/badge/Category-HTML+CSS+JS-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)
![API](https://img.shields.io/badge/API-Open--Meteo-orange)

---

## 📌 Overview
> **Weatherly** is an offline-ready Progressive Web App that shows real-time weather data using the free **Open-Meteo API**. Search any city or use GPS to view current conditions, hourly forecasts, and a 7-day outlook — all in a clean, responsive UI.

---

## 📚 Table of Contents
- [Features](#-features)
- [Demo Links](#-demo-links)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Details](#-api-details)
- [PWA Support](#-pwa-support)
- [Accessibility](#-accessibility)
- [Performance Targets](#-performance-targets)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Credits](#-credits)

---

## ✨ Features
- 🌍 **City Search** with auto-suggestions  
- 📍 **Geolocation** support  
- 🌡 **Current, Hourly, and 7-Day Forecasts**  
- 🔄 **°C/°F Toggle** + Wind Speed Unit Toggle  
- 🌙 **Dark/Light Mode** with saved preference  
- 📶 **Offline Support** via Service Worker  
- ⚡ **Fast Load** with skeleton loaders  
- 🖥 **Responsive UI** (Mobile → Desktop)  

---

## 🔗 Demo Links
- **Netlify Live** → [View App](https://your-site.netlify.app)  
- **GitHub Repo** → [View Code](https://github.com/your-username/weather-app)  

---

## 🖼 Screenshots

![Home View](assets/images/screen-home.png)  
*Home with search & current weather*

![Hourly Forecast](assets/images/screen-hourly.png)  
*Scrollable hourly forecast*

---

## 💻 Tech Stack
| Layer        | Technology |
|--------------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **API**      | [Open-Meteo](https://open-meteo.com/) |
| **Hosting**  | Netlify |
| **Icons**    | SVG Weather Icons |
| **PWA**      | Service Worker, Web Manifest |

---

## 📁 Folder Structure
<details>
<summary>Click to view</summary>

```txt
weather-app/
├─ index.html
├─ manifest.webmanifest
├─ service-worker.js
├─ assets/
│  ├─ icons/
│  ├─ images/
│  └─ weather/
├─ src/
│  ├─ css/
│  ├─ js/
│  ├─ data/
│  ├─ i18n/
│  └─ pages/
├─ docs/
└─ tests/
</details>
⚙ Installation
bash
Copy
Edit
# Clone the repo
git clone https://github.com/your-username/weather-app.git

# Open folder
cd weather-app

# Open in browser
start index.html
🚀 Usage
Open the app in your browser.

Allow location access or search for a city.

Toggle units or theme from the header.

🌤 API Details
http
Copy
Edit
GET https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>
Params:

current=temperature_2m,...

hourly=temperature_2m,...

daily=temperature_2m_max,...

📲 PWA Support
✅ Offline Mode

✅ Add to Home Screen

✅ App Manifest

✅ Cached Assets & Data

♿ Accessibility
Semantic HTML

ARIA labels for controls

Color contrast compliance

Keyboard navigable

📊 Performance Targets
Lighthouse: 90+ on all metrics

First Contentful Paint: <1.5s

Total JS: <60KB gzipped

🗓 Roadmap
 Core UI & API Integration

 Unit & Theme Toggles

 PWA Offline Support

 Multi-language Support

 User Saved Locations

🤝 Contributing
Fork the repo

Create your branch (git checkout -b feature/xyz)

Commit changes (git commit -m 'Add feature xyz')

Push branch (git push origin feature/xyz)

Create a Pull Request

📜 License
This project is licensed under the MIT License — see the LICENSE file for details.

🙌 Credits
API: Open-Meteo

Icons: [Your Icon Source]

Hosting: Netlify

💡 Made with ❤️ for the Hackathon (72 hours build).

yaml
Copy
Edit

---

This **README** uses:  
✅ Headings (H1–H3)  
✅ Blockquotes (`>`)  
✅ Badges (shields.io)  
✅ Horizontal rules (`---`)  
✅ Bullet & numbered lists  
✅ Tables  
✅ Images  
✅ Links  
✅ Code blocks (fenced)  
✅ Collapsible `<details>` sections  
✅ Task lists (`[x]`)  

If you want, I can now **merge your hackathon judging criteria & 72-hour plan directly into this RE
