import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('friends')
  getFriendsByUrl(@Query('url') profileUrl: string) {
    return this.profilesService.getFriendsByUrl(profileUrl);
  }

  @Post()
  addProfileAndFriends(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.addProfileAndFriends(createProfileDto);
  }
}
