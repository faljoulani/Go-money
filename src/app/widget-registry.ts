import {
  WidgetRegistry,
  initRegistry,
  defaultWidgetRegistry,
} from '@progress/sitefinity-nextjs-sdk';
import Hero from '../components/Hero/hero';
import HeroDefault from '../components/Hero/herodefault';
import { HeroEntity } from '../components/Hero/hero.entity';
import MainNavigation from '../components/MainNavigation/MainNavigation';
import { MainNavigationEntity } from '../components/MainNavigation/MainNavigation.entity';

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

