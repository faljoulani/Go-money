import { SanitizerService } from '@progress/sitefinity-nextjs-sdk';

/**
 * Ensures that any value coming from the CMS is safe to render.
 * Converts the value to string and sanitizes it to remove unsafe HTML or scripts.
 */
export const sanitizeTemplateValue = (value: string | number): string => {
    const sanitizerService = SanitizerService.getInstance();
    return sanitizerService.sanitizeHtml('' + value) as string;
};



/**
 * Removes a specific Content Block from the page model.
 * It searches the model for a SitefinityContentBlock that starts with a given value (e.g., "<h1"),
 * and if found, deletes it from its parent's children array.
 *
 * Example use case:
 * - Prevent duplicate headers: Sitefinity may inject an <h1> automatically,
 *   while the template already renders the title. This function removes the extra block.
 */
export const removeContentBlockByValue = (model: any, value: string) => {
    if (!model || !value) {
        return;
    }

    const search = (obj: any, value: string, parent: any[] = []): any => {
        let searchResult = null;

        if (obj && obj.Name === 'SitefinityContentBlock') {
            if (obj.Properties.Content.startsWith(value)) {
                return { parent, obj };
            }
        }

        if (obj && obj.Children && Array.isArray(obj.Children)) {
            for (let index = 0; index < obj.Children.length; index++) {
                const result = search(obj.Children[index], value, obj.Children);
                if (result) {
                    searchResult = result;
                    break;
                }
            }
        }

        return searchResult;
    };
    const config = search(model, value);

    // Find the matching content block in the model
    const indexToRemove = config.parent.findIndex((p: { Id: string }) => p.Id === config.obj.Id);
    if (config && indexToRemove !== -1) {
        config.parent.splice(indexToRemove, 1);
    }
};
