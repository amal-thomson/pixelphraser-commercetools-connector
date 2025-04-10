import { fetchProductType } from '../product-type/fetchProductTypeById.repository';

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

describe('fetchProductType', () => {
  const mockProductTypeId = 'product-type-001';
  const mockMessageId = 'msg-789';

  const mockExecute = jest.fn();
  const mockGet = jest.fn(() => ({ execute: mockExecute }));
  const mockWithId = jest.fn(() => ({ get: mockGet }));
  const mockProductTypes = jest.fn(() => ({ withId: mockWithId }));

  beforeEach(() => {
    const { createApiRoot } = require('../../client/create.client');
    (createApiRoot as jest.Mock).mockReturnValue({
      productTypes: mockProductTypes
    });

    jest.clearAllMocks();
  });

  it('should fetch and return product type key successfully', async () => {
    const mockResponse = {
      body: {
        key: 'apparel-type'
      }
    };

    mockExecute.mockResolvedValueOnce(mockResponse);

    const result = await fetchProductType(mockProductTypeId, mockMessageId);

    expect(result).toBe('apparel-type');
    expect(mockProductTypes).toHaveBeenCalled();
    expect(mockWithId).toHaveBeenCalledWith({ ID: mockProductTypeId });
    expect(mockExecute).toHaveBeenCalled();
  });

  it('should return empty string if key is not present', async () => {
    mockExecute.mockResolvedValueOnce({ body: {} });

    const result = await fetchProductType(mockProductTypeId, mockMessageId);

    expect(result).toBe('');
  });

  it('should throw and log error if API call fails', async () => {
    const errorMessage = 'Product type fetch error';
    mockExecute.mockRejectedValueOnce(new Error(errorMessage));

    await expect(fetchProductType(mockProductTypeId, mockMessageId)).rejects.toThrow(errorMessage);
  });
});
