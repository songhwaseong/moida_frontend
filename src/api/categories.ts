import customAxios from './axiosInstance';
import type { Category } from '../types';

interface CategoryDto {
  id: number;
  name: string;
  emoji: string | null;
  displayOrder: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

// 홈 화면 카테고리는 DB의 displayOrder 순으로 받고, '전체' 항목은 프론트에서 맨 앞에 합성한다.
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await customAxios.get<ApiResponse<CategoryDto[]>>('/categories');
  const fromDb: Category[] = response.data.data.map((c) => ({
    id: c.id,
    emoji: c.emoji ?? '',
    label: c.name,
  }));
  return [{ id: 0, emoji: '🔍', label: '전체' }, ...fromDb];
};
