// Build IR (Intermediate Representation) from OpenAPI documents

import type {
    PageContainer,
    Page,
    Block,
    SectionBlock,
    OverviewMetaBlock,
    OverviewDescriptionBlock,
    ParameterBlock,
    ParamItem,
    RequestBodyBlock,
    ExampleBlock,
    ResponseBlock,
    ResponseItem,
    ServerBlock,
    SecurityBlock
} from './ir/types.ts';

/**
 * Build PageContainer from OpenAPI document or operation object
 */
export function buildPageContainer(data: any): PageContainer {
    // Check if this is an OpenAPI document (overview page)
    if (data.openapi && data.info) {
        return buildOverviewPage(data);
    }

    // Handle operation object
    return buildOperationPage(data);
}

/**
 * Build overview page from OpenAPI document
 */
function buildOverviewPage(data: any): PageContainer {
    const title = data.info.title || 'Untitled API';
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    const page: Page = {
        kind: 'overview',
        id: 'unknown',
        title: title,
        slug: slug
    };

    const blocks: Block[] = [];

    // Create main section for the API
    const mainSectionChildren: Block[] = [];

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

    // Add servers block if present
    if (data.servers && data.servers.length > 0) {
        mainSectionChildren.push({
            type: "overview.servers",
            servers: data.servers.map((server: any) => {
                const srv: { url: string, description?: string } = { url: server.url };
                if (server.description) {
                    srv.description = server.description;
                }
                return srv;
            })
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
            const resourceSectionChildren: Block[] = [];
            
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
                            const operationSection = buildOperationSection(operation, method, path, data);
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

/**
 * Build operation section (level 3) for a tag
 */
function buildOperationSection(operation: any, method: string, path: string, data: any): SectionBlock {
    const operationChildren: Block[] = [];
    
    // Add operation description if present
    if (operation.description) {
        operationChildren.push({
            type: "overview.description",
            body: operation.description
        });
    }
    
    // Add parameters block if present
    if (operation.parameters && operation.parameters.length > 0) {
        operationChildren.push(buildParametersBlock(operation.parameters));
    }
    
    // Add request body block if present
    if (operation.requestBody) {
        const requestBodyBlocks = buildRequestBodyBlocks(operation.requestBody, data);
        operationChildren.push(...requestBodyBlocks);
    }
    
    // Add responses block if present
    if (operation.responses) {
        const responseBlocks = buildResponseBlocks(operation.responses);
        operationChildren.push(...responseBlocks);
    }
    
    // Add security block if present
    if (operation.security && operation.security.length > 0) {
        const securityBlock = buildSecurityBlock(operation.security);
        if (securityBlock) {
            operationChildren.push(securityBlock);
        }
    }
    
    const operationSection: SectionBlock = {
        type: "section",
        title: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
        level: 3,
        children: operationChildren
    };
    
    return operationSection;
}

/**
 * Build parameters block from parameters array
 */
function buildParametersBlock(parameters: any[]): ParameterBlock {
    const groupedParams = parameters.reduce((acc: Record<string, ParamItem[]>, param: any) => {
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

    return {
        type: "op.parameters",
        groups: Object.entries(groupedParams).map(([location, items]) => ({
            in: location,
            title: location.charAt(0).toUpperCase() + location.slice(1),
            items
        }))
    };
}

/**
 * Build request body blocks (requestBody + parameters + examples)
 */
function buildRequestBodyBlocks(requestBody: any, data: any): Block[] {
    const blocks: Block[] = [];
    
    const mediaTypes: Array<{ mediaType: string, schema: any }> = [];
    
    if (requestBody.content) {
        for (const [mediaType, mediaContent] of Object.entries(requestBody.content as any)) {
            mediaTypes.push({
                mediaType,
                schema: mediaContent.schema || {}
            });
        }
    }
    
    blocks.push({
        type: "op.requestBody",
        description: requestBody.description,
        required: requestBody.required,
        mediaTypes
    });
    
    // Add parameters from schema if available
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
                blocks.push({
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
                blocks.push({
                    type: "op.example",
                    mediaType,
                    examples: Object.values(mediaContent.examples)
                });
            }
        }
    }
    
    return blocks;
}

/**
 * Build response blocks (examples + responses)
 */
function buildResponseBlocks(responses: any): Block[] {
    const blocks: Block[] = [];
    const responseItems: Array<{
        status: string,
        description: string,
        primary?: ResponseItem,
        alternates: ResponseItem[]
    }> = [];
    
    const responseExamples: ExampleBlock[] = [];
    
    for (const [status, response] of Object.entries(responses as any)) {
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
            ...(mediaTypes.length > 0 ? {
                primary: {
                    mediaType: mediaTypes[0],
                    schema: content[mediaTypes[0]]?.schema || {}
                }
            } : {}),
            alternates: mediaTypes.slice(1).map(mt => ({
                mediaType: mt,
                schema: content[mt]?.schema || {}
            }))
        };

        responseItems.push(responseItem);
        
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
    blocks.push(...responseExamples);
    
    // Then add responses block
    if (responseItems.length > 0) {
        blocks.push({
            type: "op.responses",
            responses: responseItems
        });
    }
    
    return blocks;
}

/**
 * Build security block from security array
 */
function buildSecurityBlock(security: any[]): SecurityBlock | null {
    const requirements = security.flatMap((secReq: any) => 
        Object.entries(secReq).map(([name, scopes]) => ({
            name,
            scopes: scopes as string[]
        }))
    );
    
    if (requirements.length === 0) {
        return null;
    }
    
    return {
        type: "op.security",
        requirements
    };
}

/**
 * Build operation page from operation object
 */
function buildOperationPage(data: any): PageContainer {
    const page: Page = {
        kind: 'operation',
        id: data.operationId || data.summary || 'unknown',
        title: data.summary || 'Untitled Operation',
        slug: data.operationId || 'unknown-operation'
    };

    const blocks: Block[] = [];

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
        blocks.push(buildParametersBlock(data.parameters));
    }

    // Add responses block if present
    if (data.responses) {
        blocks.push({
            type: "op.responses",
            responses: Object.entries(data.responses).map(([status, response]: [string, any]) => {
                const content = response.content || {};
                const mediaTypes = Object.keys(content);
                
                const primary: ResponseItem | undefined = mediaTypes.length > 0 ? {
                    mediaType: mediaTypes[0],
                    schema: content[mediaTypes[0]]?.schema || {}
                } : undefined;

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

    // Add security block if present
    if (data.security && data.security.length > 0) {
        const securityBlock = buildSecurityBlock(data.security);
        if (securityBlock) {
            blocks.push(securityBlock);
        }
    }

    return { page, blocks };
}
