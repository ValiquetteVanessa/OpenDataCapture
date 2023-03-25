import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GroupEntity, GroupSchema } from './entities/group.entity';
import { GroupsController } from './groups.controller';
import { GroupsRepository } from './groups.repository';
import { GroupsService } from './groups.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GroupEntity.modelName,
        schema: GroupSchema
      }
    ])
  ],
  controllers: [GroupsController],
  providers: [GroupsRepository, GroupsService],
  exports: [GroupsService]
})
export class GroupsModule {}
