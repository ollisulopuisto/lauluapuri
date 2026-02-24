# 🎶 Lauluapuri

Lauluapuri on täysin itsenäinen suomenkielisen lyriikan kirjoittamiseen tarkoitettu apuohjelma. Se toimii yhtenä HTML-tiedostona ilman ulkoisia riippuvuuksia tai palvelimia.

## 🚀 Käyttö

Avaa vain `index.html` suoraan selaimessasi!

Voit myös kokeilla sitä suoraan verkossa:
[https://ollisulopuisto.github.io/lauluapuri/](https://ollisulopuisto.github.io/lauluapuri/)

## ✨ Ominaisuudet

- **Itsenäinen:** Ei tarvitse `npm`:ää, `node_modules`:ia tai serveriä.
- **Tavutus:** Automaattinen suomen kielen tavutus.
- **Rytmi:** Pitkät (`—`) ja lyhyet (`◡`) tavut sekä painotukset.
- **Riimit:** Tunnistaa loppusointuja.

## 📅 Versiointi

Tämä projekti käyttää automaattista CalVer-versiointia. Jokainen commit nostaa versionumeroa muotoon `YYYY.MM.DD.PATCH`.

Jos haluat muokata koodia ja säilyttää versioinnin:
1. Tee muutokset `index.html`-tiedostoon.
2. `git commit -m "Viesti"` -> Husky päivittää version.
3. `git push` -> GitHub Actions julkaisee uuden version.
