# Legacy: Pipedream Workflow (Unused)

**This folder is no longer used.** The pipeline was redesigned to use a **local service** (or GCP service) instead of Pipedream.

- **Current design**: Gmail API is used directly by the local service in `local-service/`, which parses PDF attachments and POSTs JSON to the TRMNL Private Plugin webhook.
- **This folder**: Kept for reference only. The files (`parse-email.js`, `transform-data.js`, `workflow-config.json`) were part of an earlier Pipedream-based design.

For setup, see:
- **Local service**: `local-service/README.md`, `SETUP_LOCAL.md`
- **GCP service**: `SETUP_GCP_SERVICE.md`, `gcp-service/README.md`
