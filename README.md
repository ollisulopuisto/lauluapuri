# 🎶 Lauluapuri

Lauluapuri on suomenkielisen lyriikan kirjoittamiseen tarkoitettu apuohjelma. Se analysoi tekstiä lennosta ja auttaa hahmottamaan laulun rytmiikkaa, tavutusta ja riimejä.

Sovellus toimii täysin selaimessa (client-side), eikä se lähetä kirjoittamaasi tekstiä palvelimelle.

## ✨ Ominaisuudet

- **Tavutus:** Jakaa suomen kielen sanat tavuihin automaattisesti.
- **Rytmianalyysi:**
  - `—` Pitkä tavu (päättyy konsonanttiin, sisältää pitkän vokaalin tai diftongin).
  - `◡` Lyhyt tavu (päättyy vokaaliin, sisältää yhden lyhyen vokaalin).
- **Painotus:**
  - `[—]` Punainen korostus: Pääpaino (sanan 1. tavu).
  - `(—)` Oranssi korostus: Sivupaino (yleensä joka 2. tavu pääpainon jälkeen).
- **Riimit:** Tunnistaa rivien loppusointuja ja merkitsee ne väreillä ja kirjaintunnisteilla (A, B, C...).
- **Tavulaskuri:** Näyttää jokaisen rivin tavumäärän reaaliajassa.

## 🚀 Käyttöönotto (Deployment)

Koska sovellus on "pure client-side", voit julkaista sen ilmaiseksi useilla tavoilla:

### Vaihtoehto A: GitHub Pages (Suositus)
1. Luo uusi repositorio GitHubiin.
2. Lisää koodi sinne:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/kayttaja/lauluapuri.git
   git push -u origin main
   ```
3. Mene GitHubissa: **Settings > Pages**.
4. Valitse **Build and deployment > Source: GitHub Actions**.
5. Valitse "Static Web App" tai käytä valmista Vite-actionia.

### Vaihtoehto B: Vercel tai Netlify
1. Yhdistä GitHub-repositoriosi Verceliin tai Netlifyyn.
2. Ne tunnistavat Viten automaattisesti.
3. Build-komento: `npm run build`
4. Output-hakemisto: `dist`

### Vaihtoehto C: Manuaalinen siirto omalle palvelimelle
1. Aja komento: `npm run build`
2. Kopioi `dist`-kansion sisältö palvelimesi julkiseen hakemistoon (esim. `public_html`).

## 🛠 Kehitys

Jos haluat muokata sovellusta paikallisesti:

1. Asenna riippuvuudet: `npm install`
2. Käynnistä kehityspalvelin: `npm run dev`
3. Aja testit (TDD): `npm test`

## 🧪 Testaus

Sovelluksen lingvistinen moottori on kehitetty Red/Green-testauksella. Testit kattavat:
- Suomen kielen tavutussäännöt (VC-CV, V-CV jne.).
- Tavun pituuden määrityksen.
- Painotuskuviot.
- Riimien tunnistuslogiikan.

## 📅 Versiointi

Tämä projekti käyttää automaattista kalenteripohjaista versiointia (CalVer). Jokainen commit nostaa versionumeroa muotoon `YYYY.MM.DD.PATCH`.

