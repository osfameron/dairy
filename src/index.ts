interface Page {
    kind: 'operation' | 'schema' | 'overview',
    id: string,
    title: string,
    slug: string    
}

type Block = SectionBlock | OverviewMetaBlock | OverviewDescriptionBlock | HeaderBlock | DescriptionBlock | ParameterBlock | RequestBodyBlock | ExampleBlock | ResponseBlock

interface HeaderBlock {
    type: "op.header",
    title: string,
    method: string,
    path: string,
    operationId: string
}

interface OverviewMetaBlock {
    type: "overview.meta",
    email?: string,
    license?: {
        name: string,
        url?: string
    },
    termsOfService?: string
}

interface OverviewDescriptionBlock {
    type: "overview.description",
    body: string
}

interface SectionBlock {
    type: "section",
    title: string,
    level: number,
    children: Array<Block>
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

interface RequestBodyBlock {
    type: "op.requestBody",
    description?: string,
    required?: boolean,
    mediaTypes: Array<{
        mediaType: string,
        schema: any
    }>
}

interface ExampleBlock {
    type: "op.example",
    mediaType: string,
    examples: any[]
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

interface ResponseItem {
  mediaType: string,
  schema: any,
  expand?: {
    mode: "inlinePreview" | "linkOnly",
    preview?: any
  } 
} 

interface ResponseBlock {
    type: "op.responses",
    responses: Array<{
        status: string,
        description: string,
        primary?: ResponseItem,
        alternates: ResponseItem[]
    }>
}

interface PageContainer {
    page: Page,
    blocks: Array<Block>
}

function parsePageContainer(data: any): PageContainer {
    // Check if this is an OpenAPI document (overview page)
    if (data.openapi && data.info) {
        const title = data.info.title || 'Untitled API';
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        
        const page: Page = {
            kind: 'overview',
            id: 'unknown',
            title: title,
            slug: slug
        };

        const blocks: Array<SectionBlock | HeaderBlock | OverviewMetaBlock | OverviewDescriptionBlock | DescriptionBlock | ParameterBlock | RequestBodyBlock | ExampleBlock | ExampleBlock | ResponseBlock> = [];

        // Create main section for the API
        const mainSectionChildren: Array<SectionBlock | OverviewMetaBlock | OverviewDescriptionBlock | HeaderBlock | DescriptionBlock | ParameterBlock | RequestBodyBlock | ExampleBlock | ResponseBlock> = [];

        // Add overview metadata block if info contains contact, license, or termsOfService
        if (data.info.contact?.email || data.info.license || data.info.termsOfService) {
            const metaBlock: OverviewMetaBlock = {
                type: "overview.meta"
            };
            
            if (data.info.contact?.email) {
                metaBlock.email = data.info.contact.email;
            }
            
            if (data.info.license) {
                metaBlock.license = {
                    name: data.info.license.name,
                    url: data.info.license.url
                };
            }
            
            if (data.info.termsOfService) {
                metaBlock.termsOfService = data.info.termsOfService;
            }
            
            mainSectionChildren.push(metaBlock);
        }

        // Add description block if present
        if (data.info.description) {
            mainSectionChildren.push({
                type: "overview.description",
                body: data.info.description
            });
        }

        // Add external docs as description block if present
        if (data.externalDocs?.description) {
            mainSectionChildren.push({
                type: "overview.description",
                body: `${data.externalDocs.description} ([link](${data.externalDocs.url}))`
            });
        }

        // Create level 2 sections for each tag/resource
        if (data.tags && data.tags.length > 0) {
            for (const tag of data.tags) {
                const resourceSectionChildren: Array<SectionBlock | OverviewMetaBlock | OverviewDescriptionBlock | HeaderBlock | DescriptionBlock | ParameterBlock | RequestBodyBlock | ExampleBlock | ResponseBlock> = [];
                
                // Add tag description if present
                if (tag.description) {
                    resourceSectionChildren.push({
                        type: "overview.description",
                        body: tag.description
                    });
                }
                
                // Add tag external docs if present
                if (tag.externalDocs?.description) {
                    resourceSectionChildren.push({
                        type: "overview.description",
                        body: `${tag.externalDocs.description} ([link](${tag.externalDocs.url}))`
                    });
                }
                
                // Add level 3 sections for operations tagged with this tag
                if (data.paths) {
                    for (const [path, pathItem] of Object.entries(data.paths)) {
                        for (const [method, operation] of Object.entries(pathItem as any)) {
                            // Skip non-operation properties
                            if (!operation || typeof operation !== 'object' || !operation.tags) continue;
                            
                            // Check if this operation is tagged with the current tag
                            if (operation.tags.includes(tag.name)) {
                                const operationChildren: Array<SectionBlock | OverviewMetaBlock | OverviewDescriptionBlock | HeaderBlock | DescriptionBlock | ParameterBlock | RequestBodyBlock | ExampleBlock | ResponseBlock> = [];
                                
                                // Add operation description if present
                                if (operation.description) {
                                    operationChildren.push({
                                        type: "overview.description",
                                        body: operation.description
                                    });
                                }
                                
                                // Add parameters block if present
                                if (operation.parameters && operation.parameters.length > 0) {
                                    const groupedParams = operation.parameters.reduce((acc: Record<string, ParamItem[]>, param: any) => {
                                        const location = param.in || 'query';
                                        if (!acc[location]) {
                                            acc[location] = [];
                                        }
                                        acc[location].push({
                                            kind: "param",
                                            name: param.name || '',
                                            in: location,
                                            required: param.required || false,
                                            description: param.description || '',
                                            type: param.schema || param.type || {},
                                            examples: param.examples ? Object.values(param.examples) : (param.example ? [param.example] : [])
                                        });
                                        return acc;
                                    }, {});

                                    operationChildren.push({
                                        type: "op.parameters",
                                        groups: Object.entries(groupedParams).map(([location, items]) => ({
                                            in: location,
                                            title: location.charAt(0).toUpperCase() + location.slice(1),
                                            items
                                        }))
                                    });
                                }
                                
                                // Add request body block if present
                                if (operation.requestBody) {
                                    const requestBody = operation.requestBody;
                                    const mediaTypes: Array<{ mediaType: string, schema: any }> = [];
                                    
                                    if (requestBody.content) {
                                        for (const [mediaType, mediaContent] of Object.entries(requestBody.content as any)) {
                                            mediaTypes.push({
                                                mediaType,
                                                schema: mediaContent.schema || {}
                                            });
                                        }
                                    }
                                    
                                    operationChildren.push({
                                        type: "op.requestBody",
                                        description: requestBody.description,
                                        required: requestBody.required,
                                        mediaTypes
                                    });
                                    
                                    // Add parameters from schema if available
                                    // For now, we'll need to resolve the schema reference
                                    // This is a simplified version - in reality you'd need to resolve $ref
                                    const firstMediaType = requestBody.content ? Object.values(requestBody.content)[0] as any : null;
                                    if (firstMediaType?.schema) {
                                        const schema = firstMediaType.schema;
                                        // Check if we need to resolve the schema from components
                                        let resolvedSchema = schema;
                                        if (schema.$ref && data.components?.schemas) {
                                            const schemaName = schema.$ref.split('/').pop();
                                            resolvedSchema = data.components.schemas[schemaName];
                                        }
                                        
                                        if (resolvedSchema?.properties) {
                                            const bodyParams: ParamItem[] = [];
                                            const required = resolvedSchema.required || [];
                                            
                                            for (const [propName, propSchema] of Object.entries(resolvedSchema.properties)) {
                                                bodyParams.push({
                                                    kind: "param",
                                                    name: propName,
                                                    in: "body",
                                                    required: required.includes(propName),
                                                    description: (propSchema as any).description || '',
                                                    type: propSchema,
                                                    examples: (propSchema as any).example ? [(propSchema as any).example] : []
                                                });
                                            }
                                            
                                            if (bodyParams.length > 0) {
                                                operationChildren.push({
                                                    type: "op.parameters",
                                                    groups: [{
                                                        in: "body",
                                                        title: "Body",
                                                        items: bodyParams
                                                    }]
                                                });
                                            }
                                        }
                                    }
                                    
                                    // Add example blocks for each media type
                                    if (requestBody.content) {
                                        for (const [mediaType, mediaContent] of Object.entries(requestBody.content as any)) {
                                            if (mediaContent.examples && Object.keys(mediaContent.examples).length > 0) {
                                                operationChildren.push({
                                                    type: "op.example",
                                                    mediaType,
                                                    examples: Object.values(mediaContent.examples)
                                                });
                                            }
                                        }
                                    }
                                }
                                
                                // Add responses block if present
                                if (operation.responses) {
                                    const responses: Array<{
                                        status: string,
                                        description: string,
                                        primary?: ResponseItem,
                                        alternates: ResponseItem[]
                                    }> = [];
                                    
                                    const responseExamples: Array<ExampleBlock> = [];
                                    
                                    for (const [status, response] of Object.entries(operation.responses as any)) {
                                        const content = response.content || {};
                                        const mediaTypes = Object.keys(content);
                                        
                                        const responseItem: {
                                            status: string,
                                            description: string,
                                            primary?: ResponseItem,
                                            alternates: ResponseItem[]
                                        } = {
                                            status,
                                            description: response.description || '',
                                            alternates: mediaTypes.slice(1).map(mt => ({
                                                mediaType: mt,
                                                schema: content[mt]?.schema || {}
                                            }))
                                        };
                                        
                                        // Only add primary if there's content
                                        if (mediaTypes.length > 0) {
                                            responseItem.primary = {
                                                mediaType: mediaTypes[0],
                                                schema: content[mediaTypes[0]]?.schema || {}
                                            };
                                        }

                                        responses.push(responseItem);
                                        
                                        // Collect example blocks for each response media type
                                        for (const [mediaType, mediaContent] of Object.entries(content)) {
                                            const mc = mediaContent as any;
                                            // Check for both "examples" (plural) and "example" (singular)
                                            if (mc?.examples && Object.keys(mc.examples).length > 0) {
                                                responseExamples.push({
                                                    type: "op.example",
                                                    mediaType,
                                                    examples: Object.values(mc.examples)
                                                });
                                            } else if (mc?.example) {
                                                // Handle singular "example" field
                                                responseExamples.push({
                                                    type: "op.example",
                                                    mediaType,
                                                    examples: [mc.example]
                                                });
                                            }
                                        }
                                    }
                                    
                                    // Add examples first
                                    for (const ex of responseExamples) {
                                        operationChildren.push(ex);
                                    }
                                    
                                    // Then add responses block
                                    if (responses.length > 0) {
                                        operationChildren.push({
                                            type: "op.responses",
                                            responses
                                        });
                                    }
                                }
                                
                                const operationSection: SectionBlock = {
                                    type: "section",
                                    title: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
                                    level: 3,
                                    children: operationChildren
                                };
                                resourceSectionChildren.push(operationSection);
                            }
                        }
                    }
                }
                
                const resourceSection: SectionBlock = {
                    type: "section",
                    title: tag.name,
                    level: 2,
                    children: resourceSectionChildren
                };
                mainSectionChildren.push(resourceSection);
            }
        }

        // Create the main level 1 section
        const mainSection: SectionBlock = {
            type: "section",
            title: `${data.info.title} (${data.info.version})`,
            level: 1,
            children: mainSectionChildren
        };

        blocks.push(mainSection);

        return { page, blocks };
    }

    // Handle operation object
    const page: Page = {
        kind: 'operation',
        id: data.operationId || data.summary || 'unknown',
        title: data.summary || 'Untitled Operation',
        slug: data.operationId || 'unknown-operation'
    };

    const blocks: Array<SectionBlock | HeaderBlock | OverviewMetaBlock | OverviewDescriptionBlock | DescriptionBlock | ParameterBlock | ResponseBlock> = [];

    // Add header block
    blocks.push({
        type: "op.header",
        title: data.summary || '',
        method: data.method?.toUpperCase() || 'GET',
        path: data.path || '/',
        operationId: data.operationId || ''
    });

    // Add description block if present
    if (data.description) {
        blocks.push({
            type: "op.description",
            body: data.description
        });
    }

    // Add parameters block if present
    if (data.parameters && data.parameters.length > 0) {
        const groupedParams = data.parameters.reduce((acc: Record<string, ParamItem[]>, param: any) => {
            const location = param.in || 'query';
            if (!acc[location]) {
                acc[location] = [];
            }
            acc[location].push({
                kind: "param",
                name: param.name || '',
                in: location,
                required: param.required || false,
                description: param.description || '',
                type: param.schema || param.type || {},
                examples: param.examples ? Object.values(param.examples) : []
            });
            return acc;
        }, {});

        blocks.push({
            type: "op.parameters",
            groups: Object.entries(groupedParams).map(([location, items]) => ({
                in: location,
                title: location.charAt(0).toUpperCase() + location.slice(1),
                items
            }))
        });
    }

    // Add responses block if present
    if (data.responses) {
        blocks.push({
            type: "op.responses",
            responses: Object.entries(data.responses).map(([status, response]: [string, any]) => {
                const content = response.content || {};
                const mediaTypes = Object.keys(content);
                
                const primary: ResponseItem = mediaTypes.length > 0 ? {
                    mediaType: mediaTypes[0],
                    schema: content[mediaTypes[0]]?.schema || {}
                } : null;

                const alternates: ResponseItem[] = mediaTypes.slice(1).map(mt => ({
                    mediaType: mt,
                    schema: content[mt]?.schema || {}
                }));

                return {
                    status,
                    description: response.description || '',
                    primary,
                    alternates
                };
            })
        });
    }

    return { page, blocks };
}


export type { Page, HeaderBlock, SectionBlock, OverviewMetaBlock, OverviewDescriptionBlock, DescriptionBlock, ParameterBlock, RequestBodyBlock, ExampleBlock, ParamItem, ResponseItem, ResponseBlock, PageContainer };
export { parsePageContainer };