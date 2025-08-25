import { WidgetRegistry, initRegistry, defaultWidgetRegistry } from '@progress/sitefinity-nextjs-sdk';
import Hero from '../components/Hero/hero';
import HeroDefault from '../components/Hero/herodefault';
import { HeroEntity } from '../components/Hero/hero.entity';

const customWidgetRegistry: WidgetRegistry = {
    widgets: {
        Hero: {
            componentType: HeroDefault,
            entity: HeroEntity,
            ssr: true,
            editorMetadata: {
                Title: 'Hero'
            },
            views: {
                Default: { Title: 'Default', ViewFunction: HeroDefault },
                Background: { Title: 'Background', ViewFunction: Hero }
            }
        }
    }
};

customWidgetRegistry.widgets = {
    ...defaultWidgetRegistry.widgets,
    ...customWidgetRegistry.widgets
};

export const widgetRegistry: WidgetRegistry = initRegistry(customWidgetRegistry);

export default widgetRegistry;
