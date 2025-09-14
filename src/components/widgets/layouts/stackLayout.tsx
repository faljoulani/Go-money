import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';

export type StackLayoutEntity = Record<string, never>;

export default function StackLayout(props: WidgetContext<StackLayoutEntity>) {
  const attrs = htmlAttributes(props);
  console.log('PROPERTIES', props.model.Properties);
  const placeholders = (props.model as any)?.Children?.filter((c: any) => c?.PlaceHolder) || [];
  console.log('placeholders:', placeholders[0].PlaceHolder);

  return (
    <section {...attrs} className="w-full">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="py-16 md:p-10 flex flex-col gap-16">
          {/* {placeholders.map((ph: any) => (
            <div
              key={ph.Id}
              data-sfcontainer="true"
              data-sfname={ph.Name}
              data-sftitle={ph.Caption ?? ph.Name}
              className="min-h-[20px]"
            ></div>
          ))} */}
          <div data-sfcontainer="HowItWorks" data-sfname="HowItWorks"></div>
        </div>
      </div>
    </section>
  );
}

