import { JSX } from 'react';
import {
  WidgetContext,
  htmlAttributes,
  getMinimumMetadata,
  RenderWidgetService,
} from '@progress/sitefinity-nextjs-sdk';
import { Tracer } from '@progress/sitefinity-nextjs-sdk/diagnostics/empty';
// import { SectionTestEntity } from './sectionTest.entity';

const CONTENT = 'Content';

export async function StackLayout(props) {
  const dataAttrs = htmlAttributes(props);
  const attrs: { [k: string]: any } = { ...dataAttrs };

  const children = (props.model.Children || [])
    .filter((c) => c.PlaceHolder === CONTENT)
    .map((m) => ({
      model: m,
      requestContext: props.requestContext,
    }));

  return (
    <>
      <section {...attrs}>
        <div
          className="bg-white  py-16 rounded-3xl flex flex-col gap-16 w-full"
          {...(props.requestContext.isEdit
            ? { 'data-sfcontainer': CONTENT, 'data-sfplaceholderlabel': 'Content' }
            : {})}
        >
          {children.map((y, i) =>
            RenderWidgetService.createComponent(y.model, props.requestContext),
          )}
        </div>
      </section>
    </>
  );
}

