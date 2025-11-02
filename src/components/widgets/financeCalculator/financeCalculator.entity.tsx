import { WidgetEntity } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';
import { WidgetLabel } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-label';

@WidgetEntity('FinanceCalculator', 'Finance Calculator')
export class FinanceCalculatorEntity {
  @ContentSection('Configuration', 0)
  @DisplayName('Finance details')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.FinanceDetails.FinanceDetails',
    AllowMultipleItemsSelection: false,
  })
  FinanceDetails?: any;


  @WidgetLabel()
  SfWidgetLabel = 'Finance Calculator';
}

