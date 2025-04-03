import { createApiRoot } from '../../client/create.client';
import { logger } from '../../utils/logger.utils';

export async function updateCustomObjectWithDescription(
    productId: string,
    productName: string,
    imageUrl: string,
    translations: Record<string, string>,
    productType: string
) {
    try {
        logger.info(`Updating custom object for product ID: ${productId}.`);
        const apiRoot = createApiRoot();        

        const customObjectResponse = await apiRoot.customObjects().withContainerAndKey({
            container: "temporaryDescription",
            key: productId
        }).get().execute();

        const currentCustomObject = customObjectResponse?.body;

        if (!currentCustomObject) {
            throw new Error(`Custom object not found for product ID: ${productId}`);
        }

        const currentVersion = currentCustomObject.version;
        
        const updatedValue = {
            ...translations,
            imageUrl,
            productType,
            productName,
            generatedAt: new Date().toISOString()
        };

        const updateResponse = await apiRoot.customObjects().post({
            body: {
                container: "temporaryDescription",
                key: productId,
                version: currentVersion, 
                value: updatedValue
            }
        }).execute();

        logger.info(`Custom object updated successfully for product ID: ${productId}.`);
        return updateResponse;

    } catch (error: any) {
        logger.error(`Failed to update custom object for product ID: ${productId}`, { message: error.message });
        throw error;
    }
}
