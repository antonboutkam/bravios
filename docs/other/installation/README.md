# Technical setup and commands

[Documentation overview](../../README.md) · [Student installation guide in Dutch](../../student/installatie/README.md)

Run commands from the project root. For serving the game, Python 3, PHP 8.1+ or Node.js 18+ is sufficient. Development commands require Node.js. No extra packages or database are needed.

For deployment to `bravios.devroc.nl` through the shared deployment runner, see [Deploying to devroc.nl](devroc.md).

## Standalone servers

On Windows, double-click `start-server.bat` to detect PHP 8.1+, Python 3 or Node.js 18+ (in that order). Alternatively, choose one command:

```sh
python3 server/server.py
php server/server.php
node server/server.js
```

Use `python` or `py -3` on Windows if appropriate. Each starter resolves `public_html` relative to its own location and uses port 8080, or the `PORT` environment variable. The servers listen on all interfaces, including the local network. Only PHP executes `engine/room.php` for network play. Python returns an explanatory error for PHP requests. The PHP starter also sets the MIME type for `.mjs` files.

Python and PHP serve the existing game files without Node.js. After changing character or enemy configuration, use Node.js to run `npm run characters:prepare` and `npm run enemies:prepare` if the generated offline catalogs need updating. The JavaScript starter runs these checks automatically.

## Development server

```sh
npm start
```

Open **http://localhost:8080** and stop the server with Ctrl+C. The server in `public_html/engine/server.mjs` serves a limited file list plus discovered modules. Not every test page is reachable through it. Restart the server after adding module imports.

In Bash, choose another port with:

```sh
PORT=8090 npm start
```

In PowerShell, use:

```powershell
$env:PORT = '8090'
npm start
```

Then open **http://localhost:8090**. A different address or port uses a different browser storage origin.

## Network play with PHP

Rooms require PHP 8.1 or newer. Check the installation with `php --version`. Stop the Node server first if it occupies port 8080.

```sh
npm run start:network
```

Open **http://localhost:8080**. This command starts the built-in PHP server with `public_html` as its document root. On a second device, use the server computer's local IP address and port 8080; both devices must be able to reach the server. Check the local network and firewall if necessary. The Node server does not execute `engine/room.php`.

## Offline build

```sh
npm run build
```

This generates `public_html/speel.html`, including scripts, styles and images. Open the file directly in your browser for offline solo play. The generated file is not tracked in Git. Edit source files, then rebuild. Online rooms still require a PHP server.

## Tests

For example, run a focused check with:

```sh
node public_html/engine/tests/input-response.test.mjs
```

Run the complete suite with:

```sh
npm test
```

The complete suite uses both Node.js and PHP. Tests are listed explicitly in `package.json`. Check visual and control changes in the browser as well; an automated test does not show what a change looks like. Test a modified offline build separately.

## Character discovery

The npm start, network start, build and test commands first run `scripts/prepare-characters.mjs` through their `pre` lifecycle hooks. It discovers character directories, validates `character.json` and required images, and regenerates `public_html/engine/characters/catalog.mjs` when needed. Run `npm run characters:prepare` separately to validate configurations without starting a server. Direct `node public_html/engine/server.mjs`, `node public_html/engine/build.mjs` or PHP commands bypass these npm hooks; prepare the catalog first when using them. Restart and reload after adding a character or editing its JSON. Offline files must be rebuilt.
