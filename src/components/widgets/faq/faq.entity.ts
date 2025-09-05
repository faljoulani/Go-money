import { WidgetEntity } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';
import { WidgetLabel } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-label';
import { ViewSelector } from '@progress/sitefinity-widget-designers-sdk/decorators/view-selector';

@WidgetEntity('FaqSection', 'FAQ Section')
export class FaqSectionEntity {
  @WidgetLabel()
  SfWidgetLabel = 'FAQ Section';

  @ContentSection('Content', 0)
  @DisplayName('FAQ Root')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.FAQs.FAQS',
    AllowMultipleItemsSelection: false,
    RetrieveData: true
  } as any)
  FaqRoot?: any;

  @ContentSection('Content', 1)
  @DisplayName('FAQ Categories')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.FAQs.FaqCategory',
    AllowMultipleItemsSelection: true,
    RetrieveData: true
  } as any)
  FaqCategories?: any;

  @ContentSection('Design', 2)
  @DisplayName('View')
  @ViewSelector([
    { Name: 'Default', Title: 'Default', Value: 'Default' },
    { Name: 'Accordion', Title: 'Accordion', Value: 'Accordion' },
  ])
  ViewName?: string;
}
