import { logger } from '../../utils/logger.utils';
import { model } from '../../config/ai.config';

export async function translateProductDescription(generatedDescription: string, languagesForTranslation: string[]): Promise<Record<string, string>> {
    try {
        logger.info('Sending generated description to Generative AI for translation.');
        const translations: Record<string, string> = {};

        for (const language of languagesForTranslation) {
            const prompt = `Translate the following product description into ${language}. 
            
            **Original Text (English)**: ${generatedDescription}

            **Translation Guidelines**:
            - Maintain the tone and style of the original description.
            - Ensure the text is fluent and sounds natural in ${language}.
            - Adapt cultural nuances if necessary.
            - Optimize for SEO where applicable.

            Return the translated text without additional comments.`;

            const result = await model.generateContent(prompt);
            if (!result?.response) throw new Error(`Translation to ${language} failed.`);

            const translatedText = result.response.text?.();
            if (!translatedText) throw new Error(`Translation to ${language} failed.`);

            translations[language] = translatedText;
            logger.info(`Translation to ${language} completed successfully`);
        }

        return translations;
    } catch (error: any) {
        logger.error('Error during description translation:', { message: error.message, stack: error.stack });
        throw error;
    }
}
