import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
  ) {}

  findAll(): Promise<Profile[]> {
    return this.profilesRepository.find();
  }

  async getFriendsByUrl(url: string): Promise<Profile[]> {
    const profile = await this.profilesRepository.findOne({
      where: { url },
      relations: ['friends'], // This is crucial to load the friends
    });

    if (!profile) {
      // Throws a 404 Not Found error if the profile URL doesn't exist
      throw new NotFoundException(`Profile with URL ${url} not found`);
    }

    // Use .map() to return just the URL of each friend
    return profile.friends;
  }

  async addProfileAndFriends(
    createProfileDto: CreateProfileDto,
  ): Promise<Profile | null> {
    const { profileUrl, friendUrls } = createProfileDto;

    const mainProfile = await this.findOrCreateProfileByUrl(profileUrl);
    const uniqueFriendUrls = [...new Set(friendUrls)];
    const friendProfiles = await Promise.all(
      uniqueFriendUrls.map((url) => this.findOrCreateProfileByUrl(url)),
    );

    const existingRelations = await this.profilesRepository.findOne({
      where: { id: mainProfile.id },
      relations: ['friends'],
    });

    if (!existingRelations) {
      throw new Error('Could not find the main profile after creating it.');
    }

    const existingFriendIds = new Set(
      existingRelations.friends.map((f) => f.id),
    );

    const newFriendRelations = friendProfiles.filter(
      (friend) =>
        !existingFriendIds.has(friend.id) && friend.id !== mainProfile.id,
    );

    if (newFriendRelations.length > 0) {
      await this.profilesRepository
        .createQueryBuilder()
        .relation(Profile, 'friends')
        .of(mainProfile)
        .add(newFriendRelations.map((friend) => friend.id));
    }

    return this.profilesRepository.findOne({
      where: { id: mainProfile.id },
      relations: ['friends'],
    });
  }

  private async findOrCreateProfileByUrl(url: string): Promise<Profile> {
    const existingProfile = await this.profilesRepository.findOneBy({ url });
    if (existingProfile) {
      return existingProfile;
    }

    try {
      const newProfile = this.profilesRepository.create({ url });
      return await this.profilesRepository.save(newProfile);
    } catch (error) {
      if (error.code === '23505') {
        const profile = await this.profilesRepository.findOneBy({ url });
        if (profile) {
          return profile;
        }
        throw new Error(
          `Could not find profile for url: ${url} after race condition.`,
        );
      }
      throw error;
    }
  }
}
