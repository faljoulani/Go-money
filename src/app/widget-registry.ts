import {
  WidgetRegistry,
  initRegistry,
  defaultWidgetRegistry,
} from '@progress/sitefinity-nextjs-sdk';
import Hero from '../components/widgets/hero/hero';
import HeroDefault from '../components/widgets/hero/herodefault';
import { HeroEntity } from '../components/widgets/hero/hero.entity';

import MainNavigation from '../components/widgets/mainNavigation/mainNavigation';
import { MainNavigationEntity } from '../components/widgets/mainNavigation/mainNavigation.entity';
import { CardSectionEntity } from '../components/widgets/cards/card-section.entity';

import GridOfCards from '../components/widgets/cards/gridOfCards';
import ScrollableCards from '../components/widgets/cards/scrollableCards';

// 👇 add these 2 lines
import Footer from '../components/widgets/footer/footerTemplate';
import { FooterEntity } from '../components/widgets/footer/footer.entity';

import HowItWorks from '../components/HowItWorks/HowItWorks';
import { HowItWorkEntity } from '../components/HowItWorks/HowItWorks.entity';

const customWidgetRegistry: WidgetRegistry = {
  widgets: {
    Hero: {
      componentType: Hero,
      entity: HeroEntity,
      ssr: true,
      editorMetadata: { Title: 'Hero' },
      views: {
        Default: { Title: 'Default', ViewFunction: HeroDefault },
        Background: { Title: 'Background', ViewFunction: Hero },
      },
    },
    CardSection: {
      componentType: GridOfCards,
      entity: CardSectionEntity,
      ssr: true,
      editorMetadata: { Title: 'Card Section' },
      views: {
        Default: { Title: 'Grid', ViewFunction: GridOfCards },
        Scrollable: { Title: 'Scrollable', ViewFunction: ScrollableCards },
      },
    },
    MainNavigation: {
      componentType: MainNavigation,
      entity: MainNavigationEntity,
      ssr: true,
      editorMetadata: { Title: 'Main Navigation' },
      views: {
        Default: { Title: 'Default', ViewFunction: MainNavigation },
      },
    },

    // 👇 new: Footer
    Footer: {
      componentType: Footer,
      entity: FooterEntity,
      ssr: true,
      editorMetadata: { Title: 'Footer' },
      views: {
        Default: { Title: 'Default', ViewFunction: Footer },
      },
    },
     HowItWorks: {
      componentType: HowItWorks,
      entity: HowItWorkEntity,
      ssr: true,
      editorMetadata: { Title: 'HowItWorks' },
      views: {
        Default: { Title: 'Default', ViewFunction: HowItWorks },
       
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

