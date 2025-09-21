import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { resolveSitefinitySelection, mergeClasses } from '../../../utils/utils';
import type { FormEntity } from './contactForm.entity';
import ContactFormClient from './contactFormClient';

type Option = { id: string; label: string };

type FormItem = {
  Id: string;
  Title?: string;
  SubTitle?: string;

  CtaText?: string;
  CtaUrl?: string | { Href?: string } | Array<{ Href?: string }>;

  FirstNameLabel?: string;
  FirstNamePlaceholder?: string;
  LastNameLabel?: string;
  LastNamePlaceholder?: string;

  PhoneNumberLabel?: string;
  PhoneNumberPlaceholder?: string;

  EmailLabel?: string;
  EmailPlaceholder?: string;

  RequestTypeLabel?: string;
  RequestTypeChoices?: Array<{ Id?: string; Title?: string; Name?: string }>;

  TopicLabel?: string;
  TopicPlaceholder?: string;

  NotesLabel?: string;
  NotesPlaceholder?: string;
  NotesPlacholder?: string;

  ResumeInstructions?: string;
  ResumeSectionTitle?: string;
  ResumeFileNote?: string;

  Provider?: string;
  UrlName?: string;
};
const getCulture = (ctx: any) =>
  ctx?.requestContext?.sfContext?.culture || ctx?.requestContext?.culture || 'en';

const toOptions = (arr: any): Option[] => {
  if (!arr) return [];
  const list = Array.isArray(arr) ? arr : [arr];
  return list
    .filter(Boolean)
    .map((c: any) => ({ id: c?.Id, label: c?.Title || c?.Name || '' }))
    .filter((o: Option) => !!o.id && !!o.label);
};

function pickSingle<T>(r: T | T[] | null | undefined): T | null {
  if (!r) return null;
  return Array.isArray(r) ? (r[0] ?? null) : r;
}

export default async function ContactFormView(ctx: WidgetContext<FormEntity>) {
  const attrs = htmlAttributes(ctx);
  const { isEdit } = ctx.requestContext;
  const culture = getCulture(ctx);

  const selection = resolveSitefinitySelection(
    (ctx.model as any)?.Form ?? (ctx.model?.Properties as any)?.Form,
  );
  const id = extractSelectionId(selection);

  if (!id) {
    return isEdit ? (
      <section
        {...attrs}
        className={mergeClasses(
          'p-6 border border-dashed rounded-2xl text-center text-slate-500 bg-white/70',
          (ctx.model as any)?.CssClass,
        )}
      >
        <strong>Select a Contact Form item</strong>
        <div className="mt-1">Open the designer and choose the form content.</div>
      </section>
    ) : null;
  }

  const itemType = selection?.Content?.[0]?.Type;

  const fields = [
    'Id',
    'Title',
    'SubTitle',
    'CtaText',
    'CtaUrl',
    'FirstNameLabel',
    'FirstNamePlaceholder',
    'LastNameLabel',
    'LastNamePlaceholder',
    'PhoneNumberLabel',
    'PhoneNumberPlaceholder',
    'EmailLabel',
    'EmailPlaceholder',
    'RequestTypeLabel',
    'RequestTypeChoices()',
    'TopicLabel',
    'TopicPlaceholder',
    'NotesLabel',
    'NotesPlaceholder',
    'NotesPlacholder',
    'ResumeInstructions',
    'ResumeSectionTitle',
    'ResumeFileNote',
    'Provider',
    'UrlName',
  ];

  const raw = await fetchData([id], null, culture, fields, { itemType, single: true });
  const item = pickSingle<FormItem>(raw);

  if (!item) {
    return isEdit ? (
      <section
        {...attrs}
        className="p-6 border border-dashed rounded-2xl text-center text-slate-500"
      >
        Couldn’t load the selected form item.
      </section>
    ) : null;
  }

  const data = {
    title: item.Title ?? '',
    subTitle: item.SubTitle ?? '',

    ctaText: item.CtaText ?? 'Send Message',
    ctaHref:
      typeof item.CtaUrl === 'string'
        ? item.CtaUrl
        : (item.CtaUrl as any)?.Href || (item.CtaUrl as any)?.[0]?.Href || '',

    firstNameLabel: item.FirstNameLabel ?? 'First Name',
    firstNamePlaceholder: item.FirstNamePlaceholder ?? '',

    lastNameLabel: item.LastNameLabel ?? 'Last Name',
    lastNamePlaceholder: item.LastNamePlaceholder ?? '',

    phoneNumberLabel: item.PhoneNumberLabel ?? 'Phone Number',
    phoneNumberPlaceholder: item.PhoneNumberPlaceholder ?? '',

    emailLabel: item.EmailLabel ?? 'Email',
    emailPlaceholder: item.EmailPlaceholder ?? '',

    requestTypeLabel: item.RequestTypeLabel ?? 'Request type',
    requestTypeChoices: toOptions(item.RequestTypeChoices),

    topicLabel: item.TopicLabel ?? 'Topic',
    topicPlaceholder: item.TopicPlaceholder ?? '',

    notesLabel: item.NotesLabel ?? 'Notes',
    notesPlaceholder: item.NotesPlaceholder ?? item.NotesPlacholder ?? '',

    resumeInstructions: item.ResumeInstructions ?? '',
    resumeSectionTitle: item.ResumeSectionTitle ?? '',
    resumeFileNote: item.ResumeFileNote ?? '',
  };

  const postUrl = '/api/default/ContactUsLists';

  return (
    <section
      {...attrs}
      id={`sf-widget-${(ctx.model as any)?.Id ?? 'contact-form'}`}
      className={'w-full'}
      data-sf-enhance
    >
      <div className="w-full rounded-[24px] bg-white/95 p-6 shadow-sm ring-1 ring-black/5">
        <ContactFormClient postUrl={postUrl} data={data} />
      </div>
    </section>
  );
}

