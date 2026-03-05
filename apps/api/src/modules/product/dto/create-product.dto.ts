export class CreateProductDto {
  productCode!: string;
  name!: string;
  category!: string;
  price!: number;
  description?: string;
}
