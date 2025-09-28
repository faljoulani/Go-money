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
  RequestTypePlacholder?: string;

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

const toOptions = (arr: unknown): Option[] => {
  if (!arr) return [];
  const list = Array.isArray(arr) ? arr : [arr];
  return list
    .filter(Boolean)
    .map((option: any) => ({ 
      id: option?.Id || '', 
      label: option?.Key || option?.Value || '' 
    }))
    .filter((option: Option) => !!option.id && !!option.label);
};

export default async function ContactFormView(props: WidgetContext<FormEntity>) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;

  const selection = resolveSitefinitySelection(
    (props.model as any)?.Form ?? (props.model?.Properties as any)?.Form,
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
    'RequestTypeChoices',
    'RequestTypePlacholder',
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

  let item: FormItem | null = null;
  try {
    item = (await fetchData([id], null, culture, fields, {
      itemType,
      single: true,
    })) as FormItem | null;
  } catch (err) {
    console.log(err);
  }

  if (!item) {
    return isEdit ? (
      <section
        {...attrs}
        className={mergeClasses(
          'p-6 border border-dashed rounded-2xl text-center text-slate-500',
          (props.model as any)?.CssClass,
          attrs.className,
        )}
      >
        Couldn’t load the selected form item.
      </section>
    ) : null;
  }

  const ctaHref =
    typeof item.CtaUrl === 'string'
      ? item.CtaUrl
      : (item.CtaUrl as any)?.Href ||
        (Array.isArray(item.CtaUrl) ? (item.CtaUrl as any)[0]?.Href : '') ||
        '';

  const data = {
    title: item.Title ?? '',
    subTitle: item.SubTitle ?? '',

    ctaText: item.CtaText ?? 'Send Message',
    ctaHref,

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
    requestTypePlacholder: item.RequestTypePlacholder ?? 'select item',

    topicLabel: item.TopicLabel ?? 'Topic',
    topicPlaceholder: item.TopicPlaceholder ?? '',

    notesLabel: item.NotesLabel ?? 'Notes',
    notesPlaceholder: item.NotesPlaceholder ?? item.NotesPlacholder ?? '',

    resumeInstructions: item.ResumeInstructions ?? '',
    resumeSectionTitle: item.ResumeSectionTitle ?? '',
    resumeFileNote: item.ResumeFileNote ?? '',
  };

  return (
    <section
      {...attrs}
      id={`sf-widget-${(props.model as any)?.Id ?? 'contact-form'}`}
      className={mergeClasses('w-full', (props.model as any)?.CssClass, attrs.className)}
      data-sf-enhance
    >
      <div className="w-full rounded-[24px] bg-white/95 p-6 shadow-sm ring-1 ring-black/5">
        <ContactFormClient data={data} />
      </div>
    </section>
  );
}

