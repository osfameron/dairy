# dairy 🥛

## Docs API Intermediate Representation... Yay!

```bash
redocly bundle -o bundle.json

dairy bundle.json | churn gfm --out ./docs
```

The Dairy project presents two small, Unix-style tools, designed to work together in a pipeline to convert OpenAPI specifications 
into beautifully formatted, flexible representations for documentation purposes.

* `dairy` converts an OpenAPI specification into a semantic, documentation-oriented intermediate representation (IR).
* `churn` converts this IR into documentation, using Handlebars templates with minimal logic.

The goal is to separate OpenAPI semantics from presentation, so that templates stay simple and logic stays testable.


## Why dairy?

Most OpenAPI documentation generators conflate three concerns:

1. Understanding OpenAPI (refs, composition, parameters, media types)

2. Deciding what documentation should exist (sections, groupings, summaries)

3. Deciding how that documentation should look (Markdown, HTML, tables, lists)

`dairy` does 1 and 2, providing an output which is more "opinionated" than OpenAPI.
`churn` takes care of 3.

This split allows the templating to remain "dumb", and output formats easily swappable.


## What dairy does

Given a bundled OpenAPI spec (JSON or YAML), dairy:

* parses and normalizes OpenAPI 3.x

* resolves and indexes schemas, operations, and parameters

* applies documentation-specific policy (grouping, ordering, ref previews)

* emits a Docs IR describing pages, sections, blocks, and schema snippets

The output is plain JSON.


## What dairy does not do

* It does not render Markdown / HTML / AsciiDoc

* It does not contain templates

* It does not decide typography or layout

* It does not depend on Handlebars (or any templating engine)

Those concerns belong downstream.


## The IR at a glance

The IR is structured around a small set of concepts:

Page
 └─ Block
     └─ Block (recursive via sections)


Key ideas:

Pages are output units (e.g. “API Overview”, “Get Cloud Accounts”)

Blocks are semantic sections (parameters, responses, descriptions, etc.)

One special block type, section, is recursive and represents document hierarchy

Schema information is represented as typed snippets, not raw OpenAPI objects

Templates never need to understand OpenAPI keywords like $ref, allOf, or nullable.

The IR is designed to be:

* explicit

* stable (eventually, right now this is pre-alpha software)

* safe to consume from templates or other tools

## Sections and hierarchy

dairy supports both:

* page-per-operation output, and

* single-page, nested output (e.g. Redoc-style H2 resources with H3 endpoints)
 that contains other blocks.

## Project status

This is currently a proof of concept evolving into a real tool.

* The current priorities are:

* Refactoring and strengthening the IR and internal structure

* Testing against real-world OpenAPI specs

* Validating that the IR supports flexible rendering without leaking semantics

* Expect some churn (pun intended) in early versions.

## Philosophy

* Make the semantic model boring.
* Make the renderer dumb.
* Make the pipeline composable.
