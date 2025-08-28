import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsUrl()
  url: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
