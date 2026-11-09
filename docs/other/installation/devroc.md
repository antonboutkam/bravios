# Deploying to devroc.nl

[Technical setup](README.md) · [Project README](../../../README.md)

Bravios uses the existing `roc-deploy` release and webhook workflow. Its project name is `bravios`, and the intended address is **https://bravios.devroc.nl**.

## Deployment configuration

The configuration lives in the sibling `roc-deploy` repository:

- `src/Environment/BraviosEnvironment.php` selects `git@github.com:antonboutkam/bravios.git`, branch `main`, and `/var/www/dynamic/bravios.devroc.nl`.
- `src/EnvironmentLoader.php` registers the `bravios` project for manual deployments and webhook scans.
- `public_html/bravios.php` receives signed GitHub webhooks through the existing receiver.

Each deployment clones the repository and runs `npm run build` before switching `current`. The npm prebuild hook validates and prepares the asset catalogs; the build generates `public_html/speel.html` for offline play. No npm dependencies, database or persistent Node.js process are needed. PHP serves network play through `engine/room.php`.

## First server setup

1. Install the updated `roc-deploy` files on the deployment server. Push the Bravios changes to `main` before deploying; local changes are not included in a server clone.
2. Make Node.js 18+ and npm available in the deployment user's command path. PHP 8.1+ must be enabled for the website; `roc-deploy` also uses its existing PHP CLI and PHP-FPM restart configuration.
3. Give the deployment user ownership of `/var/www/dynamic/bravios.devroc.nl` and permission to create `releases`, `shared` and the `current` symlink there. No shared files or directories need to be supplied for Bravios.
4. Provision `/home/deployer/.ssh/id_bravios` as a read-only GitHub deploy key for `antonboutkam/bravios`. The deploy user must be able to read the private key and have GitHub's verified host key in `/home/deployer/.ssh/known_hosts`.
5. Point the DNS record for `bravios.devroc.nl` at the devroc server, configure HTTPS, and configure the virtual host with these settings:

   | Setting | Value |
   | --- | --- |
   | Document root | `/var/www/dynamic/bravios.devroc.nl/current/public_html` |
   | Index | `index.html` |
   | JavaScript MIME type | Serve `.mjs` as `text/javascript` or `application/javascript` |
   | PHP | Execute `engine/room.php` through PHP-FPM |
   | Room storage | Allow the PHP worker to write to its system temporary directory |

6. From the installed `roc-deploy` repository, deploy the first release:

   ```sh
   php console/application.php deploy:projects:list
   php console/application.php deploy:project bravios deploy
   ```

7. Open the website, start a level, download/open `speel.html`, and create and join a room from two browsers to verify PHP network play.

## Automatic deployments

Configure `GITHUB_WEBHOOK_SECRET` in the deployment website's PHP-FPM environment with a random secret, then configure a GitHub webhook on `antonboutkam/bravios`:

| Setting | Value |
| --- | --- |
| Payload URL | `https://deploy.devroc.nl/bravios.php` |
| Content type | `application/json` |
| Secret | The same value as `GITHUB_WEBHOOK_SECRET` |
| Events | Push events |

The endpoint requires a valid SHA-256 GitHub signature. It returns HTTP 500 if the server secret is missing and HTTP 403 for an invalid signature. Keep the secret in the server configuration.

The existing `console/deploy-watcher.sh` processes the saved payload and selects `bravios` from `repository.name`. The environment always deploys `main`, matching the other projects; a push event from another branch also requests a fresh deployment of `main`.

## Manual deployment and rollback

Run these commands from the installed `roc-deploy` repository:

```sh
php console/application.php deploy:project bravios deploy
php console/application.php deploy:project bravios rollback
```

The environment keeps five releases. Levels and settings saved in the browser remain tied to that browser and website address. Network rooms use temporary PHP files and must be recreated after switching releases.
