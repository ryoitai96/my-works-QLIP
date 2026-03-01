import { z } from 'zod';
import { Role } from '../constants/roles';

const roleValues = Object.values(Role) as [string, ...string[]];

/** ロールIDバリデーション */
export const roleIdSchema = z.enum(roleValues);

/** メールアドレスバリデーション */
export const emailSchema = z.string().email();

/** ページネーションクエリバリデーション */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
