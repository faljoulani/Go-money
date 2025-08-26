import { WidgetRegistry, initRegistry, defaultWidgetRegistry } from '@progress/sitefinity-nextjs-sdk';
import Hero from '../components/Hero/hero';
import HeroDefault from '../components/Hero/herodefault';
import { HeroEntity } from '../components/Hero/hero.entity';

const customWidgetRegistry: WidgetRegistry = {
    widgets: {
        Hero: {
            componentType: Hero,
            entity: HeroEntity,
            ssr: true,
            editorMetadata: {
                Title: 'Hero',
            },
            views: {
                Default: { Title: 'Default', ViewFunction: Hero },
                Background: { Title: 'Background', ViewFunction: HeroDefault },
            },
        },
    },
};

customWidgetRegistry.widgets = {
    ...defaultWidgetRegistry.widgets,
    ...customWidgetRegistry.widgets,
};

export const widgetRegistry: WidgetRegistry = initRegistry(customWidgetRegistry);

export default widgetRegistry;

