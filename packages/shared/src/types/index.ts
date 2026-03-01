import type { RoleId } from '../constants/roles';

/** ベースユーザー型 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: RoleId;
  siteId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** API標準レスポンス型 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/** ページネーション型 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
