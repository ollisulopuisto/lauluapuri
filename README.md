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

Tämä projekti käyttää automaattista CalVer-versiointia. Jokainen commit nostaa versionumeroa muotoon `YYYY.MM.DD.PATCH`. Vaikka itse sovellus toimii ilman riippuvuuksia, automaattinen versiointi kehitysympäristössä vaatii Node.js:n.

Jos haluat muokata koodia ja säilyttää versioinnin:
1. Asenna riippuvuudet komennolla `npm install` (tämä asentaa Huskyn, joka hoitaa versioinnin).
2. Tee muutokset `index.html`-tiedostoon.
3. `git commit -m "Viesti"` -> Husky päivittää version automaattisesti ennen committia.
4. `git push` -> GitHub Actions julkaisee uuden version.
