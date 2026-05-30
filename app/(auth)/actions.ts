"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, logoutCurrentSession } from "@/lib/auth/session";

const ADMIN_EMAIL = "admin@continuity.local";
const ADMIN_LOGIN_ALIAS = "admin";

const emailSchema = z.email("Ingresa un correo electrónico válido.");

const registerSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  email: emailSchema,
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "El correo o usuario es obligatorio."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export type AuthActionState = {
  error?: string;
};

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos de registro inválidos.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return { error: "Ese correo ya está registrado." };
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await hashPassword(parsed.data.password),
    },
    select: { id: true },
  });

  await createSession(user.id);
  redirect("/");
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos de inicio de sesión inválidos.",
    };
  }

  const identifier = parsed.data.identifier.toLowerCase();
  const email =
    identifier === ADMIN_LOGIN_ALIAS ? ADMIN_EMAIL : identifier;

  if (identifier !== ADMIN_LOGIN_ALIAS && !z.email().safeParse(identifier).success) {
    return {
      error: "Ingresa un correo válido o usa admin para la cuenta de prueba.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Correo o contraseña incorrectos." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  await logoutCurrentSession();
  redirect("/login");
}
