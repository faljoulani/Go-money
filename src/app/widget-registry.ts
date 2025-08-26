    import { WidgetRegistry, initRegistry, defaultWidgetRegistry } from '@progress/sitefinity-nextjs-sdk';
    import Hero from '../components/hero/hero';
    import HeroDefault from '../components/hero/herodefault';
    import {HeroEntity} from '../components/hero/hero.entity';
    import MainNavigation from '../components/MainNavigations/MainNavigation'
    import { MainNavigationEntity } from '../components/MainNavigations/MainNavigation.entity';

const customWidgetRegistry: WidgetRegistry = {
  widgets: {
    Hero: {
      componentType: HeroDefault,
      entity: HeroEntity,
      ssr: true,
      editorMetadata: {
        Title: 'Hero',
      },
      views: {
        Default: { Title: 'Default', ViewFunction: HeroDefault },
        Background: { Title: 'Background', ViewFunction: Hero },
      },
    },

    MainNavigation: {
      componentType: MainNavigation,
      entity: MainNavigationEntity,
      ssr: true,
      editorMetadata: {
        Title: 'Main Navigation',
      },
      views: {
        Default: { Title: 'Default', ViewFunction: MainNavigation },
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

