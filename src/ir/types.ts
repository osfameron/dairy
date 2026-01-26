// Intermediate Representation (IR) Types for OpenAPI Documentation

export interface Page {
    kind: 'operation' | 'schema' | 'overview',
    id: string,
    title: string,
    slug: string    
}

export type Block = SectionBlock | InfoBlock | HeaderBlock | DescriptionBlock | ParameterBlock | RequestBodyBlock | ExampleBlock | ResponseBlock | ServerInfo | SecurityBlock

export interface HeaderBlock {
    type: "op.header",
    title: string,
    method: string,
    path: string,
    operationId: string
}

export interface InfoBlock {
    blocktype: "overview.info",
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactObject;
    license?: LicenseObject;
    version: string;
    summary?: string;
    openapi: string; // not sure if this should be here
    servers?: ServerInfo[];
}

export interface LicenseObject {
    name: string;
    url?: string;
    identifier?: string;
}

export interface ContactObject {
    name?: string;
    url?: string;
    email?: string;
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

export interface ServerInfo {
    url: string,
    description?: string,
    variables?: Record<string, ServerVariableObject>;
}

export interface ServerVariableObject {
    enum?: string[] | number[];
    default: string | number;
    description?: string;
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
