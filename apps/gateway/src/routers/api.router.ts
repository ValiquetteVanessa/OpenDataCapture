import { $CreateRemoteAssignmentData, $UpdateAssignmentData } from '@open-data-capture/common/assignment';
import type {
  AssignmentStatus,
  MutateAssignmentResponseBody,
  RemoteAssignment
} from '@open-data-capture/common/assignment';
import { $Json } from '@open-data-capture/common/core';
import { Router } from 'express';

import { prisma } from '@/lib/prisma';
import { ah } from '@/utils/async-handler';
import { HttpException } from '@/utils/http-exception';

const router = Router();

router.get(
  '/assignments',
  ah(async (req, res) => {
    let subjectId: string | undefined;
    if (typeof req.query.subjectId === 'string') {
      subjectId = req.query.subjectId;
    }
    const assignments = await prisma.remoteAssignmentModel.findMany({
      where: {
        subjectId
      }
    });
    return res.status(200).json(
      assignments.map((assignment) => {
        return {
          ...assignment,
          data: assignment.data ? $Json.parse(assignment.data) : null,
          status: assignment.status as AssignmentStatus
        } satisfies RemoteAssignment;
      })
    );
  })
);

router.post(
  '/assignments',
  ah(async (req, res) => {
    const result = await $CreateRemoteAssignmentData.safeParseAsync(req.body);
    if (!result.success) {
      throw new HttpException(400, 'Bad Request');
    }
    await prisma.remoteAssignmentModel.create({
      data: result.data
    });
    res.status(201).send({ success: true } satisfies MutateAssignmentResponseBody);
  })
);

router.patch(
  '/assignments/:id',
  ah(async (req, res) => {
    const id = req.params.id;
    const assignment = await prisma.remoteAssignmentModel.findFirst({
      where: { id }
    });
    if (!assignment) {
      throw new HttpException(404, `Failed to Find Assignment with ID: ${id}`);
    }
    const result = await $UpdateAssignmentData.safeParseAsync(req.body);
    if (!result.success) {
      console.log(result.error);
      throw new HttpException(400, 'Bad Request');
    }
    await prisma.remoteAssignmentModel.update({
      data: {
        completedAt: result.data.data ? new Date() : undefined,
        data: JSON.stringify(result.data.data),
        expiresAt: result.data.expiresAt,
        status: result.data.data ? ('COMPLETE' satisfies AssignmentStatus) : result.data.status
      },
      where: {
        id: assignment.id
      }
    });
    res.status(200).json({ success: true } satisfies MutateAssignmentResponseBody);
  })
);

router.delete(
  '/assignments/:id',
  ah(async (req, res) => {
    const id = req.params.id;
    const assignment = await prisma.remoteAssignmentModel.findFirst({
      where: { id }
    });
    if (!assignment) {
      throw new HttpException(404, `Failed to Find Assignment with ID: ${id}`);
    }
    await prisma.remoteAssignmentModel.delete({
      where: { id }
    });
    res.status(200).json({ success: true } satisfies MutateAssignmentResponseBody);
  })
);

export { router as apiRouter };
