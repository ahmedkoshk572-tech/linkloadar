# Vercel deployment check

`https://linkloadar.vercel.app` currently renders the LinkLoad bilingual downloader interface with the expected branding, URL input, supported platform list, language toggle, theme toggle, and real-preview flow copy.

Requesting `https://linkloadar.vercel.app/downloader/health` currently returns the SPA HTML rather than the JSON health response. This confirms that the current Vercel deployment is serving the Vite frontend/catch-all rewrite, while the Express/yt-dlp backend is not exposed through the same Vercel deployment. The repository README already documents that the downloader engine needs a separate operational Node/Docker host.
