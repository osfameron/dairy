interface Page {
    kind: 'operation' | 'schema' | 'overview',
    id: string,
    title: string,
    slug: string    
}

interface HeaderBlock {
    type: "op.header",
    title: string,
    method: string,
    path: string,
    operationId: string
}
interface DescriptionBlock {
    type: "op.description",
    body: string
}

interface ParameterBlock {
    type: "op.parameters",
    groups: Array<{
        in: string,
        title: string,
        items: Array<ParamItem>
    }>
}

interface ParamItem {
    kind: "param",
    name: string,
    in: string,
    required: boolean,
    description: string,
    type: any,
    examples: any[]
}

interface ResponseItemFoo {
  mediaType: string,
  schema: any,
  expand?: {
    mode: "inlinePreview" | "linkOnly",
    preview?: any
  } 
} 
type ResponseItem = ResponseItemFoo | null

interface ResponseBlock {
    type: "op.responses",
    responses: Array<{
        status: string,
        description: string,
        primary: ResponseItem,
        alternates: ResponseItem[]
    }>
}

interface PageContainer {
    page: Page,
    blocks: Array<HeaderBlock | DescriptionBlock | ParameterBlock | ResponseBlock>
}

export type { Page, HeaderBlock, DescriptionBlock, ParameterBlock, ParamItem, ResponseItem, ResponseBlock, PageContainer };