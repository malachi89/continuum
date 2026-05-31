import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  getSessionTokenHash,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

async function getCurrentUserImpl(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: getSessionTokenHash(token),
    },
    select: {
      expiresAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return session.user;
}

export const getCurrentUser = cache(getCurrentUserImpl);
