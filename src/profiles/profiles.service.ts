import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
  ) {}

  async addProfileAndFriends(
    createProfileDto: CreateProfileDto,
  ): Promise<Profile | null> {
    const { profileUrl, friendUrls } = createProfileDto;

    // "Find or Create" the main profile
    const mainProfile = await this.findOrCreateProfileByUrl(profileUrl);

    // "Find or Create" all friend profiles
    const friendProfiles = await Promise.all(
      friendUrls.map((url) => this.findOrCreateProfileByUrl(url)),
    );

    // Load existing friends to avoid removing them
    const mainProfileWithFriends = await this.profilesRepository.findOne({
      where: { id: mainProfile.id },
      relations: ['friends'],
    });

    if (!mainProfileWithFriends) {
      // This case is unlikely if findOrCreateProfileByUrl works, but it's good practice
      return null;
    }

    // Add the new friends to the existing friends list
    const existingFriendIds = new Set(
      mainProfileWithFriends.friends.map((f) => f.id),
    );
    for (const friend of friendProfiles) {
      if (!existingFriendIds.has(friend.id) && mainProfile.id !== friend.id) {
        mainProfileWithFriends.friends.push(friend);
      }
    }

    // Save the main profile with its updated friends list
    return this.profilesRepository.save(mainProfileWithFriends);
  }

  private async findOrCreateProfileByUrl(url: string): Promise<Profile> {
    const existingProfile = await this.profilesRepository.findOneBy({ url });
    if (existingProfile) {
      return existingProfile;
    }

    const newProfile = this.profilesRepository.create({ url });
    return this.profilesRepository.save(newProfile);
  }
}
