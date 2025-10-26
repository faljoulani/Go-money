// widgets/legalDocument/legalDocument.entity.ts
import {
  WidgetEntity,
  ContentSection,
  DisplayName,
  WidgetLabel,
} from '@progress/sitefinity-widget-designers-sdk/decorators';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';
import { DataType } from '@progress/sitefinity-widget-designers-sdk/decorators/data-type';

@WidgetEntity('LegalDocument', 'Legal Document')
export class LegalDocumentEntity {
  @WidgetLabel()
  SfWidgetLabel = 'Legal Document';

  @ContentSection('Content', 0)
  @DisplayName('Legal document title')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.LegalDocument.Legaldocument',
        AllowMultipleItemsSelection: false,

  })
  LegalDocRoot?: any;

  @ContentSection('Content', 1)
  @DisplayName('Sections (optional – pick subset to show)')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.LegalDocument.Sections',
    AllowMultipleItemsSelection: true,
  })
  SectionsSelection?: any;

}

export type LegalSection = {
  Id: string;
  SectionHeader: string;
  Description?: string;
  Order?: number;
  ParentId?: string;
};

export type LegalDocItem = {
  Id: string;
  Title: string;
};

