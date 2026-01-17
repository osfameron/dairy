# Templates

This directory contains Handlebars templates for converting OpenAPI PageContainer to Markdown.

## Template Files

- **index.hbs** - Main template entry point
- **block.hbs** - Router for different block types
- **section.hbs** - Renders section blocks with hierarchical headings
- **overview-meta.hbs** - Renders metadata (contact, license, terms)
- **overview-description.hbs** - Renders description blocks
- **overview-servers.hbs** - Renders server list
- **op-header.hbs** - Renders operation headers (method + path)
- **op-description.hbs** - Renders operation descriptions
- **op-parameters.hbs** - Renders parameter groups
- **op-requestBody.hbs** - Renders request body info
- **op-example.hbs** - Renders example blocks
- **op-responses.hbs** - Renders response codes and descriptions
- **op-security.hbs** - Renders security requirements

## Available Helpers

- `eq` - Equality comparison
- `includes` - Array includes check
- `lowercase` - Convert to lowercase
- `uppercase` - Convert to uppercase
- `json` - JSON stringify

## Usage

```bash
npx ts-node dairy.ts spec.json | npx ts-node churn.ts templates > output.md
```
