// Unit tests for financial indicators service
import { loadFinancialIndicators } from './financialIndicatorsService';
import { fetchFinancialIndicators } from './dashBoardService';
import { handleApiError } from '../utils/errorHandler';

jest.mock('./dashBoardService', () => ({
  fetchFinancialIndicators: jest.fn(),
}));

jest.mock('../utils/errorHandler', () => ({
  handleApiError: jest.fn(),
}));

const mockedFetch = fetchFinancialIndicators as jest.Mock;
const mockedHandleError = handleApiError as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('financialIndicatorsService', () => {
  test('returns default indicators for invalid budget', async () => {
    const result = await loadFinancialIndicators('');
    expect(result.totalScore.value).toBe('N/A');
  });

  test('returns indicators on success', async () => {
    const data = { totalScore: { value: '1', status: 'GOOD' }, expenseDistribution: [] } as any;
    mockedFetch.mockResolvedValueOnce(data);
    const result = await loadFinancialIndicators('123');
    expect(result).toEqual(data);
  });

  test('throws processed error on non-retryable failure', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('fail'));
    mockedHandleError.mockReturnValueOnce({ statusCode: 500, type: 'SERVER', message: 'fail' });
    await expect(loadFinancialIndicators('123')).rejects.toEqual({ statusCode: 500, type: 'SERVER', message: 'fail' });
  });
});
