import { updateCustomObjectWithDescription } from './updateCustomObjectWithDescription.repository';

// Mock the entire client module
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

describe('Update Custom Object Repository', () => {
  const mockProductId = 'test-id';
  const mockTranslations = {
    en: 'English description',
    de: 'Deutsche Beschreibung'
  };
  const mockImageUrl = 'https://test-image.jpg';
  const mockProductName = 'Test Product';
  const mockProductType = 'Shirt';
  const messageId = 'msg-001';

  const mockExecute = jest.fn();
  const mockGet = jest.fn(() => ({ execute: mockExecute }));
  const mockWithContainerAndKey = jest.fn(() => ({ get: mockGet }));
  const mockPost = jest.fn(() => ({ execute: mockExecute }));
  const mockCustomObjects = jest.fn(() => ({
    withContainerAndKey: mockWithContainerAndKey,
    post: mockPost
  }));

  beforeEach(() => {
    const { createApiRoot } = require('../../client/create.client');
    (createApiRoot as jest.Mock).mockReturnValue({
      customObjects: mockCustomObjects
    });

    mockExecute.mockClear();
    mockGet.mockClear();
    mockPost.mockClear();
    mockWithContainerAndKey.mockClear();
    mockCustomObjects.mockClear();
  });

  it('should update custom object successfully', async () => {
    const mockExistingObject = {
      body: {
        version: 2
      }
    };

    mockExecute
      .mockResolvedValueOnce(mockExistingObject) // get
      .mockResolvedValueOnce({}); // post

    await updateCustomObjectWithDescription(
      mockProductId,
      mockProductName,
      mockImageUrl,
      mockTranslations,
      mockProductType,
      messageId
    );

    expect(mockCustomObjects).toHaveBeenCalledTimes(2);
    expect(mockWithContainerAndKey).toHaveBeenCalledWith({
      container: 'temporaryDescription',
      key: mockProductId
    });

    expect(mockPost).toHaveBeenCalledWith({
      body: {
        container: 'temporaryDescription',
        key: mockProductId,
        version: 2,
        value: {
          ...mockTranslations,
          imageUrl: mockImageUrl,
          productType: mockProductType,
          productName: mockProductName,
          generatedAt: expect.any(String)
        }
      }
    });
  });

  it('should throw if custom object is not found', async () => {
    mockExecute.mockResolvedValueOnce({ body: null });

    await expect(updateCustomObjectWithDescription(
      mockProductId,
      mockProductName,
      mockImageUrl,
      mockTranslations,
      mockProductType,
      messageId
    )).rejects.toThrow(`Message ID: ${messageId} - custom object not found with ID: ${mockProductId}`);
  });

  it('should throw if get request fails', async () => {
    mockExecute.mockRejectedValueOnce(new Error('Get API Error'));

    await expect(updateCustomObjectWithDescription(
      mockProductId,
      mockProductName,
      mockImageUrl,
      mockTranslations,
      mockProductType,
      messageId
    )).rejects.toThrow('Get API Error');
  });

  it('should throw if post request fails', async () => {
    // Mock successful get
    mockExecute
      .mockResolvedValueOnce({ body: { version: 1 } })
      .mockRejectedValueOnce(new Error('Update API Error'));

    await expect(updateCustomObjectWithDescription(
      mockProductId,
      mockProductName,
      mockImageUrl,
      mockTranslations,
      mockProductType,
      messageId
    )).rejects.toThrow('Update API Error');
  });
});
