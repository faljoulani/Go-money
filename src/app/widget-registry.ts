import {
  WidgetRegistry,
  initRegistry,
  addWidgetViews,
  defaultWidgetRegistry,
} from '@progress/sitefinity-nextjs-sdk';
import Hero from '../components/widgets/hero/hero';
import { HeroEntity } from '../components/widgets/hero/hero.entity';

import MainNavigation from '../components/widgets/mainNavigation/mainNavigation';
import { MainNavigationEntity } from '../components/widgets/mainNavigation/mainNavigation.entity';

import { CardSectionEntity } from '../components/widgets/cards/card.entity';

// import DownloadApp from '../components/widgets/downloadApp/downloadApp';
// import { DownloadAppEntity } from '../components/widgets/downloadApp/downloadApp.entity';

import DownloadApp from '../components/widgets/downloadApp/download';
import { DownloadAppEntity } from '../components/widgets/downloadApp/downloadApp.entity';

import Download from '../components/widgets/downloadApp/download';
import { DownloadEntity } from '../components/widgets/downloadApp/download.entity';

import GridOfCards from '../components/widgets/cards/gridOfCards';

import Footer from '../components/widgets/footer/Footer-template';
import { FooterEntity } from '../components/widgets/footer/Footer.entity';

import HowItWorks from '../components/widgets/howItWorks/howItWorks';
import { HowItWorkEntity } from '../components/widgets/howItWorks/howItWorks.entity';

import faq from '../components/widgets/faq/faq';
import { FaqSectionEntity } from '../components/widgets/faq/faq.entity';

import BoardReport from '../components/widgets/boardReport/boardReport';
import { BoardReportEntity } from '../components/widgets/boardReport/boardReport.entity';

import ContactBox from '../components/widgets/gotQuestions/contactBox';
import { ContactBoxEntity } from '../components/widgets/gotQuestions/contactBox.entity';

import BreadcrumbCustomView from '../components/widgets/breadcrumb/BreadcrumbCustom';

import HighlightBlockDefault from '../components/widgets/highlightBlock/highlightBlock';
import { HighlightBlockEntity } from '../components/widgets/highlightBlock/highlightBlock.entity';

import SupportInfoBox from '../components/widgets/SupportInfoBox/supportInfoBox';
import { SupportInfoBoxEntity } from '../components/widgets/SupportInfoBox/supportInfoBox.entity';

import ContactForm from '../components/widgets/contactForm/contactForm';
import { FormEntity } from '../components/widgets/contactForm/contactForm.entity';

import TwoColumnLayout from '../components/widgets/layouts/twoColumnLayout';

import { StackLayout } from '../components/widgets/layouts/stackLayout';

import ContactSubscription from '../components/widgets/contactSubscription/contactSubscription';
import { ContactSubscriptionEntity } from '../components/widgets/contactSubscription/contactSubscription.entity';

import FinanceBanner from '../components/widgets/financeRepaymentBanner/financeBanner';
import { FinanceBannerEntity } from '../components/widgets/financeRepaymentBanner/financeBanner.entity';
import FinanceCalculator from '../components/widgets/financeCalculator/financeCalculator';
import { FinanceCalculatorEntity } from '../components/widgets/financeCalculator/financeCalculator.entity';

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
    Layout: {
      componentType: StackLayout,
      ssr: true,
      editorMetadata: { Title: 'Stack Layout' },
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
      componentType: FinanceBanner,
      entity: FinanceBannerEntity,
      ssr: true,
      editorMetadata: { Title: 'Finance banner' },
      views: {
        Default: { Title: 'Finance Banner', ViewFunction: FinanceBanner },
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
    // DownloadApp: {
    //   componentType: DownloadApp,
    //   entity: DownloadEntity,
    //   ssr: true,
    //   editorMetadata: { Title: 'DownloadApp' },
    // },
    Download: {
      componentType: DownloadApp,
      entity: DownloadEntity,
      ssr: true,
      editorMetadata: { Title: 'DownloadApp' },
    },
    FinanceBanner: {
      componentType: FinanceBanner,
      entity: FinanceBannerEntity,
      ssr: true,
      editorMetadata: { Title: 'FinanceBanner' },
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
    SupportInfoBox: {
      componentType: SupportInfoBox,
      entity: SupportInfoBoxEntity,
      ssr: true,
      editorMetadata: { Title: 'SupportInfoBox' },
      views: {
        Default: { Title: 'Default', ViewFunction: SupportInfoBox },
      },
    },
    TwoColumnLayout: {
      componentType: TwoColumnLayout,
      ssr: true,
      editorMetadata: {
        Title: 'Two Column Layout',
        Category: 'Layout',
        Section: 'Custom',
        IconName: 'section',
        Order: 50,
      },
    },
    StackLayout: {
      componentType: StackLayout,
      ssr: true,
      editorMetadata: {
        Title: 'Stack Layout',
        Category: 'Layout',
        Section: 'Custom',
        IconName: 'section',
        Order: 50,
      },
      views: {
        Default: { Title: 'Default', ViewFunction: StackLayout },
      },
    },
    ContactSubscription: {
      componentType: ContactSubscription,
      entity: ContactSubscriptionEntity,
      ssr: true,
      editorMetadata: { Title: 'Contact Subscription' },
      views: {
        Default: { Title: 'Default', ViewFunction: ContactSubscription },
      },
    },
    ContactForm: {
      componentType: ContactForm,
      entity: FormEntity,
      ssr: true,
      editorMetadata: { Title: 'ContactForm' },
      views: {
        Default: { Title: 'Default', ViewFunction: ContactForm },
      },
    },
    FinanceCalculator: {
      componentType: FinanceCalculator,
      entity: FinanceCalculatorEntity,
      ssr: true,
      editorMetadata: { Title: 'Finance Calculator' },
    },
  },
};
// (customWidgetRegistry.widgets as any).StackLayout.isLayout = true;

addWidgetViews(defaultWidgetRegistry, 'SitefinityBreadcrumb', {
  Custom: { Title: 'Custom', ViewFunction: BreadcrumbCustomView },
});

customWidgetRegistry.widgets = {
  ...defaultWidgetRegistry.widgets,
  ...customWidgetRegistry.widgets,
};

export const widgetRegistry: WidgetRegistry = initRegistry(customWidgetRegistry);
export default widgetRegistry;

