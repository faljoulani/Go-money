import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import {
  fetchData,
  extractSelectionId,
  extractItemIdsFromSelection,
} from '../../../utils/sitefinity';
import { resolveSitefinitySelection } from '../../../utils/utils';
import CareersRouting from './careersRouting';
import { useEffect } from 'react';

const T_FORM_LABEL = 'Telerik.Sitefinity.DynamicTypes.Model.CareersFormLabel.CareersFormLabel';

const SELECT_CAREERS_PAGE = {
  Id: 'Id',
  Title: 'Title',
  VacanciesLabel: 'VacanciesLabel',
  LocationLabel: 'LocationLabel',
  DepartmentLabel: 'DepartmentLabel',
} as const;

const SELECT_CAREER_CARDS = {
  Id: 'Id',
  Title: 'Title',
  EmploymentType: 'EmploymentType',
  Date: 'Date',
  Department: 'Department($select=Id,Title)',
  Location: 'Location($select=Id,Title)',
} as const;

const SELECT_FORM = {
  Title: 'Title',
  SubTitle: 'SubTitle',
  FirstNameLabel: 'FirstNameLabel',
  FirstNamePlaceholder: 'FirstNamePlaceholder',
  LastNameLabel: 'LastNameLabel',
  LastNamePlaceholder: 'LastNamePlaceholder',
  PhoneNumberLabel: 'PhoneNumberLabel',
  PhoneNumberPlaceholder: 'PhoneNumberPlaceholder',
  EmailLabel: 'EmailLabel',
  EmailPlaceholder: 'EmailPlaceholder',
  CityLabel: 'CityLabel',
  CityPlaceholder: 'CityPlaceholder',
  ResumeSectionTitle: 'ResumeSectionTitle',
  ResumeFileNote: 'ResumeFileNote',
  CoverLetterLabel: 'CoverLetterLabel',
  CoverLetterPlaceholder: 'CoverLetterPlaceholder',
  ResumeInstructions: 'ResumeInstructions',
  CtaText: 'CtaText',
  CtaUrl: 'CtaUrl',
  CityChoices: 'CityChoices($select=Key,Value)',
} as const;

const SELECT_CITY = { Key: 'Key', Value: 'Value' } as const;

const SELECTS = {
  careersPage: Object.values(SELECT_CAREERS_PAGE),
  careerCards: Object.values(SELECT_CAREER_CARDS),
  form: Object.values(SELECT_FORM),
  city: Object.values(SELECT_CITY),
} as const;

const isArray = <T,>(value: T | T[] | null | undefined): T[] =>
  value == null ? [] : Array.isArray(value) ? value : [value];

const getFirstItem = <T,>(value: any): T | null => {
  const arr = isArray<T>(value?.Items ?? value?.items ?? value?.value ?? value);
  return arr.length ? arr[0] : null;
};

function mapCities(list: any[]): { Key: string; Value: string }[] {
  return (list || [])
    .map((city) => ({
      Key: city?.Key,
      Value: city?.Value,
    }))
    .filter((city) => city.Value);
}

export default async function Careers(props: WidgetContext<any>) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;
  const modelProps = (props.model?.Properties as any) || {};

  const selModule = resolveSitefinitySelection(modelProps?.CareersModule);
  const selCareers = resolveSitefinitySelection(modelProps?.Careers);
  const selApplyForm = resolveSitefinitySelection(modelProps?.CareersFormLabel);
  const selCityChoices = resolveSitefinitySelection(modelProps?.CityChoices);

  const moduleId = extractSelectionId(selModule);
  const careerIds = extractItemIdsFromSelection(selCareers);
  const applyFormId = extractSelectionId(selApplyForm);
  const cityChoiceIds = extractItemIdsFromSelection(selCityChoices);

  const settingsTask = fetchData(
    [moduleId],
    undefined as any,
    culture as any,
    SELECTS.careersPage as any,
    {
      itemType: selModule?.Content?.[0]?.Type,
      take: 1,
    },
  );

  const careersTask = fetchData(
    careerIds,
    undefined as any,
    culture as any,
    SELECTS.careerCards as any,
    {
      itemType: selCareers?.Content?.[0]?.Type,
      take: 100,
    },
  );

  const formTask = fetchData([applyFormId], selApplyForm, culture as any, SELECTS.form as any, {
    itemType: selApplyForm?.Content?.Type || T_FORM_LABEL,
    take: 1,
  });

  const citiesTask = fetchData(
    cityChoiceIds,
    undefined as any,
    culture as any,
    SELECTS.city as any,
    {
      itemType: selCityChoices?.Content?.[0]?.Type,
    },
  );

  const [settingsRaw, careersRaw, applyFormRaw, explicitCitiesRaw] = await Promise.all([
    settingsTask,
    careersTask,
    formTask,
    citiesTask,
  ]);

  const pageData = getFirstItem<any>(settingsRaw);

  const careers = isArray<any>(careersRaw).filter(Boolean);
  const applyForm = getFirstItem<any>(applyFormRaw);

  const embeddedCityChoices = mapCities(isArray((applyForm as any)?.CityChoices));
  const explicitCityChoices = mapCities(isArray(explicitCitiesRaw));
  const effectiveCityChoices =
    embeddedCityChoices.length > 0 ? embeddedCityChoices : explicitCityChoices;

  const toPlain = <T,>(value: T): T => JSON.parse(JSON.stringify(value ?? null));
  const applyFormPlain = toPlain(applyForm);
  const cityChoicesPlain = toPlain(effectiveCityChoices);
  const careersPlain = toPlain(careers);

  const labels = {
    vacanciesLabel: pageData?.VacanciesLabel,
    locationLabel: pageData?.LocationLabel,
    departmentLabel: pageData?.DepartmentLabel,
  };

  if (!careers.length && isEdit) {
    return (
      <section
        {...(attrs as any)}
        className="p-6 border border-dashed rounded-2xl text-center text-slate-500"
      >
        <strong>No Careers found.</strong>
        <div className="mt-1">Open the designer and select careers, or create some items.</div>
      </section>
    );
  }
  console.log({
    applyForm: JSON.stringify(applyForm),
  });

  return (
    <section {...attrs} className="flex justify-center mx-auto">
      <CareersRouting
        language={culture || 'en'}
        labels={labels}
        careers={careersPlain as any[]}
        entity={{
          ApplyForm: applyFormPlain || {},
          CityChoices: cityChoicesPlain || [],
        }}
      />
    </section>
  );
}

