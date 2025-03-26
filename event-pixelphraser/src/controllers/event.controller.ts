import { Request, Response } from 'express';
import { logger } from '../utils/logger.utils';
import { productAnalysis } from '../services/vision-ai/productAnalysis.service';
import { generateProductDescription } from '../services/generative-ai/descriptionGeneration.service';
import { ProductAttribute } from '../interfaces/productAttribute.interface';
import { createProductCustomObject } from '../repository/custom-object/createCustomObject.repository';
import { updateCustomObjectWithDescription } from '../repository/custom-object/updateCustomObjectWithDescription';
import { fetchProductType } from '../repository/product-type/fetchProductTypeById.repository';
import { translateProductDescription } from '../services/generative-ai/translateProductDescription.service';
import { fetchProduct } from '../repository/product/fetchProductByID.repository';

export const post = async (request: Request, response: Response): Promise<void> => {
    try {
        // Extract and validate Pub/Sub message
        const pubSubMessage = request.body?.message;
        if (!pubSubMessage) {
            logger.error('Missing Pub/Sub message.');
            response.status(400).send();
            return;
        }
        logger.info('Message Received:', pubSubMessage);

        // Decode Pub/Sub message data
        const decodedData = pubSubMessage.data
            ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
            : undefined;

        if (!decodedData) {
            logger.error('No data found in Pub/Sub message.');
            response.status(400).send();
            return;
        }
        logger.info('Decoded Data:', decodedData);

        // Parse the decoded data
        const messageData = JSON.parse(decodedData);

        // Check if the notification type is ResourceCreated
        const notificationType = messageData?.notificationType;
        if (notificationType !== 'ResourceCreated') {
            logger.info('Resource created notification received. Skipping the message.');
            response.status(200).send();
            return;
        }

        // Check if the resource type is ProductVariantAdded
        const eventType = messageData?.type;
        logger.info(`Event received: ${eventType}`);
        if (eventType !== 'ProductVariantAdded') {
            logger.error(`Invalid event type: ${eventType}`);
            response.status(400).send();
            return;
        }

        // Extract product details
        const productId = messageData.resource?.id;
        if (!productId) {
            logger.error('Product ID not found in the message.');
            response.status(400).send();
            return;
        }

        // Fetch product data from commercetools
        const productData = await fetchProduct(productId);

        // Extract product type, name and image URL from product data
        const productType = productData?.productType?.id;
        const productName = productData?.masterData?.current?.name['en-GB'];
        const imageUrl = productData?.masterData?.current?.masterVariant?.images?.[0]?.url;
        if (!productType || !productName || !imageUrl) {
            logger.error('Missing required product data.', { productId, productType, productName, imageUrl });
            response.status(400).send();
            return;
        }

        // Extract and validate product attributes
        const attributes: ProductAttribute[] = productData?.masterData?.staged?.masterVariant?.attributes || [];
        if (!attributes.length) {
            logger.error('No product attributes found.', { productId });
            response.status(400).send();
            return;
        }

        // Check if automatic description generation is enabled
        const genDescriptionAttr = attributes.find(attr => attr.name === 'generateDescription');
        if (!genDescriptionAttr || !Boolean(genDescriptionAttr?.value)) {
            logger.info('Automatic description generation not enabled.', { productId });
            response.status(200).send();
            return;
        }

        // Fetch product type key from commercetools
        const productTypeKey = await fetchProductType(productType);
        if (!productTypeKey) {
            logger.error('Failed to fetch product type key.', { productId });
            response.status(500).send();
            return;
        }

        // Sending acknowledgment to Pub/Sub
        response.status(200).send();
        logger.info('Acknowledgment sent to Pub/Sub.'); 

        // Analyze product image
        const imageData = await productAnalysis(imageUrl);

        // Generate product description
        const generatedDescription = await generateProductDescription(imageData, productName, productTypeKey);

        // Translate description to multiple languages
        const translations = await translateProductDescription(generatedDescription);

        // Create custom object to store product descriptions
        await createProductCustomObject(productId, imageUrl, productName, productTypeKey);

        // Update the custom object with the generated description
        await updateCustomObjectWithDescription(productId, productName, imageUrl, translations as {
            'en-US': string;
            'en-GB': string;
            'de-DE': string;
        }, productTypeKey);

        logger.info('✅Processing completed successfully. ');

        // return;

    } catch (error) {
        logger.error('🚫Error processing request', { error: error instanceof Error ? error.message : error });
        response.status(500).send();
    }
};