import { ApiProperty } from '@nestjs/swagger';

import { Group, groupSchema } from '@douglasneuroinformatics/common';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator.js';

@ValidationSchema<Group>(groupSchema)
export class CreateGroupDto implements Group {
  @ApiProperty({ example: 'Depression Clinic' })
  name: string;
}
