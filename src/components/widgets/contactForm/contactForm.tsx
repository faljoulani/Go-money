import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import ContactFormClient from './contactFormClient';

export type ContactFormEntity = Record<string, never>;

export default function ContactFormStaticView(props: WidgetContext<ContactFormEntity>) {
  const attrs = htmlAttributes(props);
  return (
    <section {...attrs} className="w-full">
      <ContactFormClient />
    </section>
  );
}

