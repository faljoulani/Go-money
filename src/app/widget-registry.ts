import { WidgetRegistry, initRegistry, defaultWidgetRegistry } from '@progress/sitefinity-nextjs-sdk';
import Hero from '../components/Hero/hero';
import HeroDefault from '../components/Hero/herodefault';
import { HeroEntity } from '../components/Hero/hero.entity';

import MainNavigation from '../components/MainNavigations/MainNavigation';
import { MainNavigationEntity } from '../components/MainNavigations/MainNavigation.entity';

import CardSection from '../components/cards/card-section';
import { CardSectionEntity } from '../components/cards/card-section.entity';


// 👇 add these 2 lines
import Footer from '../components/Footer/Footer';
import { FooterEntity } from '../components/Footer/Footer.entity';

const customWidgetRegistry: WidgetRegistry = {
  widgets: {
    Hero: {
      componentType: HeroDefault,
      entity: HeroEntity,
      ssr: true,
      editorMetadata: { Title: 'Hero' },
      views: {
        Default:   { Title: 'Default',   ViewFunction: HeroDefault },
        Background:{ Title: 'Background',ViewFunction: Hero },
      },
    },


    // ===== Card Section =====
    CardSection: {
      componentType: CardSection,
      entity: CardSectionEntity,
      ssr: true,
      editorMetadata: { Title: 'Card List' },
      views: {
        Default: { Title: 'Default', ViewFunction: CardSection }
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
        // Optional extra view if you created it:
        // Compact: { Title: 'Compact', ViewFunction: Footer },
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
