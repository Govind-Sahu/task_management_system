import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from "../validators/task.validators";
import { TaskStatus } from "@prisma/client";

export async function getTasks(req: AuthRequest, res: Response): Promise<void> {
  const queryResult = taskQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({ error: queryResult.error.issues[0].message });
    return;
  }

  const { page, limit, status, search } = queryResult.data;
  const userId = req.user!.userId;

  try {
    const where: {
      userId: string;
      status?: TaskStatus;
      title?: { contains: string };
    } = { userId };

    if (status) where.status = status;
    if (search) where.title = { contains: search };

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createTask(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const result = createTaskSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  const userId = req.user!.userId;

  try {
    const task = await prisma.task.create({
      data: { ...result.data, userId },
    });
    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getTask(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const userId = req.user!.userId;

  try {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json(task);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateTask(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const id = req.params.id as string;
  const userId = req.user!.userId;

  const result = updateTaskSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  try {
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const task = await prisma.task.update({
      where: { id },
      data: result.data,
    });
    res.json(task);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteTask(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const id = req.params.id as string;
  const userId = req.user!.userId;

  try {
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: "Task deleted successfully" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function toggleTask(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const id = req.params.id as string;
  const userId = req.user!.userId;

  try {
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const nextStatus =
      existing.status === "COMPLETED" ? "PENDING" : "COMPLETED";

    const task = await prisma.task.update({
      where: { id },
      data: { status: nextStatus },
    });
    res.json(task);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}
