import { fetchselectedLanguages } from './fetchSelectedLanguages.repository';

// Mock the API client
jest.mock('../../client/create.client', () => ({
  createApiRoot: jest.fn()
}));

// Mock the logger
jest.mock('../../utils/logger.utils', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('fetchselectedLanguages', () => {
  const messageId = 'msg-123';
  const mockExecute = jest.fn();
  const mockGet = jest.fn(() => ({ execute: mockExecute }));
  const mockWithContainerAndKey = jest.fn(() => ({ get: mockGet }));
  const mockCustomObjects = jest.fn(() => ({
    withContainerAndKey: mockWithContainerAndKey
  }));

  beforeEach(() => {
    const { createApiRoot } = require('../../client/create.client');
    (createApiRoot as jest.Mock).mockReturnValue({
      customObjects: mockCustomObjects
    });

    jest.clearAllMocks();
  });

  it('should return selected languages as an array', async () => {
    const languagesArray = ['en', 'de', 'fr'];
    mockExecute.mockResolvedValueOnce({
      body: { value: languagesArray }
    });

    const result = await fetchselectedLanguages(messageId);

    expect(result).toEqual(languagesArray);
    expect(mockWithContainerAndKey).toHaveBeenCalledWith({
      container: 'selectedLanguages',
      key: 'pixelphraser'
    });
  });

  it('should convert object values to array if not an array', async () => {
    const languageObj = { en: 'en', de: 'de', fr: 'fr' };
    mockExecute.mockResolvedValueOnce({
      body: { value: languageObj }
    });

    const result = await fetchselectedLanguages(messageId);

    expect(result).toEqual(['en', 'de', 'fr']);
  });

  it('should throw error when API call fails', async () => {
    mockExecute.mockRejectedValueOnce(new Error('API failure'));

    await expect(fetchselectedLanguages(messageId)).rejects.toThrow('API failure');
  });
});
