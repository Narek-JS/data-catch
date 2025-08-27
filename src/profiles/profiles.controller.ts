import { Controller, Post, Body } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  addProfileAndFriends(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.addProfileAndFriends(createProfileDto);
  }
}
