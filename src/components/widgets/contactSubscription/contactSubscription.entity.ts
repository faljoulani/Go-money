import {
  WidgetEntity,
} from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';
import { WidgetLabel } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-label';
import { ViewSelector } from '@progress/sitefinity-widget-designers-sdk/decorators/view-selector';

/**
 * Lets an editor pick ONE "Contact Subscription" item.
 * Type: Telerik.Sitefinity.DynamicTypes.Model.ContactSubscription.Contactsubscription
 */
@WidgetEntity('ContactSubscription', 'Contact Subscription')
export class ContactSubscriptionEntity {
  @ContentSection('Content', 0)
  @DisplayName('Contact subscription')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.ContactSubscription.Contactsubscription',
    AllowMultipleItemsSelection: false,
    RetrieveData: true,
  })
  ContactSubscription?: any;

  @WidgetLabel()
  SfWidgetLabel = 'Contact Subscription';

  @ContentSection('Design', 1)
  @DisplayName('View')
  @ViewSelector([{ Name: 'Default', Title: 'Default', Value: 'Default' }])
  ViewName?: string;
}
