// Intermediate Representation (IR) Types for OpenAPI Documentation

export interface Page {
    kind: 'operation' | 'schema' | 'overview',
    id: string,
    title: string,
    slug: string    
}

export type Block = SectionBlock | OverviewMetaBlock | OverviewDescriptionBlock | HeaderBlock | DescriptionBlock | ParameterBlock | RequestBodyBlock | ExampleBlock | ResponseBlock | ServerBlock | SecurityBlock

export interface HeaderBlock {
    type: "op.header",
    title: string,
    method: string,
    path: string,
    operationId: string
}

export interface OverviewMetaBlock {
    type: "overview.meta",
    email?: string,
    license?: {
        name: string,
        url?: string
    },
    termsOfService?: string
}

export interface OverviewDescriptionBlock {
    type: "overview.description",
    body: string
}

export interface SectionBlock {
    type: "section",
    title: string,
    level: number,
    children: Array<Block>
}

export interface DescriptionBlock {
    type: "op.description",
    body: string
}

export interface ParameterBlock {
    type: "op.parameters",
    groups: Array<{
        in: string,
        title: string,
        items: Array<ParamItem>
    }>
}

export interface RequestBodyBlock {
    type: "op.requestBody",
    description?: string,
    required?: boolean,
    mediaTypes: Array<{
        mediaType: string,
        schema: any
    }>
}

export interface ExampleBlock {
    type: "op.example",
    mediaType: string,
    examples: any[]
}

export interface ServerBlock {
    type: "overview.servers",
    servers: Array<{
        url: string,
        description?: string
    }>
}

export interface SecurityBlock {
    type: "op.security",
    requirements: Array<{
        name: string,
        scopes: string[]
    }>
}

export interface ParamItem {
    kind: "param",
    name: string,
    in: string,
    required: boolean,
    description: string,
    type: any,
    examples: any[]
}

export interface ResponseItem {
  mediaType: string,
  schema: any,
  expand?: {
    mode: "inlinePreview" | "linkOnly",
    preview?: any
  } 
} 

export interface ResponseBlock {
    type: "op.responses",
    responses: Array<{
        status: string,
        description: string,
        primary?: ResponseItem,
        alternates: ResponseItem[]
    }>
}

export interface PageContainer {
    page: Page,
    blocks: Array<Block>
}
