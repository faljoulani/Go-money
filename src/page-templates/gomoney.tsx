import { RequestContext } from '@progress/sitefinity-nextjs-sdk';
import React, { ReactNode } from 'react';
import { removeContentBlockByValue, WidgetAreas } from '../utils';

export const GoMoneyTemplate = ({
    widgets,
    requestContext,
}: {
    widgets: { [key: string]: ReactNode[] };
    requestContext: RequestContext;
}): React.JSX.Element => {
    removeContentBlockFromDetailsNews(widgets, requestContext);

 

    return (
        <>
            <header style={{ position: 'relative' }} data-sfcontainer={WidgetAreas.HEADER}>
                {widgets[WidgetAreas.HEADER]}
            </header>
            <main data-sfcontainer={WidgetAreas.CONTENT}>{widgets[WidgetAreas.CONTENT]}</main>
            <footer data-sfcontainer={WidgetAreas.FOOTER}>{widgets[WidgetAreas.FOOTER]}</footer>
        </>
    );
};

const removeContentBlockFromDetailsNews = (
    widgets: { [key: string]: ReactNode[] },
    requestContext: RequestContext
) => {
    const newsDetailsPageUrl = 'news-and-events/news/';
    if (requestContext.detailItem && requestContext.url.includes(newsDetailsPageUrl)) {
        removeContentBlockByValue(
            (widgets[WidgetAreas.CONTENT][0] as React.JSX.Element).props.children.props.model,
            '<h1'
        );
    }
};
