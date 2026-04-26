import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CategoryDto {
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString()
  @MinLength(2)
  name: string;

  @IsNotEmpty()
  @IsString()
  slug: string;
}
