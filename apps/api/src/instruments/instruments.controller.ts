/* eslint-disable perfectionist/sort-classes */

import { CurrentUser } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AppAbility, InstrumentKind } from '@open-data-capture/common';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { InstrumentsService } from './instruments.service';

@ApiTags('Instruments')
@Controller({ path: 'instruments', version: '2' })
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @ApiOperation({ summary: 'Create Instrument' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  create(@Body() data: CreateInstrumentDto) {
    return this.instrumentsService.create(data);
  }

  @ApiOperation({ summary: 'Summarize Available Instruments' })
  @Get('available')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findAvailable(@CurrentUser('ability') ability: AppAbility, @Query('kind') kind?: InstrumentKind) {
    return this.instrumentsService.findAvailable({ kind }, { ability });
  }

  // @ApiOperation({ summary: 'Get Instrument Sources' })
  // @Get('sources')
  // @RouteAccess({ action: 'read', subject: 'Instrument' })
  // async findSources(@CurrentUser('ability') ability: AppAbility, @Query('kind') kind?: InstrumentKind) {
  //   return this.instrumentsService.findSources({ kind }, { ability });
  // }
}
