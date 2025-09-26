import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';

import {
  fetchData,
  extractSelectionId,
  extractItemIdsFromSelection,
} from '../../../utils/sitefinity';
import { resolveSitefinitySelection } from '../../../utils/utils';
import CareersRouting from './careersRouting';

const CAREERSMODULE = 'Telerik.Sitefinity.DynamicTypes.Model.CareersModule.Careersmodule';
const CAREER = 'Telerik.Sitefinity.DynamicTypes.Model.Careers.Career';

export default async function Careers(props: WidgetContext<any>) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;
  const modelProps = (props.model?.Properties as any) || {};

  const selectionCareersModule = resolveSitefinitySelection(modelProps?.CareersModule);
  const selectionCareers = resolveSitefinitySelection(modelProps?.Careers);

  const moduleId = extractSelectionId(selectionCareersModule);
  const careerIds = extractItemIdsFromSelection(selectionCareers);

  const careersPage = ['Id', 'Title', 'VacanciesLabel', 'LocationLabel', 'DepartmentLabel'];
  const careerCards = [
    'Id',
    'Title',
    'EmploymentType',
    'Date',
    'Department($select=Id,Title)',
    'Location($select=Id,Title)',
  ];

  const settingsRaw = moduleId
    ? await fetchData([moduleId], undefined as any, culture as any, careersPage, {
        itemType: CAREERSMODULE,
        single: true,
      })
    : await fetchData([], undefined as any, culture as any, careerCards, {
        itemType: CAREERSMODULE,
        take: 1,
      });

  const pageData = (Array.isArray(settingsRaw) ? settingsRaw[0] : settingsRaw) || null;

  const careersData = careerIds.length
    ? await fetchData(careerIds, undefined as any, culture as any, careerCards, {
        itemType: CAREER,
      })
    : await fetchData([], undefined as any, culture as any, careerCards, {
        itemType: CAREER,
        take: 100,
      });

  const careers = (Array.isArray(careersData) ? careersData : [careersData]).filter(Boolean);

  const labels = {
    vacanciesLabel: pageData?.VacanciesLabel ?? 'Available vacancies',
    locationLabel: pageData?.LocationLabel ?? 'Filter by Location',
    departmentLabel: pageData?.DepartmentLabel ?? 'Filter by Department',
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

  return (
    <section {...attrs}>
      <CareersRouting language={culture || 'en'} labels={labels} careers={careers as any[]} />
    </section>
  );
}

