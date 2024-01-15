import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { linearRegression } from '@douglasneuroinformatics/stats';
import { yearsPassed } from '@douglasneuroinformatics/utils';
import { Injectable } from '@nestjs/common';
import { evaluateInstrument } from '@open-data-capture/common/instrument';
import type { FormInstrumentMeasures } from '@open-data-capture/common/instrument';
import type {
  CreateInstrumentRecordData,
  InstrumentRecordsExport,
  LinearRegressionResults
} from '@open-data-capture/common/instrument-records';
import type { Prisma } from '@prisma/client';

import { accessibleQuery } from '@/ability/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';
import { SubjectsService } from '@/subjects/subjects.service';

@Injectable()
export class InstrumentRecordsService {
  constructor(
    @InjectModel('InstrumentRecord') private readonly instrumentRecordModel: Model<'InstrumentRecord'>,
    private readonly groupsService: GroupsService,
    private readonly instrumentsService: InstrumentsService,
    private readonly subjectsService: SubjectsService
  ) {}

  async count(
    filter: NonNullable<Parameters<Model<'InstrumentRecord'>['count']>[0]>['where'] = {},
    { ability }: EntityOperationOptions = {}
  ) {
    return this.instrumentRecordModel.count({
      where: { AND: [accessibleQuery(ability, 'read', 'InstrumentRecord'), filter] }
    });
  }

  async create(
    { data, date, groupId, instrumentId, subjectId }: CreateInstrumentRecordData,
    options?: EntityOperationOptions
  ) {
    if (groupId) {
      await this.groupsService.findById(groupId, options);
    }
    await this.instrumentsService.findById(instrumentId);
    const subject = await this.subjectsService.findById(subjectId);

    return this.instrumentRecordModel.create({
      data: {
        data,
        date,
        groupId,
        instrumentId,
        subjectId: subject.id
      }
    });
  }

  async exists(where: Prisma.InstrumentRecordModelWhereInput) {
    return this.instrumentRecordModel.exists(where);
  }

  async exportRecords(
    { groupId }: { groupId?: string } = {},
    { ability }: EntityOperationOptions = {}
  ): Promise<InstrumentRecordsExport> {
    const subjects = await this.subjectsService.find({ groupId }, { ability });
    const data: InstrumentRecordsExport = [];
    for (const subject of subjects) {
      const records = await this.instrumentRecordModel.findMany({
        include: { instrument: true },
        where: { groupId, subjectId: subject.id }
      });
      for (const record of records) {
        if (record.instrument.kind !== 'FORM') {
          continue;
        }
        const formData = record.data as FormDataType;
        for (const measure of Object.keys(formData)) {
          data.push({
            instrumentName: record.instrument.name,
            instrumentVersion: record.instrument.version,
            measure: measure,
            subjectAge: yearsPassed(subject.dateOfBirth),
            subjectId: subject.id,
            subjectSex: subject.sex,
            timestamp: record.date.toISOString(),
            value: formData[measure] as unknown
          });
        }
      }
    }
    return data;
  }

  async find(
    {
      groupId,
      instrumentId,
      minDate,
      subjectId
    }: { groupId?: string; instrumentId?: string; minDate?: Date; subjectId?: string },
    { ability }: EntityOperationOptions = {}
  ) {
    groupId && (await this.groupsService.findById(groupId));
    instrumentId && (await this.instrumentsService.findById(instrumentId));

    const records = await this.instrumentRecordModel.findMany({
      include: {
        instrument: {
          select: {
            bundle: true,
            kind: true
          }
        }
      },
      where: {
        AND: [
          { date: { gte: minDate } },
          { groupId },
          { instrumentId },
          accessibleQuery(ability, 'read', 'InstrumentRecord'),
          { subjectId }
        ]
      }
    });

    return await Promise.all(
      records.map(async (record) => {
        if (record.instrument.kind === 'FORM') {
          const instance = await evaluateInstrument(record.instrument.bundle, { kind: 'FORM' });
          if (instance.measures) {
            (record as Record<string, any>).computedMeasures = this.computeMeasures(
              instance.measures,
              record.data as FormDataType
            );
          }
        }
        return record;
      })
    );
  }

  async linearModel(
    { groupId, instrumentId }: { groupId?: string; instrumentId: string },
    { ability }: EntityOperationOptions = {}
  ) {
    groupId && (await this.groupsService.findById(groupId));
    const instrument = await this.instrumentsService
      .findById(instrumentId)
      .then((instrument) => instrument.toInstance());
    if (instrument.kind !== 'FORM') {
      throw new Error(`Linear model is not available for instruments of kind '${instrument.kind}'`);
    } else if (!instrument.measures) {
      throw new Error('Instrument must contain measures');
    }

    const records = await this.instrumentRecordModel.findMany({
      include: { instrument: true },
      where: { AND: [accessibleQuery(ability, 'read', 'InstrumentRecord'), { groupId }, { instrumentId }] }
    });

    const data: Record<string, [number, number][]> = {};
    for (const record of records) {
      const computedMeasures = this.computeMeasures(instrument.measures, record.data as FormDataType);
      for (const measure in computedMeasures) {
        const x = record.date.getTime();
        const y = computedMeasures[measure]!;
        if (Array.isArray(data[measure])) {
          data[measure]!.push([x, y]);
        } else {
          data[measure] = [[x, y]];
        }
      }
    }

    const results: LinearRegressionResults = {};
    for (const measure in data) {
      results[measure] = linearRegression(data[measure]!);
    }
    return results;
  }

  private computeMeasures(measures: FormInstrumentMeasures, data: FormDataType) {
    const computedMeasures: Record<string, number> = {};
    for (const key in measures) {
      computedMeasures[key] = measures[key]!.value(data);
    }
    return computedMeasures;
  }
}
