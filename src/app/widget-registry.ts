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

import Footer from '../components/widgets/footer/Footer-template';
import { FooterEntity } from '../components/widgets/footer/Footer.entity';

import FinanceRepaymentBanner from '../components/widgets/financeRepaymentBanner/financeRepaymentBanner';
import { FinanceRepaymentBannerEntity } from '../components/widgets/financeRepaymentBanner/financeRepaymentBanner.entity';

import HowItWorks from '../components/widgets/howItWorks/howItWorks';
import { HowItWorkEntity } from '../components/widgets/howItWorks/howItWorks.entity';

import faqSection from '../components/widgets/faq/faq';
import { FaqSectionEntity } from '../components/widgets/faq/faq.entity';
import BoardReport from '../components/widgets/boardReport/boardReport';
import { BoardReportEntity } from '../components/widgets/boardReport/boardReport.entity';

import BreadcrumbCustomView from '../components/widgets/breadcrumb/breadcrumbCustom';

import StackLayout from '../components/widgets/layouts/stackLayout';

import ExpandBox from '../components/widgets/expandBox/expandbox';
import { ExpandBoxEntity } from '../components/widgets/expandBox/expandbox.entity';

import ContactSubscription from '../components/widgets/contactSubscription/contactSubscription';
import { ContactSubscriptionEntity } from '../components/widgets/contactSubscription/ContactSubscription.entity';
import SmartFeatures from '../components/widgets/smartFeatures/smartFeatures';

const customWidgetRegistry: WidgetRegistry = {
  widgets: {
    Hero: {
      componentType: Hero,
      entity: HeroEntity,
      ssr: true,
      editorMetadata: { Title: 'Hero' },
      views: {
        Default: { Title: 'Default', ViewFunction: Hero },
        Simple: { Title: 'Simple', ViewFunction: Hero },
      },
    },
    CardSection: {
      componentType: GridOfCards,
      entity: CardSectionEntity,
      ssr: true,
      editorMetadata: { Title: 'Card Section' },
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
    StackLayout: {
      componentType: StackLayout,
      ssr: true,
      editorMetadata: { Title: 'Stack Layout (Column)', Category: 'Layout & Presets' },
      views: {
        Default: { Title: 'Default', ViewFunction: StackLayout },
      },
    },
    FAQ: {
      componentType: faqSection,
      entity: FaqSectionEntity,
      ssr: true,
      editorMetadata: { Title: 'FAQ' },
      views: {
        Default: { Title: 'Default', ViewFunction: faqSection },
      },
    },
    FinanceRepaymentBanner: {
      componentType: FinanceRepaymentBanner,
      entity: FinanceRepaymentBannerEntity,
      ssr: true,
      editorMetadata: { Title: 'FinanceRepaymentBanner' },
      views: {
        Default: { Title: 'Default', ViewFunction: FinanceRepaymentBanner },
      },
    },
    ExpandBox: {
      componentType: ExpandBox,
      entity: ExpandBoxEntity,
      ssr: true,
      editorMetadata: { Title: 'ExpandBox' },
      views: {
        Default: { Title: 'Default', ViewFunction: ExpandBox },
      },
    },
    SmartFeatures: {
      componentType: SmartFeatures,
      entity: CardSectionEntity,
      ssr: true,
      editorMetadata: { Title: 'SmartFeatures' },
      views: {
        Default: { Title: 'Default', ViewFunction: SmartFeatures },
      },
    },
    ContactSubscription: {
      componentType: ContactSubscription,
      entity: ContactSubscriptionEntity,
      ssr: true,
      editorMetadata: { Title: 'ContactSubscription' },
      views: {
        Default: { Title: 'Default', ViewFunction: ContactSubscription },
      },
    },
    BoardReport: {
      componentType: BoardReport,
      entity: BoardReportEntity,
      ssr: true,
      editorMetadata: { Title: 'Board Report' },
      views: {
        Default: { Title: 'Default', ViewFunction: BoardReport },
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

