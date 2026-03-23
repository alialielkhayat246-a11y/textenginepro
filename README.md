# Text Engine Pro — Language Detection API

A Vercel serverless function that acts as a language detection API powered by **franc-min** (187 languages, no API key needed, completely free).

## How it works

`POST /api/detect` receives `{ "text": "your text here" }` and returns:

```json
{
  "code": "eng",
  "name": "English",
  "native": "English",
  "flag": "🇬🇧",
  "family": "Germanic",
  "script": "Latin"
}
```

## Deploy to Vercel (connected to GitHub)

1. Push this entire folder to your GitHub repo (merge with your existing project)
2. Vercel auto-detects the `api/` folder and deploys the function
3. Your HTML file already calls `/api/detect` — it will work immediately

## File structure

```
/
├── api/
│   └── detect.js       ← the serverless function
├── package.json        ← franc-min dependency
├── vercel.json         ← Vercel config
└── index.html          ← your main app (put it here)
```

## Local testing

```bash
npm install
npx vercel dev
```

Then test with:
```bash
curl -X POST http://localhost:3000/api/detect \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello this is some English text"}'
```

## Notes

- **franc-min** covers 187 languages and runs entirely in Node — no external API calls, no API key, no rate limits, completely free
- The function returns CORS headers so it works from any frontend origin
- If detection is uncertain, returns `{ "code": "und" }` and the frontend falls back to its built-in offline detector
