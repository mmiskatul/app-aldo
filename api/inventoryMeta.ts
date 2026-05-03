import apiClient from './apiClient';

export interface InventoryMetaItem {
  id: string;
  name: string;
}

interface InventoryMetaListResponse {
  items?: InventoryMetaItem[];
}

export const getInventoryCategories = async (): Promise<InventoryMetaItem[]> => {
  const response = await apiClient.get<InventoryMetaListResponse>('/api/v1/restaurant/inventory/categories');
  return response.data.items || [];
};

export const getInventorySuppliers = async (): Promise<InventoryMetaItem[]> => {
  const response = await apiClient.get<InventoryMetaListResponse>('/api/v1/restaurant/inventory/suppliers');
  return response.data.items || [];
};
