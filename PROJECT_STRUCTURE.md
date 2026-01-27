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
├── trmnl-plugin/                # TRMNL plugin code
│   ├── README.md                # Plugin setup instructions
│   └── plugin.html              # TRMNL plugin HTML/CSS/Liquid template
│
├── pipedream-workflow/          # Pipedream workflow code
│   ├── README.md                # Workflow setup instructions
│   ├── parse-email.js           # Email parsing step code
│   ├── transform-data.js        # Data transformation step code
│   └── workflow-config.json     # Workflow configuration reference
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

### Pipedream Workflow (`pipedream-workflow/`)

The Pipedream workflow orchestrates the entire pipeline.

- **parse-email.js**: Extracts email content and CSV attachments from Gmail
- **transform-data.js**: Transforms parsed data into TRMNL-compatible format
- **workflow-config.json**: Reference configuration for the workflow steps

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
- **parse-email.js**: Pipedream code step (copy into Pipedream workflow)
- **transform-data.js**: Pipedream code step (copy into Pipedream workflow)
- **parse-csv.js**: Utility script for local testing

### Documentation Files

- All `.md` files contain setup instructions and guides

## Getting Started

1. **Read**: Start with `SETUP.md` for the complete setup process
2. **Configure**: Follow guides in order:
   - `scripts/gmail-setup.md`
   - `trmnl-plugin/README.md`
   - `pipedream-workflow/README.md`
   - `docs/looker-setup.md`
3. **Deploy**: Copy code into respective platforms (TRMNL, Pipedream)
4. **Test**: Verify each component works before moving to the next

## Customization Points

You can customize:

1. **TRMNL Plugin** (`trmnl-plugin/plugin.html`):
   - Layout and styling
   - Color scheme (remember: e-ink is monochrome)
   - Data visualization style

2. **Data Transformation** (`pipedream-workflow/transform-data.js`):
   - Metric extraction logic
   - Data formatting
   - Report type detection

3. **Email Parsing** (`pipedream-workflow/parse-email.js`):
   - Attachment handling
   - Email body parsing
   - Error handling

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
