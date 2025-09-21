import {
  BreadcrumbEntity,
  BreadcrumbViewProps,
} from '@progress/sitefinity-nextjs-sdk/widgets';

type CustomBreadcrumbProps = BreadcrumbViewProps<BreadcrumbEntity> & {
  requestContext?: any;
};

function resolveItems(props: CustomBreadcrumbProps) {
  if (props.items?.length) return props.items;

  const rc =
    props.requestContext ||
    (props as any)?._requestContext;

  let items: Array<{ Title: string; ViewUrl: string }> = [];

  const direct =
    rc?.breadcrumbs ||
    rc?.pageBreadcrumbs ||
    rc?.currentPage?.Breadcrumb ||
    [];

  if (Array.isArray(direct) && direct.length) {
    items = direct.map((n: any) => ({
      Title: n.Title ?? n.title ?? n.Name ?? 'Untitled',
      ViewUrl: n.ViewUrl ?? n.viewUrl ?? n.Url ?? n.url ?? '/',
    }));
  } else if (rc?.siteMapNode) {
    const chain: any[] = [];
    let node: any = rc.siteMapNode;
    while (node) {
      chain.push(node);
      node = node.Parent || node.parent;
    }
    chain.reverse();
    items = chain.map((n: any) => ({
      Title: n.Title ?? n.title ?? n.Name ?? 'Untitled',
      ViewUrl: n.ViewUrl ?? n.viewUrl ?? n.Url ?? n.url ?? '/',
    }));
  } else {
    const title =
      rc?.pageTitle || rc?.currentPage?.Title || 'Current page';
    items = [
      { Title: 'Home', ViewUrl: '/' },
      { Title: title, ViewUrl: '' },
    ];
  }

  return items;
}

export default function BreadcrumbCustomView(props: CustomBreadcrumbProps) {
  const items = resolveItems(props);

  return (
    <nav {...props.attributes} aria-label="Breadcrumb">
      <ol className="flex flex-wrap justify-center items-center gap-1 text-sm">
        {items.map((node, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={node.ViewUrl ?? idx} className="flex items-center gap-1">
              {isLast ? (
                <span className="whitespace-nowrap text-[#6BE5BF] text-transparent">
                  {node.Title}
                </span>
              ) : (
                <a
                  href={node.ViewUrl}
                  className="whitespace-nowrap text-white/90 hover:text-white"
                >
                  {node.Title}
                </a>
              )}

              {!isLast && (
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 shrink-0 text-white/70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M7 5l6 5-6 5" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
