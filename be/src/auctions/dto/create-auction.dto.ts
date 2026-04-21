import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateAuctionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @IsNotEmpty()
  @IsNumberString()
  startingPrice: string;

  @IsNotEmpty()
  @IsNumberString()
  bidIncrement: string;

  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;
}
