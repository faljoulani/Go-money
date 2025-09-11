import * as React from 'react';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';

export type TwoColumnLayoutEntity = Record<string, never>;

export default function TwoColumnLayout(props: WidgetContext<TwoColumnLayoutEntity>) {
  const attrs = htmlAttributes(props);
  const isEdit = (props.requestContext as any)?.isEdit === true;

  return (
    <section {...attrs} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 items-stretch">
        {/* Left: 1/3 */}
        <div className="col-span-1 flex">
          <div
            data-sfcontainer="true"
            data-sfname="Left"
            className={`flex-1${isEdit ? ' min-h-24' : ''}`}
          ></div>
        </div>
        {/* Right: 2/3 */}
        <div className="col-span-2 flex">
          <div
            data-sfcontainer="true"
            data-sfname="Right"
            className={`flex-1${isEdit ? ' min-h-24' : ''}`}
          ></div>
        </div>
      </div>
    </section>
  );
}

