import { WidgetEntity } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';
import { WidgetLabel } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-label';
import { ViewSelector } from '@progress/sitefinity-widget-designers-sdk/decorators/view-selector';

@WidgetEntity('ExpandBox', 'ExpandBox')
export class HighlightBlockEntity {
  @ContentSection('Content', 0)
  @DisplayName('ExpandBox item')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.ExpandBox.ExpandBox',
    AllowMultipleItemsSelection: false,
  })
  ExpandBox?: any;

  @WidgetLabel()
  SfWidgetLabel = 'ExpandBox';

  @ContentSection('Design', 1)
  @DisplayName('View')
  @ViewSelector([
    { Name: 'Default', Title: 'Default', Value: 'Default' },
    { Name: 'ContentWithImage', Title: 'Content With Image', Value: 'ContentWithImage' },
    { Name: 'ContentWithoutImage', Title: 'Content Without Image', Value: 'ContentWithoutImage' },
  ])
  ViewName?: string;
}

