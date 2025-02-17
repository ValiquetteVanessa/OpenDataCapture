import { Injectable } from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import type { Group } from '@open-data-capture/common/group';
import type { SubjectIdentificationData } from '@open-data-capture/common/subject';
import type { CreateVisitData, Visit } from '@open-data-capture/common/visit';
import type { SubjectModel } from '@open-data-capture/database/core';

import { GroupsService } from '@/groups/groups.service';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';
import { SubjectsService } from '@/subjects/subjects.service';

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel('Visit') private readonly visitModel: Model<'Visit'>,
    private readonly groupsService: GroupsService,
    private readonly subjectsService: SubjectsService
  ) {}

  async create({ date, groupId, subjectIdData }: CreateVisitData): Promise<Visit> {
    const subject = await this.resolveSubject(subjectIdData);

    // If the subject is not yet associated with the group, check it exists then append it
    let group: Group | null = null;
    if (groupId && !subject.groupIds.includes(groupId)) {
      group = await this.groupsService.findById(groupId);
      await this.subjectsService.updateById(subject.id, { groupIds: { push: group.id } });
    }

    const { id } = await this.visitModel.create({
      data: {
        date,
        group: group
          ? {
              connect: { id: group.id }
            }
          : undefined,
        subject: {
          connect: { id: subject.id }
        }
      }
    });

    return (await this.visitModel.findUnique({
      include: {
        subject: true
      },
      where: { id }
    }))!;
  }

  /** Get the subject if they exist, otherwise create them */
  private async resolveSubject(subjectIdData: SubjectIdentificationData) {
    let subject: SubjectModel;
    try {
      subject = await this.subjectsService.findByLookup(subjectIdData);
    } catch (err) {
      if (!(err instanceof NotFoundException)) {
        throw new InternalServerErrorException('Unexpected Error', { cause: err });
      }
      subject = await this.subjectsService.create(subjectIdData);
    }
    return subject;
  }
}
