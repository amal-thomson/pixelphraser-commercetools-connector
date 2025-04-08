import { fetchProduct } from './fetchProductByID.repository';

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

describe('fetchProduct', () => {
  const mockProductId = 'test-product-id';
  const mockMessageId = 'msg-456';

  const mockExecute = jest.fn();
  const mockGet = jest.fn(() => ({ execute: mockExecute }));
  const mockWithId = jest.fn(() => ({ get: mockGet }));
  const mockProducts = jest.fn(() => ({ withId: mockWithId }));

  beforeEach(() => {
    const { createApiRoot } = require('../../client/create.client');
    (createApiRoot as jest.Mock).mockReturnValue({
      products: mockProducts
    });

    jest.clearAllMocks();
  });

  it('should fetch and return product data successfully', async () => {
    const mockProductData = { id: mockProductId, masterData: {} } as any;

    mockExecute.mockResolvedValueOnce({ body: mockProductData });

    const result = await fetchProduct(mockProductId, mockMessageId);

    expect(result).toEqual(mockProductData);
    expect(mockProducts).toHaveBeenCalled();
    expect(mockWithId).toHaveBeenCalledWith({ ID: mockProductId });
    expect(mockExecute).toHaveBeenCalled();
  });

  it('should throw and log error if API call fails', async () => {
    const errorMessage = 'Failed to fetch product';
    mockExecute.mockRejectedValueOnce(new Error(errorMessage));

    await expect(fetchProduct(mockProductId, mockMessageId)).rejects.toThrow(errorMessage);
  });
});
