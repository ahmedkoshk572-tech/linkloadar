# Hosting options for LinkLoad

## Recommendation
Render is the better fit for the current project because the repository already contains a Dockerfile and the downloader requires OS-level packages such as Python, yt-dlp, and ffmpeg. Render's Docker services build from the repository Dockerfile and support environment variables, health checks, and persistent disks.

## Vercel
Vercel can deploy Express as a single Vercel Function and serves static assets through its `public/` directory; `express.static()` is not used for static serving in that deployment model. Vercel Functions also have maximum duration and bundle-size limits, which makes long video extraction and binary downloads less predictable for this workload.

## Render
Render supports Docker services built from a Dockerfile in the repository. A Render web service must bind to `0.0.0.0` and should use the `PORT` environment variable; Render's documented default is port 10000. Render supports automatic deploys from a linked Git provider and exposes a public `onrender.com` subdomain.

## Sources
- https://vercel.com/docs/frameworks/backend/express
- https://vercel.com/docs/functions/configuring-functions/duration
- https://render.com/docs/docker
- https://render.com/docs/web-services
