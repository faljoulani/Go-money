import React from 'react';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { FinanceCalculatorEntity } from './financeCalculator.entity';
import FinanceCalculatorClient from './financeCalculator.client';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { resolveSitefinitySelection, mergeClasses } from '../../../utils/utils';

const asString = (v: any) => (v == null ? '' : String(v));

const FINANCE_DETAILS_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.FinanceDetails.FinanceDetails';
const EMPLOYER_TYPE =
  'Telerik.Sitefinity.DynamicTypes.Model.EmployerTypeDropList.Employertypedroplist';
const LENGTH_OF_SERVICE_TYPE =
  'Telerik.Sitefinity.DynamicTypes.Model.LengthOfServicesDropList.Lengthofservicesdroplist';
const NATIONALITY_TYPE =
  'Telerik.Sitefinity.DynamicTypes.Model.NationalityDropList.NationalityDropList';
const MESSAGE_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.Message.Message';

export default async function FinanceCalculator(props: WidgetContext<FinanceCalculatorEntity>) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;
  const lang = culture || 'en';

  const selection = resolveSitefinitySelection(
    (props.model as any)?.FinanceDetails ?? (props.model?.Properties as any)?.FinanceDetails,
  );
  const id = extractSelectionId(selection);

  if (!id) {
    return isEdit ? (
      <section
        {...attrs}
        className={mergeClasses(
          'p-6 border border-dashed rounded-2xl text-center text-slate-500 bg-white/70',
          (props.model as any)?.CssClass,
          attrs.className,
        )}
      >
        <strong>Select a Finance Calculator item</strong>
        <div className="mt-1">Open the designer and configure a finance calculator</div>
      </section>
    ) : null;
  }

  const finance: any = await fetchData(
    [id],
    null,
    culture,
    [
      'Id',
      'Title',
      'DateOfBirthPopup',
      'MonthlySalaryPopup',
      'RequestedFinanceAmountPopup',
      'NumberOfInstallmentsPopup',
      'TotalMonthlyExpensesPopup',
      'MortgageLiabilitiesPopup',
      'MonthlyFinancialLiabilitiesPopup',
      'NoteDescription',
      'NationalityLabelChoices',
      'EmployerTypeLabel',
      'EmployerPlaceholder',
      'EmployerChoices',
      'DateOfBirthLabel',
      'DateOfBirthPlaceholder',
      'LengthOfServicesLabel',
      'LengthOfServicesPlaceholder',
      'MonthlySalaryLabel',
      'MonthlySalaryPlaceholder',
      'RequestedFinanceAmountLabel',
      'RequestedFinanceAmountPlaceholder',
      'NumberOfInstallmentsLabel',
      'NumberOfInstallmentsPlaceholder',
      'RequestedFinanceAmountValidation',
      'NumberOfInstallmentsValidation',
      'TotalMonthlyExpensesLabel',
      'TotalMonthlyExpensesPlaceholder',
      'MortgageLiabilitiesLabel',
      'MortgageLiabilitiesPlaceholder',
      'MonthlyFinancialLiabilitiesLabel',
      'MonthlyFinancialLiabilitiesPlaceholder',
      'NoteTitle',
      'CtaText',
      'CtaUrl',
      'MaximumRequestAmount',
      'MinimumRequestAmount',
      'MaximumEligibleInstallments',
      'MinimumEligibleInstallments',
      'EmployerChoices/Id',
      'LengthOfServicesChoices/Id',
      'NationalityChoices/Id',
      'RelatedMessage/Id',
    ],
    { itemType: FINANCE_DETAILS_TYPE, single: true },
  );

  if (!finance) {
    return isEdit ? (
      <section
        {...attrs}
        className={mergeClasses(
          'p-6 border border-dashed rounded-2xl text-center text-slate-500 bg-white/70',
          (props.model as any)?.CssClass,
          attrs.className,
        )}
      >
        <strong>FinanceDetails not found</strong>
        <div className="mt-1">Check the selection or the item’s visibility</div>
      </section>
    ) : null;
  }

  const employerIds: string[] = (finance.EmployerChoices || []).map((x: any) => x.Id);
  const lenServIds: string[] = (finance.LengthOfServicesChoices || []).map((x: any) => x.Id);
  const nationalityIds: string[] = (finance.NationalityChoices || []).map((x: any) => x.Id);
  const messageIds: string[] = (finance.RelatedMessage || []).map((x: any) => x.Id);

  const [employers, lengthOfServices, nationalities, messages] = await Promise.all([
    fetchData(employerIds, null, culture, ['Id', 'Key',  'Value'], {
      itemType: EMPLOYER_TYPE,
    }),
    fetchData(lenServIds, null, culture, ['Id', 'Key',  'Value'], {
      itemType: LENGTH_OF_SERVICE_TYPE,
    }),
    fetchData(nationalityIds, null, culture, ['Id', 'Key',  'Value'], {
      itemType: NATIONALITY_TYPE,
    }),
    fetchData(
      messageIds,
      null,
      culture,
      [
        'Id',
        'Title',
        'Description',
        'NoteTitle',
        'NoteDescription',
        'ExploreLabel',
        'ExploreUrl',
        'DownloadLabel',
        'BackLabel',
        'ValidationText',
        'BackUrl',
        'Image/DefaultUrl',
        'Image/AlternativeText',
        'ActionsTitle',
        'ActionsDescription',
        'ReasonsTitle',
        'ReasonsDescription',
        'DownloadUrl/DefaultUrl',
      ],
      { itemType: MESSAGE_TYPE },
    ),
  ]);
  const toChoice = (x: any) => ({
    id: String(x?.Id ?? ''),
    title: String(x?.Value?? x?.Name ?? x?.Name ?? ''),
    value: String(x?.Key ?? x?.Value ?? x?.Name?? x?.Key ?? ''),
  });

  const toMessage = (m: any) => ({
    id: String(m?.Id ?? ''),
    title: String(m?.Title ?? ''),
    description: String(m?.Description ?? ''),
    note: {
      title: String(m?.NoteTitle ?? ''),
      description: String(m?.NoteDescription ?? ''),
    },
    actions: {
      explore: { label: String(m?.ExploreLabel ?? ''), url: String(m?.ExploreUrl ?? '') },
      download: {
        label: String(m?.DownloadLabel ?? ''),
        url: String(m?.DownloadUrl?.DefaultUrl ?? ''),
      },
      back: { label: String(m?.BackLabel ?? ''), url: String(m?.BackUrl ?? '') },
    },
    validationText: String(m?.ValidationText ?? ''),
    imageUrl: String(m?.Image?.DefaultUrl ?? ''),
    imageAlt: String(m?.Image?.AlternativeText ?? ''),
    actionsTitle: String(m?.ActionsTitle ?? ''),
    actionsDescription: String(m?.ActionsDescription ?? ''),
    reasonsTitle: String(m?.ReasonsTitle ?? ''),
    reasonsDescription: String(m?.ReasonsDescription ?? ''),
  });

  const cfg = {
    title: asString(finance?.Title),
    labels: {
      nationality: asString(finance?.NationalityLabelChoices),
      employerType: asString(finance?.EmployerTypeLabel),
      employerPlaceholder: asString(finance?.EmployerPlaceholder),
      dateOfBirth: asString(finance?.DateOfBirthLabel),
      dateOfBirthPlaceholder: asString(finance?.DateOfBirthPlaceholder),
      lengthOfServices: asString(finance?.LengthOfServicesLabel),
      lengthOfServicesPlaceholder: asString(finance?.LengthOfServicesPlaceholder),
      monthlySalary: asString(finance?.MonthlySalaryLabel),
      monthlySalaryPlaceholder: asString(finance?.MonthlySalaryPlaceholder),
      requestedAmount: asString(finance?.RequestedFinanceAmountLabel),
      requestedAmountPlaceholder: asString(finance?.RequestedFinanceAmountPlaceholder),
      minimumFinanceAmount: finance?.MinimumRequestAmount,
      maximumFinanceAmount: finance?.MaximumRequestAmount,
      minimumEligibleInstallments: finance?.MinimumEligibleInstallments,
      maximumEligibleInstallments: finance?.MaximumEligibleInstallments,
      installments: asString(finance?.NumberOfInstallmentsLabel),
      installmentsPlaceholder: asString(finance?.NumberOfInstallmentsPlaceholder),
      totalMonthlyExpenses: asString(finance?.TotalMonthlyExpensesLabel),
      totalMonthlyExpensesPlaceholder: asString(finance?.TotalMonthlyExpensesPlaceholder),
      mortgageLiabilities: asString(finance?.MortgageLiabilitiesLabel),
      mortgageLiabilitiesPlaceholder: asString(finance?.MortgageLiabilitiesPlaceholder),
      monthlyFinancialLiabilities: asString(finance?.MonthlyFinancialLiabilitiesLabel),
      monthlyFinancialLiabilitiesPlaceholder: asString(
        finance?.MonthlyFinancialLiabilitiesPlaceholder,
      ),
    },
    popups: {
      dateOfBirth: asString(finance?.DateOfBirthPopup),
      monthlySalary: asString(finance?.MonthlySalaryPopup),
      requestedAmount: asString(finance?.RequestedFinanceAmountPopup),
      installments: asString(finance?.NumberOfInstallmentsPopup),
      totalMonthlyExpenses: asString(finance?.TotalMonthlyExpensesPopup),
      mortgageLiabilities: asString(finance?.MortgageLiabilitiesPopup),
      monthlyFinancialLiabilities: asString(finance?.MonthlyFinancialLiabilitiesPopup),
      note: {
        title: asString(finance?.NoteTitle),
        description: asString(finance?.NoteDescription),
      },
    },
    validation: {
      requestedAmount: asString(finance?.RequestedFinanceAmountValidation),
      installments: asString(finance?.NumberOfInstallmentsValidation),
    },
    cta: {
      text: asString(finance?.CtaText),
      url: asString(finance?.CtaUrl?.Href ?? finance?.CtaUrl),
    },
    choices: {
      employerTypes: Array.isArray(employers) ? employers.map(toChoice) : [],
      lengthOfServices: Array.isArray(lengthOfServices) ? lengthOfServices.map(toChoice) : [],
      nationalities: Array.isArray(nationalities) ? nationalities.map(toChoice) : [],
    },
    messages: Array.isArray(messages) ? messages.map(toMessage) : [],
    culture,
  };
console.log("zksfs", cfg.choices.employerTypes)
  return (
    <section data-sf-enhance {...attrs}>
      <FinanceCalculatorClient cfg={cfg} lang={lang} />
    </section>
  );
}

