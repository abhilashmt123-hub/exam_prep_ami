# LKG Talent Exam Practice App

A small, colourful, fully local practice app for an LKG talent exam. It uses Node.js, Express, plain HTML/CSS/JavaScript, and local JSON files only.

## Run it

1. Install [Node.js](https://nodejs.org/) if it is not already installed.
2. In this folder, run `npm install`.
3. Start the app with `npm start`.
4. Open [http://localhost:3000](http://localhost:3000).

No login, internet connection, or database is required after installing dependencies.

## Run with Docker

1. Build and start the container with `docker compose up --build -d`.
2. Open [http://localhost:3344](http://localhost:3344) on this computer, or `http://<computer-ip>:3344` from another device on the same network.
3. Stop the app with `docker compose down`. Practice results are stored in a named Docker volume and survive container restarts.

## Files you can edit

- `data/questions.json` is the question bank. A **Balanced Test** contains five questions from each of the eight learning areas (40 questions total). The **Body Parts** practice button includes all ten body-part questions.
- `data/results.json` is automatically updated after every completed attempt. It records the test id, score, total, and date/time.
- Put replacement images in `assets/questions/<test-id>/`, for example `assets/questions/test-1/q1-a.png`. Selected scanned visual-reference pages from the supplied book are stored in `assets/questions/book-pages/` and are used for related questions.

Each question has an `id`, `type`, `prompt`, 3–4 `options`, and a zero-based `correctIndex`. The question-bank generator assigns local SVG illustrations at `/assets/questions/options/` except for `letters`, `numbers`, `shapes-colours`, and `general-knowledge`, which intentionally use text-only options. The deterministic illustrations avoid external image-service dependencies and include the option label. If a generated image is missing, the app shows a sample-picture fallback.

To rebuild the question bank and its local option illustrations after editing the generator, run `node scripts/generate-question-bank.js`. The generator classifies the source questions, shuffles each group, selects five questions per group for balanced practice, includes the full Body Parts set, and assigns sequential group-specific IDs. Existing option illustrations are left in place when they are no longer referenced.
