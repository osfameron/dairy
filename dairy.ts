#!/usr/bin/env -S npx ts-node

import fs from 'fs';
import { parsePageContainer } from './src/index.ts';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: dairy <openapi-spec-file.json>');
  process.exit(1);
}

const specFile = args[0];

try {
  const data = JSON.parse(fs.readFileSync(specFile, 'utf-8'));
  const pageContainer = parsePageContainer(data);
  console.log(JSON.stringify(pageContainer, null, 2));
} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
