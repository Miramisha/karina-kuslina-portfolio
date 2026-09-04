# Karina Kuslina — Resume Website

A personal portfolio focused on fullstack development, professional projects, and carefully designed motion.

## Architecture

Plain HTML, CSS and JavaScript; no framework, database or runtime dependencies. The approved site source lives in `design/prototype/`.

Build the public output with `python3 scripts/build.py`. The script validates local resources and section links and copies only the production files to `dist/`. Design comparisons and planning documents stay out of the deployment.

## Status

- Visual design and motion approved by the owner.
- Responsive checks completed at 320px and 1440px.
- Static output deployed publicly to Cloudflare Pages using Direct Upload.
- Public URL: https://karina-kuslina.pages.dev . An optional custom domain remains a separate stage.

See `docs/launch-readiness.ru.md` for checks and update instructions.

## Workflow

Each stage requires the owner's approval. Completed stages are committed with English messages without AI attribution. GitHub remains the source history; publishing an updated build to Cloudflare Pages is a separate operation.
