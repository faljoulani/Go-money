import { WidgetContext, htmlAttributes, RestClientForContext } from '@progress/sitefinity-nextjs-sdk';
import { MainNavigationEntity } from './MainNavigation.entity';

export async function MainNavigation(props: WidgetContext<MainNavigationEntity>) {
  const attrs = htmlAttributes(props);

  // read designer selection
  let selection = props.model?.Properties?.MainNavigation ?? (props.model?.Properties as any)?.MainNavigation;
  if (typeof selection === 'string') {
    try {
      selection = JSON.parse(selection);
    } catch {
      selection = undefined;
    }
  }

  let navRoot: any;
  if (selection?.Content?.length) {
    try {
      navRoot = await RestClientForContext.getItem(selection, {
        type: 'Telerik.Sitefinity.DynamicTypes.Model.MainNavigation.Mainnavigation',
        culture: props.requestContext.culture,
     fields: [
        'Id',
        'Title',
        'UrlName',
        'LanguageSwitcher', // will be normalized to array
        'Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider)',
        // Parents + Related pages children
        'NavPages($select=Id,Title,Order,UrlName,Link,' +
          'SubNavigation($select=Id,Title,UrlName,ViewUrl,RelativeUrlPath,HasChildren))',
        'Navigation($select=Id,Title,Order,UrlName,Link,' +
          'SubNavigation($select=Id,Title,UrlName,ViewUrl,RelativeUrlPath,HasChildren))',
        'StoreLinks($select=Id,Title,Url,StoreType,IsVisible,Order,' +
          'Icon($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider))',
      ],

      });
    } catch (e) {
      console.error('Error fetching MainNavigation:', e);
    }
  }

  if (!navRoot) {
    if (props.requestContext.isEdit) {
      return (
        <section {...attrs} className="MainNavigation-widget">
          Select a MainNavigation item.
        </section>
      );
    }
    return null;
  }

  // ✅ log full navigation object with children/sub-children
  console.log('MainNavigation full navRoot:', JSON.stringify(navRoot, null, 2));

  // just print raw JSON on the page for debugging
  return (
    <section {...attrs} className="MainNavigation-debug">
      <h2>MainNavigation Debug</h2>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', background: '#f9f9f9', padding: '10px' }}>
        {JSON.stringify(navRoot, null, 2)}
      </pre>
    </section>
  );
}

export default MainNavigation;
