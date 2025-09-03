import { BreadcrumbEntity, BreadcrumbViewProps } from '@progress/sitefinity-nextjs-sdk/widgets';

export default function BreadcrumbCustomView(props: BreadcrumbViewProps<BreadcrumbEntity>) {
  const items = props.items ?? [];

  return (
    <nav {...props.attributes} aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-3 text-lg sm:text-2xl leading-none">
        {items.map((node, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={node.ViewUrl ?? idx} className="flex items-center gap-3">
              {isLast ? (
                // current page highlight
                <span className="whitespace-nowrap font-extrabold bg-gradient-to-r from-[#42F0B6] to-[#4EA6FF] bg-clip-text text-transparent">
                  {node.Title}
                </span>
              ) : (
                // links — white 
                <a
                  href={node.ViewUrl}
                  className="whitespace-nowrap text-white/90 hover:text-white transition"
                >
                  {node.Title}
                </a>
              )}

              {/* chevron separator (hide after last) */}
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
