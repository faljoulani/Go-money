import { WidgetEntity } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';
import { WidgetLabel } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-label';
import { ViewSelector } from '@progress/sitefinity-widget-designers-sdk/decorators/view-selector';

@WidgetEntity('Hero', 'Hero')
export class HeroEntity {
    @ContentSection('Content', 0)
    @DisplayName('Hero item')
    @Content({
        Type: 'Telerik.Sitefinity.DynamicTypes.Model.Banner.Banner',
        AllowMultipleItemsSelection: false,
        RetrieveData: true
    })
    Hero?: any;

    @WidgetLabel()
    SfWidgetLabel = 'Hero';

    @ContentSection('Design', 1)
    @DisplayName('View')
    @ViewSelector([
        { Name: 'Default', Title: 'Default', Value: 'Default' },
        { Name: 'Background', Title: 'Background', Value: 'Background' }
    ])
    ViewName?: string;
}
