import { createProductCustomObject } from '../custom-object/createCustomObject.repository';

jest.mock('../../client/create.client', () => ({
  createApiRoot: jest.fn()
}));

jest.mock('../../utils/logger.utils', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('../../utils/config.utils', () => ({
  readConfiguration: jest.fn().mockReturnValue({
    projectKey: 'test-project',
    clientId: 'test-client',
    clientSecret: 'test-secret',
    scope: 'test-scope',
    apiUrl: 'https://test-api.com'
  })
}));

describe('createProductCustomObject', () => {
  const mockProductId = 'test-id';
  const mockImageUrl = 'https://test-image.jpg';
  const mockProductName = 'Test Product';
  const mockProductType = 't-shirt';
  const mockLanguages = ['fr', 'es', 'de'];
  const messageId = 'msg-123';

  const mockExecute = jest.fn();
  const mockPost = jest.fn(() => ({ execute: mockExecute }));
  const mockCustomObjects = jest.fn(() => ({ post: mockPost }));

  beforeEach(() => {
    const { createApiRoot } = require('../../client/create.client');
    (createApiRoot as jest.Mock).mockReturnValue({
      customObjects: mockCustomObjects
    });

    mockExecute.mockClear();
    mockPost.mockClear();
    mockCustomObjects.mockClear();
  });

  it('should create custom object successfully', async () => {
    mockExecute.mockResolvedValueOnce(undefined); // New implementation returns void

    await createProductCustomObject(
      mockProductId,
      mockImageUrl,
      mockProductName,
      mockProductType,
      mockLanguages,
      messageId
    );

    expect(mockCustomObjects).toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledWith({
      body: {
        container: 'temporaryDescription',
        key: mockProductId,
        value: {
          fr: null,
          es: null,
          de: null,
          imageUrl: mockImageUrl,
          productType: mockProductType,
          productName: mockProductName
        }
      }
    });

    expect(mockExecute).toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockExecute.mockRejectedValueOnce(error);

    await expect(
      createProductCustomObject(
        mockProductId,
        mockImageUrl,
        mockProductName,
        mockProductType,
        mockLanguages,
        messageId
      )
    ).rejects.toThrow('API Error');
  });
});
