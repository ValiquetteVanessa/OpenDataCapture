import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { randomValue } from '@douglasneuroinformatics/utils';
import { faker } from '@faker-js/faker';
import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { type Json, toUpperCase } from '@open-data-capture/common/core';
import type { Group } from '@open-data-capture/common/group';
import type {
  FormInstrument,
  FormInstrumentFields,
  FormInstrumentStaticField,
  FormInstrumentUnknownField
} from '@open-data-capture/common/instrument';
import type { Subject, SubjectIdentificationData } from '@open-data-capture/common/subject';
import { DEMO_GROUPS, DEMO_USERS } from '@open-data-capture/demo';
import {
  breakoutTask,
  briefPsychiatricRatingScale,
  enhancedDemographicsQuestionnaire,
  happinessQuestionnaire,
  miniMentalStateExamination,
  montrealCognitiveAssessment
} from '@open-data-capture/instrument-library';

import { GroupsService } from '@/groups/groups.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { PrismaService } from '@/prisma/prisma.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';
import { VisitsService } from '@/visits/visits.service';

faker.seed(123);

@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);

  constructor(
    private readonly groupsService: GroupsService,
    private readonly instrumentRecordsService: InstrumentRecordsService,
    private readonly instrumentsService: InstrumentsService,
    private readonly prismaService: PrismaService,
    private readonly subjectsService: SubjectsService,
    private readonly usersService: UsersService,
    private readonly visitsService: VisitsService
  ) {}

  async init({ dummySubjectCount }: { dummySubjectCount: number }): Promise<void> {
    try {
      const dbName = await this.prismaService.getDbName();
      this.logger.log(`Initializing demo for database: '${dbName}'`);

      const forms = await Promise.all([
        this.instrumentsService.createFromBundle(briefPsychiatricRatingScale),
        this.instrumentsService.createFromBundle(enhancedDemographicsQuestionnaire),
        this.instrumentsService.createFromBundle(happinessQuestionnaire),
        this.instrumentsService.createFromBundle(miniMentalStateExamination),
        this.instrumentsService.createFromBundle(montrealCognitiveAssessment)
      ]);

      this.logger.debug('Done creating forms');

      await this.instrumentsService.createFromBundle(breakoutTask);
      this.logger.debug('Done creating interactive instruments');

      const groups: Group[] = [];
      for (const group of DEMO_GROUPS) {
        groups.push(await this.groupsService.create(group));
      }
      this.logger.debug('Done creating groups');

      for (const user of DEMO_USERS) {
        await this.usersService.create({
          ...user,
          groupIds: user.groupNames.map((name) => groups.find((group) => group.name === name)!.id)
        });
      }
      this.logger.debug('Done creating users');

      for (let i = 0; i < dummySubjectCount; i++) {
        this.logger.debug(`Creating dummy subject ${i + 1}/${dummySubjectCount}`);
        const group = randomValue(groups);
        const subject = await this.createSubject();
        await this.visitsService.create({
          date: new Date(),
          groupId: group.id,
          subjectIdData: subject
        });
        for (const form of forms) {
          this.logger.debug(`Creating dummy records for form ${form.name}`);
          for (let i = 0; i < 10; i++) {
            const data = this.createFormRecordData(
              await form.toInstance({ kind: 'FORM' }),
              form.name === 'EnhancedDemographicsQuestionnaire'
                ? {
                    customValues: {
                      postalCode: 'A1A-1A1'
                    }
                  }
                : undefined
            );
            await this.instrumentRecordsService.create({
              data: data as Json,
              date: faker.date.past({ years: 2 }),
              groupId: group.id,
              instrumentId: form.id,
              subjectId: subject.id
            });
          }
        }
        this.logger.debug(`Done creating dummy subject ${i + 1}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.cause);
        this.logger.error(err);
      }
      throw err;
    }
  }

  private createFormRecordData<TData extends FormDataType>(
    form: FormInstrument<TData>,
    options?: {
      customValues?: {
        [K in keyof TData]?: TData[K];
      };
    }
  ) {
    let fields: FormInstrumentFields<TData>;
    if (!Array.isArray(form.content)) {
      fields = form.content;
    } else {
      fields = form.content.reduce((prev, current) => {
        return { ...prev, ...current.fields };
      }, form.content[0].fields) as FormInstrumentFields<TData>;
    }

    const data: Partial<TData> = {};
    for (const fieldName in fields) {
      const field = fields[fieldName] as FormInstrumentUnknownField<TData>;
      const customValue = options?.customValues?.[fieldName];
      if (customValue) {
        data[fieldName] = customValue;
        continue;
      } else if (field.kind === 'dynamic') {
        const staticField = field.render(null);
        if (!staticField) {
          continue;
        }
        data[fieldName] = this.createMockStaticFieldValue(staticField) as TData[typeof fieldName];
      } else {
        data[fieldName] = this.createMockStaticFieldValue(field) as TData[typeof fieldName];
      }
    }
    return data as TData;
  }

  private createMockStaticFieldValue(field: FormInstrumentStaticField) {
    switch (field.kind) {
      case 'array':
        throw new NotImplementedException();
      case 'binary':
        return faker.datatype.boolean();
      case 'date':
        return faker.date.past({ years: 1 }).toISOString();
      case 'numeric':
        return faker.number.int({ max: field.max, min: field.min });
      case 'options':
        return typeof field.options.en === 'string'
          ? randomValue(Object.keys(field.options))
          : randomValue(Object.keys(field.options.en));
      case 'text':
        return faker.lorem.sentence();
    }
  }

  private async createSubject() {
    return this.subjectsService.create({
      dateOfBirth: faker.date.birthdate(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      sex: toUpperCase(faker.person.sexType())
    }) as Promise<Subject & SubjectIdentificationData>;
  }
}
