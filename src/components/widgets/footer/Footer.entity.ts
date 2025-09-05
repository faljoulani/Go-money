import {
  WidgetEntity,
} from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';
import { WidgetLabel } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-label';
import { ViewSelector } from '@progress/sitefinity-widget-designers-sdk/decorators/view-selector';

/**
 * Lets an editor pick ONE Footer dynamic item.
 * Type: Telerik.Sitefinity.DynamicTypes.Model.Footer.Footer
 * (Change if your internal name differs)
 */
@WidgetEntity('Footer', 'Footer')
export class FooterEntity {
  @ContentSection('Content', 0)
  @DisplayName('Footer item')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.Footer.Footer', // <-- adjust if needed
    AllowMultipleItemsSelection: false,
    RetrieveData: true,
  } as any)
  Footer?: any;

  @WidgetLabel()
  SfWidgetLabel = 'Footer';

  @ContentSection('Design', 1)
  @DisplayName('View')
  @ViewSelector([
    { Name: 'Default', Title: 'Default', Value: 'Default' },
    { Name: 'Compact', Title: 'Compact', Value: 'Compact' },
  ])
  ViewName?: string;
}
