export class CreateOrderDto {
  flowerProductId!: string;
  quantity!: number;
  message?: string;
  recipientName?: string;
  recipientAddress?: string;
}
