export class UpdateOrderStatusDto {
  status!: 'pending' | 'confirmed' | 'in_production' | 'delivered';
}
