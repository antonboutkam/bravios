# Lokaal gebundelde Babylon.js en Havok

Babylon.js/core en loaders **9.36.0**, Havok **1.3.14**, esbuild **0.28.2**.
`BABYLON-LICENSE.txt` bevat de Apache-2.0-licentie; `HAVOK-LICENSE.txt` de MIT-licentie.
De runtime gebruikt geen CDN. Zowel de JavaScript-bundel als `HavokPhysics.wasm`
worden in de offline `speel.html` opgenomen.

Opnieuw bouwen vanuit de projectmap:

```sh
npm install --prefix /tmp/bravios-babylon --cache /tmp/bravios-npm-cache @babylonjs/core@9.36.0 @babylonjs/loaders@9.36.0 @babylonjs/havok@1.3.14 esbuild@0.28.2 --no-audit --no-fund
node scripts/build-3d-vendor.mjs /tmp/bravios-babylon
npm test
npm run build
```

`scripts/babylon-entry.mjs` selecteert de gebruikte engineonderdelen, GLB-loader,
physics en character controller. De enkele benoemde export past in de bestaande
offline-modulebouwer. De engine wordt pas actief geladen bij een 3D-veld.
Havok ontvangt expliciet de lokaal geladen WASM-bytes; ook bij `file://` vindt
geen externe download plaats. Controleer na herbouwen ook spelen, bouwen,
modelaanzichten, PNG-export en de offline versie in de browser.
