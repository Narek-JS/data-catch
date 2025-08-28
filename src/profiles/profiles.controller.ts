import {
  DefaultValuePipe,
  ParseIntPipe,
  Controller,
  Patch,
  Query,
  Post,
  Body,
  Get,
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  findAll() {
    return this.profilesService.findAll();
  }

  @Get('friends')
  getFriendsByUrl(@Query('url') profileUrl: string) {
    return this.profilesService.getFriendsByUrl(profileUrl);
  }

  @Get('needs-update')
  findProfilesToUpdate(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.profilesService.findProfilesToUpdate(limit);
  }

  @Patch()
  updateName(@Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.updateName(updateProfileDto);
  }

  @Post()
  addProfileAndFriends(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.addProfileAndFriends(createProfileDto);
  }
}
