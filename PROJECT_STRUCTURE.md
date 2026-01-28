# Project Structure

This document outlines the complete project structure and what each component does.

## Directory Layout

```
looker-to-trmnl/
├── README.md                    # Main project overview
├── SETUP.md                     # Step-by-step setup guide
├── PLANNING.md                  # Original planning document
├── PROJECT_STRUCTURE.md         # This file
├── package.json                 # Node.js project configuration
├── .gitignore                   # Git ignore rules
│
├── local-service/               # Local Node.js service (Gmail → TRMNL)
│   ├── index.js                 # Entry point, Gmail + webhook logic
│   ├── lib/                     # Email processing, PDF parsing, webhook
│   ├── trmnl-plugin-template.html  # TRMNL Private Plugin markup template
│   └── README.md                # Local service setup
│
├── trmnl-plugin/                # TRMNL plugin template (legacy/reference)
│   ├── README.md                # Plugin setup instructions
│   └── plugin.html              # TRMNL plugin HTML/CSS/Liquid template
│
├── scripts/                     # Utility scripts and setup guides
│   ├── gmail-setup.md           # Gmail API setup guide
│   └── parse-csv.js             # CSV parsing utility (for testing)
│
└── docs/                        # Additional documentation
    └── looker-setup.md          # Looker scheduled email setup guide
```

## Component Descriptions

### Core Documentation

- **README.md**: Project overview, quick start, and links to detailed guides
- **SETUP.md**: Complete step-by-step setup guide for the entire pipeline
- **PLANNING.md**: Original planning document with architecture and design decisions

### TRMNL Plugin (`trmnl-plugin/`)

The TRMNL plugin receives webhook data and renders it on your e-ink display.

- **plugin.html**: Complete HTML/CSS/Liquid template for rendering Looker report data
  - Responsive design optimized for e-ink displays
  - Supports metrics, tables, and bar charts
  - Uses Liquid templating for dynamic content

### Local Service (`local-service/`)

The local service orchestrates the pipeline: it reads Gmail (via Gmail API), parses PDF attachments, formats data for the TRMNL Private Plugin webhook, and POSTs JSON to TRMNL.

- **index.js**: Entry point; Gmail search, rate limiting, webhook POST
- **lib/email-processor.js**: PDF parsing, table extraction, webhook payload formatting
- **trmnl-plugin-template.html**: TRMNL Framework markup (Grid layout) for the Private Plugin

### Scripts (`scripts/`)

Utility scripts and setup guides.

- **gmail-setup.md**: Detailed guide for setting up Gmail API access
- **parse-csv.js**: Standalone utility for testing CSV parsing and transformation

### Documentation (`docs/`)

Additional setup and configuration guides.

- **looker-setup.md**: Guide for configuring Looker scheduled email deliveries

## File Purposes

### Configuration Files

- **package.json**: Node.js project metadata and scripts
- **.gitignore**: Excludes credentials, node_modules, and other sensitive files

### Code Files

- **plugin.html**: TRMNL plugin template (copy into TRMNL editor)
- **local-service/**: Run `node index.js` (see local-service/README.md)
- **parse-csv.js**: Utility script for local testing

### Documentation Files

- All `.md` files contain setup instructions and guides

## Getting Started

1. **Read**: Start with `SETUP.md` for the complete setup process
2. **Configure**: Follow guides in order:
   - `scripts/gmail-setup.md`
   - `trmnl-plugin/README.md` (or use `local-service/trmnl-plugin-template.html`)
   - `local-service/README.md`
   - `docs/looker-setup.md`
3. **Deploy**: Copy plugin markup into TRMNL; run local service (or deploy GCP service)
4. **Test**: Verify each component works before moving to the next

## Customization Points

You can customize:

1. **TRMNL Plugin** (`trmnl-plugin/plugin.html`):
   - Layout and styling
   - Color scheme (remember: e-ink is monochrome)
   - Data visualization style

2. **Data Transformation** (`local-service/lib/email-processor.js` – `formatForTRMNLWebhook`):
   - Metric extraction logic, data formatting, report type detection

3. **Email Parsing** (`local-service/lib/email-processor.js` – `parseEmail`, `parsePDF`, `parsePDFTable`):
   - Attachment handling, PDF table extraction, error handling

## Testing

Use `scripts/parse-csv.js` to test CSV parsing locally:

```bash
node scripts/parse-csv.js sample-report.csv "My Report Title"
```

This will output the TRMNL-formatted JSON payload.

## Next Steps

After reviewing this structure:

1. Follow `SETUP.md` to deploy the pipeline
2. Customize components as needed
3. Test with sample Looker reports
4. Monitor and refine based on your specific needs
