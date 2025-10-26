import { WidgetEntity } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';
import { WidgetLabel } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-label';
import { ViewSelector } from '@progress/sitefinity-widget-designers-sdk/decorators/view-selector';

@WidgetEntity('Form', 'Form')
export class FormEntity {
  @ContentSection('Design', 0)
  @DisplayName('View')
  @ViewSelector([{ Name: 'Default', Title: 'Default', Value: 'Default' }])
  ViewName?: string;

  @ContentSection('Content', 0)
  @DisplayName('Form item')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.Form.Form',
    AllowMultipleItemsSelection: false,
  })
  Form?: any;

  @WidgetLabel()
  SfWidgetLabel = 'Form';
}

