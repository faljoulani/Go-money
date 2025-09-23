import { WidgetEntity } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { DataType } from '@progress/sitefinity-widget-designers-sdk/decorators/data-type';
import { Placeholder } from '@progress/sitefinity-widget-designers-sdk/decorators/placeholder';
import { WidgetLabel } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-label';
// import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';

@WidgetEntity('FinanceCalculator', 'Finance Calculator')
export class FinanceCalculatorEntity {
  @ContentSection('Heading & CTA', 0)
  @DisplayName('Title')
  @DataType('string')
  Title?: string;

  @ContentSection('Heading & CTA', 0)
  @DisplayName('CTA text')
  @DataType('string')
  CtaText?: string;

  @ContentSection('Heading & CTA', 0)
  @DisplayName('CTA URL')
  @DataType('link')
  CtaUrl?: any;

  @ContentSection('Heading & CTA', 1)
  @DisplayName('Note title')
  @DataType('string')
  NoteTitle?: string;

  @ContentSection('Heading & CTA', 1)
  @DisplayName('Note description')
  @DataType('string')
  @Placeholder('This calculation is for guidance only...')
  NoteDescription?: string;

  @ContentSection('Labels', 0)
  @DisplayName('Nationality label')
  @DataType('string')
  NationalityLabelChoices?: string;

  @ContentSection('Labels', 0)
  @DisplayName('Employer type label')
  @DataType('string')
  EmployerTypeLabel?: string;

  @ContentSection('Labels', 0)
  @DisplayName('Date of birth label')
  @DataType('string')
  DateOfBirthLabel?: string;

  @ContentSection('Labels', 0)
  @DisplayName('Length of services label')
  @DataType('string')
  LengthOfServicesLabel?: string;

  @ContentSection('Labels', 0)
  @DisplayName('Monthly salary label')
  @DataType('string')
  MonthlySalaryLabel?: string;

  @ContentSection('Labels', 0)
  @DisplayName('Requested finance amount label')
  @DataType('string')
  RequestedFinanceAmountLabel?: string;

  @ContentSection('Labels', 0)
  @DisplayName('Number of installments label')
  @DataType('string')
  NumberOfInstallmentsLabel?: string;

  @ContentSection('Labels', 0)
  @DisplayName('Total monthly expenses label')
  @DataType('string')
  TotalMonthlyExpensesLabel?: string;

  @ContentSection('Labels', 0)
  @DisplayName('Mortgage liabilities label')
  @DataType('string')
  MortgageLiabilitiesLabel?: string;

  @ContentSection('Labels', 0)
  @DisplayName('Monthly financial liabilities label')
  @DataType('string')
  MonthlyFinancialLiabilitiesLabel?: string;

  @ContentSection('Placeholders', 0)
  @DisplayName('Employer placeholder')
  @DataType('string')
  EmployerPlaceholder?: string;

  @ContentSection('Placeholders', 0)
  @DisplayName('Date of birth placeholder')
  @DataType('string')
  DateOfBirthPlaceholder?: string;

  @ContentSection('Placeholders', 0)
  @DisplayName('Length of services placeholder')
  @DataType('string')
  LengthOfServicesPlaceholder?: string;

  @ContentSection('Placeholders', 0)
  @DisplayName('Monthly salary placeholder')
  @DataType('string')
  MonthlySalaryPlaceholder?: string;

  @ContentSection('Placeholders', 0)
  @DisplayName('Requested finance amount placeholder')
  @DataType('string')
  RequestedFinanceAmountPlaceholder?: string;

  @ContentSection('Placeholders', 0)
  @DisplayName('Number of installments placeholder')
  @DataType('string')
  NumberOfInstallmentsPlaceholder?: string;

  @ContentSection('Placeholders', 0)
  @DisplayName('Total monthly expenses placeholder')
  @DataType('string')
  TotalMonthlyExpensesPlaceholder?: string;

  @ContentSection('Placeholders', 0)
  @DisplayName('Mortgage liabilities placeholder')
  @DataType('string')
  MortgageLiabilitiesPlaceholder?: string;

  @ContentSection('Placeholders', 0)
  @DisplayName('Monthly financial liabilities placeholder')
  @DataType('string')
  MonthlyFinancialLiabilitiesPlaceholder?: string;

  @ContentSection('Helper texts', 0)
  @DisplayName('Requested finance amount helper/validation')
  @DataType('string')
  RequestedFinanceAmountValidation?: string;

  @ContentSection('Helper texts', 0)
  @DisplayName('Number of installments helper/validation')
  @DataType('string')
  NumberOfInstallmentsValidation?: string;

  @ContentSection('Tooltips', 0)
  @DisplayName('Employer type tooltip')
  @DataType('string')
  EmployerTypePopup?: string;

  @ContentSection('Tooltips', 0)
  @DisplayName('Date of birth tooltip')
  @DataType('string')
  DateOfBirthPopup?: string;

  @ContentSection('Tooltips', 0)
  @DisplayName('Length of services tooltip')
  @DataType('string')
  LengthOfServicesPopup?: string;

  @ContentSection('Tooltips', 0)
  @DisplayName('Monthly salary tooltip')
  @DataType('string')
  MonthlySalaryPopup?: string;

  @ContentSection('Tooltips', 0)
  @DisplayName('Requested finance amount tooltip')
  @DataType('string')
  RequestedFinanceAmountPopup?: string;

  @ContentSection('Tooltips', 0)
  @DisplayName('Number of installments tooltip')
  @DataType('string')
  NumberOfInstallmentsPopup?: string;

  @ContentSection('Tooltips', 0)
  @DisplayName('Total monthly expenses tooltip')
  @DataType('string')
  TotalMonthlyExpensesPopup?: string;

  @ContentSection('Tooltips', 0)
  @DisplayName('Mortgage liabilities tooltip')
  @DataType('string')
  MortgageLiabilitiesPopup?: string;

  @ContentSection('Tooltips', 0)
  @DisplayName('Monthly financial liabilities tooltip')
  @DataType('string')
  MonthlyFinancialLiabilitiesPopup?: string;

  @ContentSection('Choices', 0)
  @DisplayName('Nationality choices')
  @DataType('enumerable', 'string')
  NationalityChoices?: string[];

  @ContentSection('Choices', 0)
  @DisplayName('Employer choices')
  @DataType('enumerable', 'string')
  EmployerChoices?: string[];

  @ContentSection('Choices', 0)
  @DisplayName('Length of services choices')
  @DataType('enumerable', 'string')
  LengthOfServicesChoices?: string[];

  // @ContentSection('Messages', 0)
  // @DisplayName('Success message (eligible)')
  // @Content({
  //   Type: 'Telerik.Sitefinity.DynamicTypes.Model.Message.Message',
  // })
  // SuccessMessage?: any;

  // @ContentSection('Messages', 1)
  // @DisplayName('Not eligible message')
  // @Content({
  //   Type: 'Telerik.Sitefinity.DynamicTypes.Model.Message.Message',
  // })
  // FailMessage?: any;
    
  @WidgetLabel()
  SfWidgetLabel = 'Finance Calculator';
}
