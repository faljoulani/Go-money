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

import DownloadApp from '../components/widgets/downloadApp/downloadApp';
import { DownloadAppEntity } from '../components/widgets/downloadApp/downloadApp.entity';

import GridOfCards from '../components/widgets/cards/gridOfCards';

import Footer from '../components/widgets/footer/Footer-template';
import { FooterEntity } from '../components/widgets/footer/Footer.entity';

import FinanceRepaymentBanner from '../components/widgets/financeRepaymentBanner/financeRepaymentBanner';
import { FinanceRepaymentBannerEntity } from '../components/widgets/financeRepaymentBanner/financeRepaymentBanner.entity';

import HowItWorks from '../components/widgets/howItWorks/howItWorks';
import { HowItWorkEntity } from '../components/widgets/howItWorks/howItWorks.entity';


import faq from '../components/widgets/faq/faq';
import { FaqSectionEntity } from '../components/widgets/faq/faq.entity';

import BoardReport from '../components/widgets/boardReport/boardReport';
import { BoardReportEntity } from '../components/widgets/boardReport/boardReport.entity';

import ContactBox from '../components/widgets/gotQuestions/contactBox';
import { ContactBoxEntity } from '../components/widgets/gotQuestions/contactBox.entity';

import BreadcrumbCustomView from '../components/widgets/breadcrumb/breadcrumbCustom';

import ExpandBox from '../components/widgets/expandBox/expandbox';
import { ExpandBoxEntity } from '../components/widgets/expandBox/expandbox.entity';

import HighlightBlockDefault from '../components/widgets/highlightBlock/highlightBlock';
import { HighlightBlockEntity } from '../components/widgets/highlightBlock/highlightBlock.entity';


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
    Cards: {
      componentType: GridOfCards,
      entity: CardSectionEntity,
      ssr: true,
      editorMetadata: { Title: 'Cards' },
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
        Simple: { Title: 'Simple', ViewFunction: HowItWorks },
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
    DownloadApp: {
      componentType: DownloadApp,
      entity: DownloadAppEntity,
      ssr: true,
      editorMetadata: { Title: 'DownloadApp' },
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
    HighlightBlock: {
      componentType: HighlightBlockDefault,
      entity: HighlightBlockEntity,
      ssr: true,
      editorMetadata: { Title: 'HighlightBlock' },
      views: {
        Default: { Title: 'Default', ViewFunction: HighlightBlockDefault },
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

