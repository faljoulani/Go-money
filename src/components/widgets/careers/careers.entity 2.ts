import { WidgetEntity } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';

@WidgetEntity('CareersModule', 'Careers Module')
export class CareersModuleEntity {
  @ContentSection('Careers Module', 0)
  @Content({ Type: 'Telerik.Sitefinity.DynamicTypes.Model.CareersModule.Careersmodule' })
  CareersModule?: any;

  @ContentSection('Career Items', 1)
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.Careers.Career',
    AllowMultipleItemsSelection: true,
  })
  Careers?: any[];

  @ContentSection('Locations', 2)
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.CareersLocation.Careerslocation',
    AllowMultipleItemsSelection: true,
  })
  Locations?: any[];

  @ContentSection('Departments', 3)
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.CareersMainDepartments.Careersmaindepartment',
    AllowMultipleItemsSelection: true,
  })
  Departments?: any[];

  @ContentSection('Apply Form', 4)
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.CareersFormLabel.CareersFormLabel',
  })
  ApplyForm?: any;

  @ContentSection('City Choices', 5)
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.CityDropList.Citydroplist',
    AllowMultipleItemsSelection: true,
  })
  CityChoices?: any[];
}

