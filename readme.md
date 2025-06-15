# Max Drive

### Back-end setup

Install nodemod Globally and install dependency

```bash
npm i -g nodemon
npm i
```

Rename `env-example` -> `.env` and update the credentials

Start the Backend

```bash
nodemon server.mjs
```

### Frontend setup

In go to Frontend directory `cd frontend` and install frontend dependency

```bash
npm i
```

Rename `env-example` -> `.env` and update the credentials

Start the Frontend

```bash
npm run dev
```

TODO:

[] Have one package.json & .end for both front-end & backend https://stackoverflow.com/questions/71520446/can-the-frontend-and-backend-share-the-same-package-json
[] Change folder structure `backend` & `frontend` folder which should contain `backend` & `frontend` source and in main root have `package.json` and `.env`

```
├ .env
├ package.json
├ frontend/         - frontend project
│    ├ src/         - source files
│    └ public/
├ backend/          - backend project
│    ├ controllers/ - endpoint modules
│    └ lib/         - backend models/modules
└ lib/              - shared modules
```
