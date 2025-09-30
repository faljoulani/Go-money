import {
  htmlAttributes,
  RenderWidgetService,
  getMinimumMetadata,
} from '@progress/sitefinity-nextjs-sdk';
import { Tracer } from '@progress/sitefinity-nextjs-sdk/diagnostics/empty';

const LEFT = 'Left';
const RIGHT = 'Right';

export default async function TwoColumnLayout(props) {
  const { span, ctx } = Tracer.traceWidget(props, true);

  const dataAttrs = htmlAttributes(props);
  const attrs: { [k: string]: any } = { ...dataAttrs };

  const children = props.model.Children || [];

  const leftChildren = children
    .filter((c) => c.PlaceHolder === LEFT)
    .map((m) => ({
      model: m,
      metadata: getMinimumMetadata(
        RenderWidgetService.widgetRegistry.widgets[m.Name],
        props.requestContext.isEdit,
      ),
      requestContext: props.requestContext,
    }));

  const rightChildren = children
    .filter((c) => c.PlaceHolder === RIGHT)
    .map((m) => ({
      model: m,
      metadata: getMinimumMetadata(
        RenderWidgetService.widgetRegistry.widgets[m.Name],
        props.requestContext.isEdit,
      ),
      requestContext: props.requestContext,
    }));

  return (
    <>
      <section {...attrs}>
        <div className="w-full md:mx-auto md:my-16 flex flex-col-reverse gap-8 md:flex-row">
          <div
            className="w-full md:basis-[40%] bg-white rounded-3xl min-w-0"
            {...(props.requestContext.isEdit
              ? { 'data-sfcontainer': LEFT, 'data-sfplaceholderlabel': 'Left' }
              : {})}
          >
            {leftChildren.map((y) =>
              RenderWidgetService.createComponent(y.model, props.requestContext, ctx),
            )}
          </div>

          <div
            className="w-full md:basis=[60%] md:basis-[60%] bg-white rounded-3xl min-w-0"
            {...(props.requestContext.isEdit
              ? { 'data-sfcontainer': RIGHT, 'data-sfplaceholderlabel': 'Right' }
              : {})}
          >
            {rightChildren.map((y) =>
              RenderWidgetService.createComponent(y.model, props.requestContext, ctx),
            )}
          </div>
        </div>
      </section>
      {Tracer.endSpan(span)}
    </>
  );
}

