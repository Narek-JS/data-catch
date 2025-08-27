import { IsArray, IsUrl } from 'class-validator';

export class CreateProfileDto {
  @IsUrl()
  profileUrl: string;

  @IsArray()
  @IsUrl({}, { each: true })
  friendUrls: string[];
}
