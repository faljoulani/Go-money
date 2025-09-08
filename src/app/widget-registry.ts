import {
  WidgetRegistry,
  initRegistry,
  addWidgetViews,
  defaultWidgetRegistry,
} from '@progress/sitefinity-nextjs-sdk';
import Hero from '../components/widgets/hero/hero';
import { HeroEntity } from '../components/widgets/hero/hero.entity';

import MainNavigation from '../components/widgets/mainNavigation/mainNavigation';
import { MainNavigationEntity } from '../components/widgets/mainNavigation/MainNavigation.entity';
import { CardSectionEntity } from '../components/widgets/cards/card.entity';

import GridOfCards from '../components/widgets/cards/gridOfCards';
import ScrollableCards from '../components/widgets/cards/scrollableCards';

import Footer from '../components/widgets/footer/Footer-template';
import { FooterEntity } from '../components/widgets/footer/Footer.entity';

import FinanceRepaymentBanner from '../components/widgets/financeRepaymentBanner/financeRepaymentBanner';
import { FinanceRepaymentBannerEntity } from '../components/widgets/financeRepaymentBanner/financeRepaymentBanner.entity';

import HowItWorks from '../components/widgets/howItWorks/howItWorks';
import { HowItWorkEntity } from '../components/widgets/howItWorks/howItWorks.entity';

import CeoMessage from '../components/widgets/executiveManagment/ceoMessage'
import { ExecutiveManagmentEntity } from './../components/widgets/executiveManagment/executiveManagment.entity';

import Leadership from '../components/widgets/leadership/leadership';
import { LeadershipEntity } from '../components/widgets/leadership/leadership.entity';

import BreadcrumbCustomView from '../components/widgets/breadcrumb/breadcrumbCustom';

const customWidgetRegistry: WidgetRegistry = {
  widgets: {
    Hero: {
      componentType: Hero,
      entity: HeroEntity,
      ssr: true,
      editorMetadata: { Title: 'Hero' },
      views: {
        Default: { Title: 'Default', ViewFunction: Hero },
      },
    },
    CardSection: {
      componentType: ScrollableCards,
      entity: CardSectionEntity,
      ssr: true,
      editorMetadata: { Title: 'Card Section' },
      views: {
        Default: { Title: 'Grid', ViewFunction: ScrollableCards },
        Scrollable: { Title: 'Scrollable', ViewFunction: GridOfCards },
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
    HowItWorks: {
      componentType: HowItWorks,
      entity: HowItWorkEntity,
      ssr: true,
      editorMetadata: { Title: 'How It Works' },
      views: {
        Default: { Title: 'Default', ViewFunction: HowItWorks },
      },
    },
    ExecutiveManagment: {
      componentType: CeoMessage,
      entity: ExecutiveManagmentEntity,
      ssr: true,
      editorMetadata: { Title: 'Executive managment' },
      views: {
        Default: { Title: 'CEO Message', ViewFunction: CeoMessage },
      },
    },
    Leadership: {
      componentType: Leadership,
      entity: LeadershipEntity,
      ssr: true,
      editorMetadata: { Title: 'Leadership' },
      views: {
        Default: { Title: 'Default', ViewFunction: Leadership },
      },
    },
  },
};

addWidgetViews(defaultWidgetRegistry, 'SitefinityBreadcrumb', {
  Custom: { Title: 'Custom', ViewFunction: BreadcrumbCustomView },
});

customWidgetRegistry.widgets = {
  ...defaultWidgetRegistry.widgets,
  ...customWidgetRegistry.widgets,
};

export const widgetRegistry: WidgetRegistry = initRegistry(customWidgetRegistry);
export default widgetRegistry;

