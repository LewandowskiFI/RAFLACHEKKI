# 🍲 RAFLACHEKKI – Jyväskylän Opiskelijaravintolat

**RAFLACHEKKI** on nopea, moderni ja tyylikäs verkkosovellus, joka kokoaa yhteen kaikkien Jyväskylän opiskelijaravintoloiden reaaliaikaiset ruokalistat, aukioloajat, kampussijainnit, Kelan opiskelijahinnat (3,10 €) sekä erikoisruokavaliot.

![RAFLACHEKKI Banner](https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Tärkeimmät Ominaisuudet

- 📅 **Päivän ruokalistat & Viikkonäkymä**: Näe tämän päivän ja koko kuluvan viikon lounaslistat yhdellä silmäyksellä.
- 🏛️ **Kaikki Kampukset**:
  - **Seminaarinmäki**: Lozzi, Belvedere, Syke, Tilia, Ravintola Taide & Kahvila Tiede (Lähde), Ravintola Ilokivi, Normaalikoulu
  - **Mattilanniemi**: Piato, Bistro Mattilanniemi
  - **Ylistönrinne & Ylistönmäki**: Ylistö, Kvarkki, Salvia
  - **Ruusupuisto & Kortepohja**: Uno, Rentukka
  - **JAMK & Lutakko**: Restaurant Twist (Jamk Pääkampus), Café Curve, Restaurant Cube (Dynamo), Fiilu
- 🌿 **Ruokavaliosuodattimet**: Suodata yhdellä klikkauksella vegaaniset (VEG), gluteenittomat (G), laktoosittomat (L), maidottomat (M), ilmastoystävälliset (ILMASTO) sekä Sydänmerkillä varustetut annokset.
- 🔍 **Reaaliaikainen Pikahaku**: Etsi tiettyä ruokaa (esim. *lohi*, *tofu*, *curry*, *pizza*, *keitto*) tai ravintolaa.
- 🟢 **Reaaliaikainen Aukiolotilanne**: Näe heti, mitkä ravintolat ovat auki, milloin lounasaika päättyy ja montako minuuttia on jäljellä.
- ❤️ **Suosikkiravintolat**: Tallenna omat lempiravintolasi suosikeiksi – ne nousevat aina listan kärkeen.
- 🎲 **Lounasarpa (Lunch Roulette)**: Etkö osaa päättää mitä söisit? Pyöräytä Lounasarpaa ja anna onnen valita päivän herkkulounas kampuksesi ja ruokavaliosi mukaan!
- 🗺️ **Kartan ja reittiohjeiden suoralinkit**: Suorat linkit Google Mapsiin sekä ravintoloiden omille verkkosivuille.
- 🌙 **Tumma ja Vaalea Teema**: Silmää miellyttävä Nordic Dark -tila ja raikas valoisa tila.

---

## 🛠️ Teknologiapino

- **Frontend**: React 18, Vite, Lucide Icons, Modern Vanilla CSS (CSS Custom Properties, Glassmorphism, Responsive Grid)
- **Backend**: Node.js, Express, Reaaliaikaiset API-rajapinnat ja jäsentäjät (Semma API, Compass Group API, Ilokivi Scraper, Juvenes & Jamix)
- **Välimuisti**: In-memory caching nopeuttamaan toistuvia kyselyitä

---

## 🚀 Käynnistys ja kehitys

### 1. Asenna riippuvuudet
```bash
npm install
```

### 2. Käynnistä kehityspalvelin (Frontend + Backend samanaikaisesti)
```bash
npm run dev
```
Sovellus avautuu osoitteessa: **http://localhost:5173**  
API-taustapalvelin kuuntelee portissa: **http://localhost:3001**

### 3. Tuotantoversion kääntäminen
```bash
npm run build
npm start
```

---

## 📡 API-rajapinnat

- `GET /api/info` – Järjestelmän tiedot, kampukset ja ruokavaliot
- `GET /api/restaurants` – Kaikkien Jyväskylän opiskelijaravintoloiden tiedot ja aukiolot
- `GET /api/menus?date=YYYY-MM-DD&campus=seminaarinmaki` – Päivän ruokalistat suodatettuna
- `GET /api/menus/:id?date=YYYY-MM-DD` – Yksittäisen ravintolan ruokalista
- `GET /api/roulette?campus=...&diet=...` – Lounasarvan satunnaisvalinta

---

## 📄 Lisenssi

MIT © RAFLACHEKKI Developers
