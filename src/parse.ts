#!/usr/bin/env -S npx ts-node

import fs from 'fs';
import Oas from 'oas';
import yaml from 'js-yaml'
import type {InfoBlock, LicenseObject, ContactObject, Block} from './ir/types.ts';
import type { OASDocument } from 'oas/types';
import path from 'path';
import type { Operation } from 'oas/operation';

const args = process.argv.slice(2);

const specFile = args[0];
if (!specFile) {
  console.error('Usage: foo <openapi-spec-file.json>.');
  process.exit(1);
}

type DairyContext = {
  spec: Oas,
  depth: number
}

try {
  const data = yaml.load(
    fs.readFileSync(specFile, 'utf8')) as OASDocument
  const spec = new Oas(data)
  await spec.dereference()
  spec.getCircularReferences()


  const context : DairyContext = {
    spec,
    depth: 0
  }

  const processors = [
    processInfo,
    taggedOperations
  ]
  const blocks : Block[] = 
    processors.flatMap(
      p => p(context))

  process.stdout.write(JSON.stringify(blocks))

} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  console.error(error)
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

function sectionBlock(context: DairyContext, sectiontype: string, title: string, makeChildren: (context: DairyContext) => Block[]) : Block {
  return {
    blocktype: "section",
    sectiontype,
    title,
    level: context.depth,
    children: makeChildren({...context, depth: context.depth + 1}).flat()
  }
}

function taggedOperations(context: DairyContext) : Block[] {
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
    "tag",
    name,
    (context) => [
      textBlock(context, "overview.description", description),
      operations.map(op => operationBlock(context, op))
    ]
  )
}

function textBlock(context: DairyContext, blocktype: string, body: string) : Block {
  return {
    blocktype,
    body
  }
}

function operationBlock(context: DairyContext, op: Operation) : Block {
  return sectionBlock(
    context,
    "operation",
    op.schema.summary || op.schema.operationId || `${op.method.toUpperCase()} ${op.path}`,
    (context) => [
      opHeaderBlock(context, op),
      textBlock(context, "op.description", op.schema.description || ""),
      ...securityBlocks(context, op),
      ...paramsBlocks(context, op),
      ...responsesBlocks(context, op),
      ...requestBodyBlocks(context, op)
    ]
  )
}

function responseBlock(context: DairyContext, op: Operation, statusCode: string) : Block {
  const response = op.getResponseByStatusCode(statusCode)
  const content = 
    Object.fromEntries(
      Object.entries(response.content || {}).map(
        ([mediaType, mediaObj]) => [mediaType, parseSchema(mediaObj.schema)]))

  
  return {
    blocktype: "op.response",
    statusCode,
    content
  }
}

function parseSchema(schema: any) : Object {
  console.log(schema)
  // process.exit(1)
  return schema as Object
}

function responsesBlocks(context: DairyContext, op: Operation) : Block[] {
  const responses = op.getResponseStatusCodes().map(
    statusCode => responseBlock(context, op, statusCode))

  if (responses.length) {
    return [sectionBlock(
      context,
      "responses",
      "Responses",
      (context) => responses
    )]
  } else {
    return []
  }
}

function requestBodyBlocks(context: DairyContext, op: Operation) : Block[] {
  const requestBodies = op.getRequestBodyMediaTypes().map(
    mediaType => { return {
      blocktype: "op.requestBody",
      mediaType,
      ...(op.getRequestBody(mediaType) as Object)
    }})

  if (requestBodies.length) {
    return [sectionBlock(
      context,
      "requestBodies",
      "Request Bodies",
      (context) => requestBodies
    )]
  } else {
    return []
  }
}

function securityBlocks(context: DairyContext,  op: Operation) {
  const security = op.getSecurityWithTypes()

  // figure out why it's double nested
  return security.flat().flatMap(s => {
    return {
      blocktype: "op.security",
      ...s
    }
  })
}

function paramsBlocks(context: DairyContext, op: Operation) : Block {
  const params = op.getParameters()

  type paramType = "path" | "query" | "header" | "cookie"
  const paramsByType = Object.groupBy(params, p => p.in) as Record<paramType, ParameterObject[]>
  const paramTypes : paramType[] = [
    "path",
    "query",
    "header",
    "cookie"
  ]
  const sections = paramTypes.flatMap(pt => paramsByType[pt] ? [[pt, paramsByType[pt]]] : []) as 
    [paramType, ParameterObject[]][]

  return sections.map(([pt, params]) => 
      // throw new Error(`${pt} ${typeof pt}, ${params} ${typeof params}`);
    sectionBlock(
      context,
      `params.${pt}`,
      `${pt.charAt(0).toUpperCase() + pt.slice(1)} Parameters`,
      (context) => [
        params.map(p => {
          return {
            blocktype: "op.parameter",
            ...p
          }
        })
      ]
    )
  )
}



function opHeaderBlock(context: DairyContext, op: Operation) : Block {
  return {
    title: op.schema.summary || op.schema.operationId || `${op.method.toUpperCase()} ${op.path}`,
    blocktype: "op.header",
    method: op.method.toUpperCase(),
    path: op.path,
    operationId: op.schema.operationId || ''
  }
}
