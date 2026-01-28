# Looker to TRMNL Data Pipeline

Automated pipeline to deliver Looker (or Looker Studio) reports to TRMNL e-ink displays. Reports are sent by email; a local or cloud service reads them via the Gmail API, parses the content, and pushes data or images to TRMNL.

## What This Repo Does

1. **Looker** sends scheduled report emails (e.g. PDF or CSV) to a Gmail address.
2. **Gmail API** is used to read those emails and attachments.
3. **Local service** (or optional GCP service) parses reports and formats data for TRMNL.
4. **TRMNL** receives the payload via a Private Plugin webhook or Image API and shows it on your e-ink display.

No Pipedream or other third-party workflow service is required.

## Project Structure

```
.
├── local-service/         # Node.js service: Gmail → parse → TRMNL
├── trmnl-plugin/          # TRMNL Private Plugin HTML/Liquid template
├── scripts/               # Setup and utility scripts
├── docs/                  # Documentation
├── pipedream-workflow/    # Legacy (unused); kept for reference
└── gcp-service/           # Optional: same pipeline deployed to Cloud Run
```

## Prerequisites

- **TRMNL account** – [trmnl.co](https://trmnl.co) with a device and a Private Plugin (webhook) or Image webhook
- **Gmail / Google account** – For OAuth2 or a service account so the service can read report emails
- **Looker or Looker Studio** – Access to schedule email deliveries for the report you want to display

## Quick Start

1. **Gmail API** – Create a Google Cloud project, enable Gmail API, and create OAuth2 or service account credentials.  
   → [scripts/gmail-setup.md](scripts/gmail-setup.md)

2. **TRMNL** – Create a Private Plugin (or get an Image webhook URL), copy the webhook URL, and paste in the plugin markup from `local-service/trmnl-plugin-template.html` or `trmnl-plugin/plugin.html`.  
   → [trmnl-plugin/README.md](trmnl-plugin/README.md)

3. **Local service** – Install dependencies in `local-service/`, copy `.env.example` to `.env`, and set Gmail credentials path, Gmail query, and TRMNL webhook URL. Run `node index.js` to test.  
   → [SETUP_LOCAL.md](SETUP_LOCAL.md)

4. **Scheduling** – Run the service on a schedule (e.g. cron or launchd) so it checks Gmail regularly.

5. **Looker** – Schedule your report to email the same Gmail address the service reads from.  
   → [docs/looker-setup.md](docs/looker-setup.md)

## Architecture

```
Looker (scheduled email) → Gmail → Local service (or GCP) → TRMNL webhook / Image API → E-ink display
```

- **Local service**: Runs on your own machine (e.g. a Mac, Linux box, or always-on PC). Free; you manage the schedule.
- **GCP service**: Optional; deploy the same logic to Cloud Run and trigger it on a schedule. See [SETUP_GCP_SERVICE.md](SETUP_GCP_SERVICE.md) and [ARCHITECTURE_OPTIONS.md](ARCHITECTURE_OPTIONS.md).

## Documentation

| Doc | Description |
|-----|-------------|
| [SETUP.md](SETUP.md) | End-to-end setup (Gmail, TRMNL, local or GCP, Looker) |
| [SETUP_LOCAL.md](SETUP_LOCAL.md) | Local service setup and scheduling |
| [SETUP_GCP_SERVICE.md](SETUP_GCP_SERVICE.md) | Deploy to Google Cloud Run |
| [scripts/gmail-setup.md](scripts/gmail-setup.md) | Gmail API and OAuth2 / service account |
| [docs/looker-setup.md](docs/looker-setup.md) | Looker / Looker Studio scheduled email |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Pipeline overview |
| [ARCHITECTURE_OPTIONS.md](ARCHITECTURE_OPTIONS.md) | Local vs GCP |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Repo layout and components |

## Security

Email processing uses your own Gmail API credentials. The service runs on your machine or your GCP project; no third-party vendor reads your email. Keep credentials in `.env` (or your deployment config) and do not commit them.

## License

See repository license file if present.
