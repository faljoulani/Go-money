import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';

export type StackLayoutEntity = Record<string, never>;
export default function StackLayout(props: WidgetContext<StackLayoutEntity>) {
  const attrs = htmlAttributes(props);

  return (
    <section {...attrs} className="w-full max-auto">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="py-16 md:p-10">
          <div className="flex flex-col gap-16" data-sfcontainer="true" data-sfname="Main" />
        </div>
      </div>
    </section>
  );
}
