import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshExpiryDate,
} from "../lib/jwt";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../validators/auth.validators";

export async function register(req: Request, res: Response): Promise<void> {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  const { name, email, password } = result.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const payload = { userId: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshExpiryDate(),
      },
    });

    res.status(201).json({ user, accessToken, refreshToken });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  const { email, password } = result.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshExpiryDate(),
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, accessToken, refreshToken });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const result = refreshSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  const { refreshToken } = result.data;

  try {
    const payload = verifyRefreshToken(refreshToken);

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    const newPayload = { userId: payload.userId, email: payload.email };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: payload.userId,
        expiresAt: getRefreshExpiryDate(),
      },
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const result = refreshSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  const { refreshToken } = result.data;

  try {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    res.json({ message: "Logged out successfully" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}
