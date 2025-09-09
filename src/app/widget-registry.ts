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

import SmartFeatures from '../components/widgets/smartFeatures/smartFeatures';
import {SmartFeaturesEntity} from '../components/widgets/smartFeatures/card.entity';

import GridOfCards from '../components/widgets/cards/gridOfCards';
import ScrollableCards from '../components/widgets/cards/scrollableCards';

import Footer from '../components/widgets/footer/Footer-template';
import { FooterEntity } from '../components/widgets/footer/Footer.entity';

import FinanceRepaymentBanner from '../components/widgets/financeRepaymentBanner/financeRepaymentBanner';
import { FinanceRepaymentBannerEntity } from '../components/widgets/financeRepaymentBanner/financeRepaymentBanner.entity';

import HowItWorks from '../components/widgets/howItWorks/howItWorks';
import { HowItWorkEntity } from '../components/widgets/howItWorks/howItWorks.entity';

import CeoMessage from '../components/widgets/executiveManagment/ceoMessage';
import { ExecutiveManagmentEntity } from './../components/widgets/executiveManagment/executiveManagment.entity';

import Leadership from '../components/widgets/leadership/leadership';
import { LeadershipEntity } from '../components/widgets/leadership/leadership.entity';

import faq from '../components/widgets/faq/faq';
import { FaqSectionEntity } from '../components/widgets/faq/faq.entity';

import BoardReport from '../components/widgets/boardReport/boardReport';
import { BoardReportEntity } from '../components/widgets/boardReport/boardReport.entity';

import ContactBox from '../components/widgets/gotQuestions/contactBox';
import { ContactBoxEntity } from '../components/widgets/gotQuestions/contactBox.entity';

import BreadcrumbCustomView from '../components/widgets/breadcrumb/breadcrumbCustom';
import ExpandBox from '../components/widgets/expandBox/expandbox';
import { ExpandBoxEntity } from '../components/widgets/expandBox/expandbox.entity';

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
          Simple: { Title: 'Simple', ViewFunction: HowItWorks }
      },
    },
    FAQ: {
      componentType: faq,
      entity: FaqSectionEntity,
      ssr: true,
      editorMetadata: { Title: 'FAQ' },
      views: {
        Default: { Title: 'Default', ViewFunction: faq },
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
    SmartFeatures: {
      componentType: SmartFeatures,
      entity: SmartFeaturesEntity,
      ssr: true,
      editorMetadata: { Title: 'Smart Features' },
      views: {
        Default: { Title: 'Default', ViewFunction: SmartFeatures },
        CardsRight: { Title: 'Cards Right', ViewFunction: SmartFeatures },
        CardsWithIcon: { Title: 'Cards With Icon', ViewFunction: SmartFeatures },
        'Minimal Download Now': { Title: 'Minimal Download Now', ViewFunction: SmartFeatures },
      },
    },
    CeoMessage: {
      componentType: CeoMessage,
      entity: ExecutiveManagmentEntity,
      ssr: true,
      editorMetadata: { Title: 'CEO Message' },
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
    GotQuestions: {
      componentType: ContactBox,
      entity: ContactBoxEntity,
      ssr: true,
      editorMetadata: { Title: 'Contact Box' },
      views: {
        Default: { Title: 'CTA (Default)', ViewFunction: ContactBox },
        EmailAndPhone: { Title: 'Email And Phone', ViewFunction: ContactBox },
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

