import {
  WidgetRegistry,
  initRegistry,
  defaultWidgetRegistry,
} from '@progress/sitefinity-nextjs-sdk';
import Hero from '../components/hero/hero';
import HeroDefault from '../components/hero/herodefault';
import { HeroEntity } from '../components/hero/hero.entity';

import MainNavigation from '../components/mainNavigation/mainNavigation';
import { MainNavigationEntity } from '../components/mainNavigation/mainNavigation.entity';
import { CardSectionEntity } from '../components/widgets/cards/card-section.entity';

import GridOfCards from '../components/widgets/cards/gridOfCards';
import ScrollableCards from '../components/widgets/cards/scrollableCards';

import Footer from '../components/footer/Footer-template';
import { FooterEntity } from '../components/footer/Footer.entity';

import FinanceRepaymentBanner from '../components/widgets/bannerTwo/FinanceRepaymentBanner';
import { FinanceRepaymentBannerEntity } from '../components/widgets/bannerTwo/FinanceRepaymentBanner.entity';

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
    Footer: {
      componentType: Footer,
      entity: FooterEntity,
      ssr: true,
      editorMetadata: { Title: 'Footer' },
      views: {
        Default: { Title: 'Default', ViewFunction: Footer },
      },
    },
    BannerTwo: {
      componentType: FinanceRepaymentBanner,
      entity: FinanceRepaymentBannerEntity,
      ssr: true,
      editorMetadata: { Title: 'BannerTwo' },
      views: {
        Default: { Title: 'Default', ViewFunction: FinanceRepaymentBanner },
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

