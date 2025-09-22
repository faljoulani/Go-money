import {
  ContentSection,
  DataType,
  DisplayName,
  Placeholder,
  WidgetEntity,
  WidgetLabel,
} from '@progress/sitefinity-widget-designers-sdk/decorators';

@WidgetEntity('LegalDocument', 'Legal Document')
export class LegalDocumentEntity {
  @ContentSection('Content', 0)
  @DisplayName('Legal document')
  @DataType('content', 'single') 
  @Placeholder('Pick a LegalDocument item')
  LegalDoc?: any;

  @ContentSection('Options', 0)
  @DisplayName('Show numbering (1, 2, 3...)')
  @DataType('boolean')
  ShowNumbering?: boolean;

  @ContentSection('Options', 0)
  @DisplayName('Make left nav sticky')
  @DataType('boolean')
  StickyNav?: boolean;

  @ContentSection('Options', 0)
  @DisplayName('Scroll offset (px) for fixed headers')
  @DataType('number')
  ScrollOffset?: number;

  @WidgetLabel()
  SfWidgetLabel = 'Legal Document';
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
