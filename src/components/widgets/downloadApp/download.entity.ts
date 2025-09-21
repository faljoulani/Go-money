import { WidgetEntity } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';
import { WidgetLabel } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-label';
import { ViewSelector } from '@progress/sitefinity-widget-designers-sdk/decorators/view-selector';

/**
* Download App widget entity
*
* Dynamic type: 'Telerik.Sitefinity.DynamicTypes.Model.DownloadApp.Downloadapp'
* Fields available on the content item (Module Builder):
*  - Title (Short text)
*  - description (Short text)
*  - ForegroundImage (Related media)
*  - Certifications (Related data)
*  - stores (Related data)
*/
@WidgetEntity('DownloadApp', 'Download App')
export class DownloadEntity {
  @ContentSection('Content', 0)
  @DisplayName('Download App item')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.DownloadApp.Downloadapp',
    AllowMultipleItemsSelection: false,
  })
  DownloadApp?: any;

  @WidgetLabel()
  SfWidgetLabel = 'Download App';

  @ContentSection('Design', 1)
  @DisplayName('View')
  @ViewSelector([
      { Title: 'DownloadApp', Value: 'DownloadApp' },
      { Title: 'Minimized DownloadApp', Value: 'MinimizedDownloadApp' },
    ])
  ViewName?: string;
}