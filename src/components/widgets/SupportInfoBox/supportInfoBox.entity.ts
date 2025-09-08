import { WidgetEntity } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';
import { WidgetLabel } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-label';
import { ViewSelector } from '@progress/sitefinity-widget-designers-sdk/decorators/view-selector';

@WidgetEntity('SupportInfoBox', 'Support Info Box')
export class SupportInfoBoxEntity {
  @ContentSection('Content', 0)
  @DisplayName('SupportInfoBox item')
  @Content({
    
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.SupportInfoBox.SupportInfoBox',
    AllowMultipleItemsSelection: false,
  })
  SupportInfoBox?: any;

  @WidgetLabel()
  SfWidgetLabel = 'SupportInfoBox';

  @ContentSection('Design', 1)
  @DisplayName('View')
  @ViewSelector([{ Name: 'Default', Title: 'Default', Value: 'Default' }])
  ViewName?: string;
}
