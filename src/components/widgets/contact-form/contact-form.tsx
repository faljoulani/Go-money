// components/widgets/contact-form/contact-form.tsx
import React from 'react';
import { ContactFormEntity } from './contact-form.entity';
import { ContactFormClient } from './contact-form.client';

type ContactFormProps = {
  model?: { Properties?: Partial<ContactFormEntity> };
};

export function ContactForm({ model }: ContactFormProps) {
  // Safely read values with defaults
  const {
    Header = 'Contact us',
    SubmitButtonLabel = 'Send',
  } = (model?.Properties ?? {}) as Partial<ContactFormEntity>;

  return <ContactFormClient header={Header} submitLabel={SubmitButtonLabel} />;
}
