import {
  WidgetContext,
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
        <div className="flex flex-row gap-8 w-[90%] mx-auto">
          <div
            className="basis-[40%] bg-white rounded-3xl"
            {...(props.requestContext.isEdit
              ? { 'data-sfcontainer': LEFT, 'data-sfplaceholderlabel': 'Left' }
              : {})}
          >
            {leftChildren.map((y, i) =>
              RenderWidgetService.createComponent(y.model, props.requestContext, ctx),
            )}
          </div>

          <div
            className="basis-[60%] bg-white rounded-3xl"
            {...(props.requestContext.isEdit
              ? { 'data-sfcontainer': RIGHT, 'data-sfplaceholderlabel': 'Right' }
              : {})}
          >
            {rightChildren.map((y, i) =>
              RenderWidgetService.createComponent(y.model, props.requestContext, ctx),
            )}
          </div>
        </div>
      </section>
      {Tracer.endSpan(span)}
    </>
  );
}

