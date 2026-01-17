#!/usr/bin/env -S npx ts-node

import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import type { PageContainer } from './src/index.js';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: churn <templates-directory>');
  console.error('  Reads PageContainer JSON from stdin');
  process.exit(1);
}

const templatesDir = args[0];

if (!fs.existsSync(templatesDir)) {
  console.error(`Error: Templates directory not found: ${templatesDir}`);
  process.exit(1);
}

// Register helpers
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('includes', (array, value) => Array.isArray(array) && array.includes(value));
Handlebars.registerHelper('lowercase', (str) => String(str).toLowerCase());
Handlebars.registerHelper('uppercase', (str) => String(str).toUpperCase());
Handlebars.registerHelper('json', (obj) => JSON.stringify(obj, null, 2));

// Read all .hbs files from the templates directory
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.hbs'));

// Register partials (all .hbs files except index.hbs)
for (const file of files) {
  if (file !== 'index.hbs') {
    const partialName = path.basename(file, '.hbs');
    const partialContent = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
    Handlebars.registerPartial(partialName, partialContent);
  }
}

// Load the main template
const indexPath = path.join(templatesDir, 'index.hbs');
if (!fs.existsSync(indexPath)) {
  console.error(`Error: index.hbs not found in ${templatesDir}`);
  process.exit(1);
}

const templateContent = fs.readFileSync(indexPath, 'utf-8');
const template = Handlebars.compile(templateContent);

// Read PageContainer from stdin
let input = '';

process.stdin.setEncoding('utf-8');

process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const pageContainer: PageContainer = JSON.parse(input);
    const output = template(pageContainer);
    console.log(output);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
});
