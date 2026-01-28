# TRMNL Plugin

This plugin receives webhook data from the local service (or GCP service) and renders Looker report data on your TRMNL e-ink display.

## Features

- Webhook endpoint for receiving report data
- Responsive HTML/CSS layout optimized for e-ink displays
- Liquid templating for dynamic content
- Support for multiple report formats (CSV, metrics, visualizations)

## Setup

1. Log into your TRMNL account
2. Create a new private plugin
3. Copy the contents of `plugin.html` into the plugin editor
4. Save and note your plugin's webhook URL
5. Use this webhook URL in your local service (or GCP service) configuration (e.g. `TRMNL_WEBHOOK_URL` in `.env`)

## Webhook Format

The plugin expects JSON data in the following format:

```json
{
  "report_title": "Daily Sales Report",
  "timestamp": "2024-01-15T10:00:00Z",
  "metrics": [
    {"label": "Total Sales", "value": "$125,000", "change": "+5.2%"},
    {"label": "Orders", "value": "1,250", "change": "+3.1%"}
  ],
  "data": [
    {"category": "Product A", "value": 50000},
    {"category": "Product B", "value": 75000}
  ]
}
```

## Customization

Edit `plugin.html` to customize:
- Layout and styling
- Metric display format
- Color scheme (remember: e-ink is monochrome)
- Data visualization style
