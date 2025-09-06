import { WidgetEntity } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';
import { WidgetLabel } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-label';
import { ViewSelector } from '@progress/sitefinity-widget-designers-sdk/decorators/view-selector';

/**
 * Lets an editor pick ONE MainNavigation dynamic item.
 * Type: Telerik.Sitefinity.DynamicTypes.Model.MainNavigation.Mainnavigation
 */
@WidgetEntity('MainNavigation', 'MainNavigation')
export class MainNavigationEntity {
  @ContentSection('Content', 0)
  @DisplayName('Main navigation item')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.MainNavigation.Mainnavigation',
    AllowMultipleItemsSelection: false,
  })
  MainNavigation?: any;

  @WidgetLabel()
  SfWidgetLabel = 'MainNavigation';

  @ContentSection('Design', 1)
  @DisplayName('View')
  @ViewSelector([
    { Name: 'Default', Title: 'Default', Value: 'Default' },
    { Name: 'Compact', Title: 'Compact', Value: 'Compact' },
  ])
  ViewName?: string;
}
