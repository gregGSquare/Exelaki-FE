import { fetchCategories, fetchEntries, deleteEntry, editEntry, fetchFinancialIndicators, deleteCategory } from './dashBoardService';
import api from './axios';
import { handleApiError } from '../utils/errorHandler';

jest.mock('./axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    delete: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock('../utils/errorHandler', () => ({
  handleApiError: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedHandleApiError = handleApiError as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('dashBoardService', () => {
  test('fetchCategories returns data', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: ['cat'] } } as any);
    const result = await fetchCategories();
    expect(result).toEqual(['cat']);
    expect(mockedApi.get).toHaveBeenCalledWith('/categories');
  });

  test('fetchCategories propagates processed error', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('fail'));
    mockedHandleApiError.mockReturnValueOnce({ type: 'UNKNOWN', message: 'x' });
    await expect(fetchCategories()).rejects.toEqual({ type: 'UNKNOWN', message: 'x' });
  });

  test('fetchEntries returns data', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: [{ id: 1 }] } } as any);
    const result = await fetchEntries('b1');
    expect(result).toEqual([{ id: 1 }]);
    expect(mockedApi.get).toHaveBeenCalledWith('/entries?budgetId=b1');
  });

  test('deleteEntry calls api.delete', async () => {
    mockedApi.delete.mockResolvedValueOnce({ status: 200 } as any);
    await deleteEntry('1');
    expect(mockedApi.delete).toHaveBeenCalledWith('/entries/1');
  });

  test('editEntry returns updated entry', async () => {
    mockedApi.put.mockResolvedValueOnce({ status: 200, data: { data: { id: 1 } } } as any);
    const result = await editEntry('1', { name: 'a' });
    expect(result).toEqual({ id: 1 });
    expect(mockedApi.put).toHaveBeenCalledWith('/entries/1', { name: 'a' });
  });

  test('fetchFinancialIndicators returns default for invalid budget', async () => {
    const result = await fetchFinancialIndicators('');
    expect(result.totalScore.value).toBe('N/A');
  });

  test('fetchFinancialIndicators returns data', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: { totalScore: { value: '1', status: 'GOOD' }, expenseDistribution: [] } } } as any);
    const result = await fetchFinancialIndicators('123');
    expect(result.totalScore.value).toBe('1');
    expect(mockedApi.get).toHaveBeenCalledWith('/financial-indicators/123');
  });

  test('fetchFinancialIndicators throws processed error for 404', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('not found'));
    mockedHandleApiError.mockReturnValueOnce({ statusCode: 404, type: 'NOT_FOUND', message: 'not found' });
    await expect(fetchFinancialIndicators('123')).rejects.toEqual({ statusCode: 404, type: 'NOT_FOUND', message: 'not found' });
  });

  test('deleteCategory calls api.delete', async () => {
    mockedApi.delete.mockResolvedValueOnce({ status: 200 } as any);
    await deleteCategory('10');
    expect(mockedApi.delete).toHaveBeenCalledWith('/categories/10');
  });
});
