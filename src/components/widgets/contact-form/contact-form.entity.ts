import { WidgetEntity } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { DefaultValue } from '@progress/sitefinity-widget-designers-sdk/decorators/default-value';
import { Category, PropertyCategory } from '@progress/sitefinity-widget-designers-sdk/decorators/category';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { ContentSectionTitles } from '@progress/sitefinity-widget-designers-sdk'; // <-- from ROOT, not decorators


@WidgetEntity('ContactForm', 'Contact us (POC)')
export class ContactFormEntity {
  @Category(PropertyCategory.Advanced)
  @ContentSection(ContentSectionTitles.LabelsAndMessages)
  @DisplayName('Form header')
  @DefaultValue('Contact us')
  Header: string = 'Contact us';

  @Category(PropertyCategory.Advanced)
  @ContentSection(ContentSectionTitles.LabelsAndMessages)
  @DisplayName('Submit button')
  @DefaultValue('Send')
  SubmitButtonLabel: string = 'Send';
}
