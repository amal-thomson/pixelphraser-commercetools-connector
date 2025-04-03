import { log } from 'console';
import { createApiRoot } from '../../client/create.client';
import { logger } from '../../utils/logger.utils';

export async function fetchselectedLanguages(): Promise<string[]> {
    try {
        const apiRoot = createApiRoot();

        logger.info('Fetching Selected Languages for translation.');

        const selectedLanguages = await apiRoot.customObjects().withContainerAndKey({
            container: "selectedLanguages",
            key: "pixelphraser"
        }).get().execute();

        let languagesForTranslation = selectedLanguages.body.value;

        if (!Array.isArray(languagesForTranslation)) {
            languagesForTranslation = Object.values(languagesForTranslation).map(String);
        }

        logger.info(`Selected Languages fetched successfully: ${JSON.stringify(languagesForTranslation)}`);
        return languagesForTranslation;

    } catch (error: any) {
        logger.error('Failed to fetch custom object', { message: error.message });
        throw error;
    }
}

