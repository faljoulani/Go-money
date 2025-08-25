import { TemplateRegistry, defaultTemplateRegistry } from '@progress/sitefinity-nextjs-sdk';

import { GoMoneyTemplate } from '../page-templates/gomoney';

let customTemplateRegistry: TemplateRegistry = {

  'GoMoney-Template': {
    title: 'GoMoney-Template',
    templateFunction: GoMoneyTemplate,
  },
};


customTemplateRegistry = {
  ...defaultTemplateRegistry,
  ...customTemplateRegistry,
};

export const templateRegistry: TemplateRegistry = customTemplateRegistry;
