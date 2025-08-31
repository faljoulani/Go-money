import { WidgetEntity } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';
import { WidgetLabel } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-label';
import { ViewSelector } from '@progress/sitefinity-widget-designers-sdk/decorators/view-selector';

@WidgetEntity('CardSection', 'Card Section')
export class CardSectionEntity {
  @ContentSection('Content', 0)
  @DisplayName('Cards')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.Cards.Card',
    AllowMultipleItemsSelection: true,
    RetrieveData: true
  })
  Cards?: any;

  @WidgetLabel()
  SfWidgetLabel = 'Card Section';

  @ContentSection('Design', 1)
  @DisplayName('View')

@ViewSelector([
  { Name: 'Default', Title: 'Default', Value: 'Default' },
  { Name: 'CardsRight', Title: 'Cards Right', Value: 'CardsRight' },
  { Name: 'CardsWithIcon', Title: 'Cards With Icon', Value: 'CardsWithIcon' } // ✅ أضف هذا
])


  ViewName?: string;

  @ContentSection('Parent Card List Info', 2)
  @DisplayName('Card List Info')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.Cards.Cards',
    AllowMultipleItemsSelection: false,
    RetrieveData: true
  })
  CardListData?: any;
}
