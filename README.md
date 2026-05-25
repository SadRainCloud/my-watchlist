# 🎬 CineNova / Serialfrenzy / Animemania – Watchlist Webapp

> Een interactieve Single Page Application (SPA) om films, series en anime te ontdekken, filteren en beheren in je eigen watchlist.

🔗 **Live Website:** [https://watchlistvault.netlify.app/](https://watchlistvault.netlify.app/)

---

## 📝 Beschrijving

Deze webapplicatie is gebouwd als een studentenproject en maakt live verbinding met **The Movie Database (TMDB) API**. Gebruikers kunnen door duizenden titels bladeren, geavanceerd zoeken, filteren en hun eigen lijsten bijhouden. Dankzij `localStorage` blijft je watchlist en je gekozen thema altijd bewaard, zelfs als je de pagina ververst!

De interface past zich dynamisch aan op basis van het gekozen content-type:
* **CineNova** – Specifieke stijl voor films 🍿
* **Serialfrenzy** – Specifieke stijl voor series 📺
* **Animemania** – Specifieke stijl voor anime 🌸

---

## 🚀 Tools & Technologieën

Het project is volledig gebouwd met moderne webtechnologieën, zonder zware frameworks (Vanilla JS):

* **HTML5** – Semantische structuur.
* **CSS3** – Layouts met Flexbox & CSS Grid, custom properties voor Light/Dark theming en media queries voor responsiviteit.
* **JavaScript (Vanilla ES6+)** – Schone, modulaire logica en asynchrone API-aanroepen (`fetch`).
* **Vite** – Snelle development server en geoptimaliseerde productie-bundler.
* **TMDB API** – Externe databron voor media-informatie, afbeeldingen en trailers.
* **localStorage** – Lokale browser-opslag voor je watchlist, favorieten en thema-instellingen.

---

## ⚡ Functionaliteiten

### 1. Dataverzameling & Weergave
* **Live API Koppeling:** Haalt minstens 20 resultaten per request op via TMDB.
* **Hero-slider:** Een dynamische slideshow bovenaan de pagina met de best beoordeelde (*Top Rated*) titels van het geselecteerde type.
* **Responsive Grid:** Media-kaarten tonen overzichtelijk de poster, titel, het jaar en de gemiddelde rating.
* **Detail Modal:** Klik op een kaart om een pop-up te openen met:
  * Grote poster-afbeelding.
  * Uitgebreide beschrijving (*overview*).
  * Directe link naar de YouTube-trailer.
  * Top cast (de eerste 5 hoofdacteurs).

### 2. Interactiviteit & Geavanceerd Filteren
* **Zoekfunctie:** Direct zoeken op titel via de TMDB search endpoints.
* **Type-chips:** Snel schakelen tussen *All*, *Movies*, *Series*, en *Anime*.
* **Dynamische Genres:** De dropdown vult zich automatisch met de officiële genres die live van TMDB komen.
* **Status- & Landenfilters:** Filteren op status (upcoming, releasing, completed) en regio (US, UK, BE, JP, KR, etc.).
* **Sorteren:** Sorteer resultaten op Populariteit, Rating, Releasedatum of simpelweg Alfabetisch.
* **Dynamische Paginatie:** Navigeer door pagina's met handige Vorige/Volgende-knoppen en een dynamische paginareeks (max. 5 nummers zichtbaar).

### 3. Personalisatie & Opslag
* **Persoonlijke Watchlist:** Voeg items toe en geef ze een status mee (*To watch*, *Watching*, *Finished*). Dit kan zowel vanuit de modal als in het watchlist-overzicht zelf.
* **Favorieten:** Markeer je absolute favorieten met een hartje (♥) en bekijk ze in een aparte tab.
* **Thema Wisselaar:** Schakel vloeiend tussen **Dark Mode** (standaard) en **Light Mode**. 

---

## 🌐 Gebruikte API Endpoints (TMDB)

| Endpoint | Doel in de App |
| :--- | :--- |
| `discover/movie` & `discover/tv` | Het genereren van het hoofdoverzicht (Discover). |
| `movie/top_rated` & `tv/top_rated`| Het vullen van de Hero-slider bovenaan. |
| `search/movie` & `search/tv` | Het live doorzoeken van titels via de zoekbalk. |
| `append_to_response=videos,credits` | Ophalen van specifieke trailers en cast-leden voor de modal. |

> **Documentatie:** [TMDB API Developer Docs](https://developer.themoviedb.org)

---

## 📚 Gebruikte Bronnen & Credits

Tijdens de ontwikkeling van deze applicatie is gebruikgemaakt van de volgende bronnen en documentatie:

* **[The Movie Database (TMDB)](https://developer.themoviedb.org)** – Officiële API-documentatie voor alle media-data, afbeeldingen en endpoints.
* **[MDN Web Docs](https://developer.mozilla.org/)** – Referentiemateriaal voor JavaScript (o.a. `fetch()`, `localStorage`, DOM API en complexe Array-methodes).
* **Stack Overflow / Dev.to** – Inspecteren van codevoorbeelden voor TMDB-requests en logica rondom watchlists.
* **AI-Assistentie (ChatGPT / Gemini)** – Gebruikt als digitale sparringpartner voor:
  * Het debuggen van JavaScript-fouten (zoals event handlers, modal-logica en de favorite toggles).
  * Het structureren van de Vite-setup en het opbouwen van de main.js.
  * Het schrijven en vertalen van deze documentatie (inclusief specifieke bugfixes rondom de *modal favorite button* en de *view-toggle* op basis van ons chatgesprek).

---

## 🏫 Opdrachtcontext

Dit project is ontwikkeld als een **Interactive Single Page Application** in het kader van het vak **Advanced Web / Dynamic Web**. 

Het doel van de opdracht was het bouwen van een nuttige, portfolio-waardige applicatie die live data consumeert. De focus lag hierbij op de volgende kerncompetenties:
1. **JavaScript-interactiviteit:** Volledige DOM-manipulatie zonder hulp van frameworks.
2. **Externe API Koppelingen:** Het asynchroon ophalen, filteren en correct verwerken van JSON-data.
3. **Personalisatie via `localStorage`:** Zorgen dat gebruikersdata persistent blijft binnen de browser.
4. **Gebruikerservaring (UX/UI):** Een modern, responsive en thematisch verzorgd design leveren.

---
