# Joshua DOS Web

Small web player for the DOS version of Joshua and the Battle of Jericho,
intended to be served at `https://enochscalendar.com/jericho`.

## Bundle the DOS game

The browser player uses a js-dos archive generated from the local `JOSHUA`
directory:

```bash
npm run bundle:game
```

That creates `public/games/joshua.jsdos`, which is ignored by Git because it
contains the game files.

## Develop locally

```bash
npm install
npm run bundle:game
npm run dev
```

Open the Vite URL ending in `/jericho/`.

## Build

```bash
npm run build
```

## Deploy

Deploy to the Nginx location mounted at `/jericho/`:

```bash
DEPLOY_TARGET="ubuntu@server:/var/www/jericho/joshua-dos-web/dist/" npm run deploy
```

If you need a specific SSH key:

```bash
DEPLOY_TARGET="ubuntu@server:/var/www/jericho/joshua-dos-web/dist/" \
SSH_KEY="~/.ssh/id_ubuntu" \
npm run deploy
```

Dry run:

```bash
DEPLOY_TARGET="ubuntu@server:/var/www/jericho/joshua-dos-web/dist/" npm run deploy:dry-run
```

Remote pull/build deploy:

```bash
DEPLOY_HOST="deploy@server" \
REMOTE_REPO_DIR="/var/www/jericho" \
REMOTE_WEB_DIR="/var/www/jericho/joshua-dos-web/dist" \
SSH_KEY="~/.ssh/id_ubuntu" \
npm run deploy:remote
```
