import {
  WidgetEntity,
} from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';
import { WidgetLabel } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-label';
import { ViewSelector } from '@progress/sitefinity-widget-designers-sdk/decorators/view-selector';

/**
 * Lets an editor pick ONE "How it works" section item.
 * Type: Telerik.Sitefinity.DynamicTypes.Model.HowItWorks.Howitworkssection
 */
@WidgetEntity('HowItWork', 'How it works')
export class HowItWorkEntity {
  @ContentSection('Content', 0)
  @DisplayName('How it works section')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.HowItWorks.Howitworkssection',
    AllowMultipleItemsSelection: false,
    RetrieveData: true,
  })
  HowItWork?: any;

  @WidgetLabel()
  SfWidgetLabel = 'How it works';

  @ContentSection('Design', 1)
  @DisplayName('View')
  @ViewSelector([
    { Name: 'Default', Title: 'Default', Value: 'Default' }
  ])
  ViewName?: string;
}
