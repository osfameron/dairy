#!/usr/bin/env -S npx ts-node

import fs from 'fs';
import Oas from 'oas';
import yaml from 'js-yaml'
import type {InfoBlock, LicenseObject, ContactObject} from 'ir/types.ts';
import type { OASDocument } from 'oas/types';
import path from 'path';
import type { Operation } from 'oas/operation';

const args = process.argv.slice(2);

const specFile = args[0];
if (!specFile) {
  console.error('Usage: foo <openapi-spec-file.json>.');
  process.exit(1);
}

try {
  const data = yaml.load(
    fs.readFileSync(specFile, 'utf8')) as OASDocument
  const spec = new Oas(data)
  await spec.dereference()
  spec.getCircularReferences()

  type DairyContext = {spec: Oas, depth: number  }
  const context : DairyContext = {
    spec,
    depth: 0
  }

  const processors = [
    processInfo,
    taggedOperations
  ]
  const blocks = processors.flatMap(p => p(context))


  console.dir(blocks, {depth: 7} );


} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

function processInfo(context: DairyContext): InfoBlock {
  const { spec } = context;
  return {
    blocktype: "overview.info",
    ...spec.api.info,
    openapi: spec.getVersion(),
    servers: spec.api.servers!
  }
}

function sectionBlock(context: DairyContext, title: string, makeChildren: (context: DairyContext) => Array<any>) {
  return {
    type: "section",
    title,
    level: context.depth,
    children: makeChildren({...context, depth: context.depth + 1})
  }
}

function taggedOperations(context: DairyContext) {
  const { spec } = context;

  const tags = spec.api.tags!
  const categorized = {} as Record<string, Operation[]>;
  for (const endpoints of Object.values(spec.getPaths()))
  {
    for (const operation of Object.values(endpoints)) {
      for (const tag of operation.schema.tags || []) {
        categorized[tag] ||= []
        categorized[tag].push(operation)
      }
    }
  }
  // return categorized
  return tags.flatMap(({name,description}) => {
      const operations = categorized[name]
      if (!operations) return []

      return [
        tagBlock(context, name, description, operations) 
      ]

    })
  
}

function tagBlock(context: DairyContext, name: string, description: string = "", operations : Operation[] = []) {
  return sectionBlock(
    context,
    name,
    (context) => [
      textBlock(context, "overview.description", description),
      operations.map(op => operationBlock(context, op))
    ]
  )
}

function textBlock(context: DairyContext, type: string, body: string) {
  return {
    type,
    body
  }
}

function operationBlock(context: DairyContext, op: Operation) {
  return sectionBlock(
    context,
    op.schema.summary || op.schema.operationId || `${op.method.toUpperCase()} ${op.path}`,
    (context) => [
      opHeaderBlock(context, op),
      textBlock(context, "op.description", op.schema.description || "")
    ]
  )
}

function opHeaderBlock(context: DairyContext, op: Operation) {
  return {
    title: op.schema.summary || op.schema.operationId || `${op.method.toUpperCase()} ${op.path}`,
    type: "op.header",
    method: op.method.toUpperCase(),
    path: op.path,
    operationId: op.schema.operationId || ''
  }
}
