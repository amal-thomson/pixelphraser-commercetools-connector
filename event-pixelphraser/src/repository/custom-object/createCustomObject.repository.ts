import { createApiRoot } from '../../client/create.client';
import { logger } from '../../utils/logger.utils';

export async function createProductCustomObject(
    productId: string, 
    imageUrl: string, 
    productName: string, 
    productType: string, 
    languagesForTranslation: string[]
) {
    try {
        const apiRoot = createApiRoot();

        logger.info(`Creating custom object for product ID: ${productId}`);

        const descriptions = languagesForTranslation.reduce((acc, lang) => {
            acc[lang] = null; 
            return acc;
        }, {} as Record<string, string | null>);

        const customObject = await apiRoot.customObjects().post({
            body: {
                container: "temporaryDescription",
                key: productId,
                value: {
                    ...descriptions,
                    imageUrl,
                    productType,
                    productName
                }
            }
        }).execute();

        logger.info(`Custom object created successfully for product ID: ${productId}.`);
        return customObject;

    } catch (error: any) {
        logger.error(`Failed to create custom object for product ID: ${productId}`, { message: error.message });
        throw error;
    }
}
