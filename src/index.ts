// Main entry point - re-exports from modular components

export type {
    Page,
    Block,
    HeaderBlock,
    SectionBlock,
    OverviewMetaBlock,
    OverviewDescriptionBlock,
    DescriptionBlock,
    ParameterBlock,
    RequestBodyBlock,
    ExampleBlock,
    ParamItem,
    ResponseItem,
    ResponseBlock,
    ServerBlock,
    SecurityBlock,
    PageContainer
} from './ir/types.ts';

export { parseOpenAPIDocument } from './parse.ts';
export { buildPageContainer } from './build.ts';

// Maintain backward compatibility with the original API
import { parseOpenAPIDocument } from './parse.ts';
import { buildPageContainer } from './build.ts';
import type { PageContainer } from './ir/types.ts';

export function parsePageContainer(data: any): PageContainer {
    return buildPageContainer(data);
}
