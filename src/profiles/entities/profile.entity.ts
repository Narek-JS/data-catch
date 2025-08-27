import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  url: string;

  @Column({ nullable: true })
  name?: string;

  @ManyToMany(() => Profile)
  @JoinTable()
  friends: Profile[];
}
