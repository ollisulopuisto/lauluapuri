# 🎶 Lauluapuri

Lauluapuri on täysin itsenäinen suomenkielisen lyriikan kirjoittamiseen tarkoitettu apuohjelma. Se toimii yhtenä HTML-tiedostona ilman ulkoisia riippuvuuksia tai palvelimia.

## 🚀 Käyttö

Avaa vain `index.html` suoraan selaimessasi!

Voit myös kokeilla sitä suoraan verkossa:
[https://ollisulopuisto.github.io/lauluapuri/](https://ollisulopuisto.github.io/lauluapuri/)

## ✨ Ominaisuudet

- **Itsenäinen:** Itse ohjelman *käyttö* ei tarvitse `npm`:ää, `node_modules`:ia tai serveriä. Vain yksi `index.html`-tiedosto riittää.
- **Tavutus:** Automaattinen suomen kielen tavutus.
- **Rytmi:** Pitkät (`—`) ja lyhyet (`◡`) tavut sekä painotukset.
- **Riimit:** Tunnistaa loppusointuja.

## 📅 Versiointi ja kehitys

Tämä projekti käyttää automaattista CalVer-versiointia. Jokainen commit nostaa versionumeroa muotoon `YYYY.MM.DD.PATCH`. Vaikka itse sovellus toimii ilman riippuvuuksia, automaattinen versiointi kehitysympäristössä vaatii Node.js >= 18:n.

Jos haluat muokata koodia ja säilyttää versioinnin:
1. Asenna riippuvuudet komennolla npm install ja varmista, että Husky-koukut on alustettu (esim. npx husky init).
2. Tee muutokset `index.html`-tiedostoon.
3. git commit -m "Viesti" -> Husky päivittää version (huomaa, että muutokset on lisättävä committiin, jotta versio päivittyy arkistoon).
4. `git push` -> GitHub Actions julkaisee uuden version.

## Riimihaku

Napauta sanaa tekstissä ja paina **Riimit** (tai Ctrl/Cmd+J). Ponnahdus ehdottaa täysiä riimejä, vokaalisointua tai alkusointua; napautus korvaa sanan. Haku käynnistyy vain pyynnöstä.

Sanalista `sanalista.txt` on Kotimaisten kielten tutkimuskeskuksen Nykysuomen sanalista (versio 1, 2006, LGPL), suodatettuna perusmuotoisiin pieniin sanoihin (91 531 sanaa). Se ladataan vasta ensimmäisellä haulla.

### Tavuvalinta näppäimistöllä

Muokkaa-tilassa Shift+vasen valitsee sanan viimeisen tavun ja kasvattaa riimiosaa
seuraavilla painalluksilla tavu kerrallaan. Shift+oikea kutistaa valintaa; viimeinen
askel palauttaa kursorin sanan loppuun. Koko sanan jälkeen Shift+vasen jatkaa
normaalia tekstivalintaa sanan ulkopuolelle. Muut muunnosnäppäimet, pystynuolet ja
Kirjoita-tila säilyttävät selaimen tekstivalinnan. Hiiren ja kosketuksen toiminta ei muutu.

Kehitystestit: `npm ci && npm test`. Oikean selaimen näppäimistötesti:
`npx playwright install chromium && npm run test:keyboard`.
Olemassa olevaa Chromea voi käyttää asettamalla ympäristömuuttujan `CHROME_PATH`.
