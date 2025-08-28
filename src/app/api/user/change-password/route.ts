import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || !user.password)
    return NextResponse.json(
      { error: "Password change not allowed for social login users" },
      { status: 403 }
    );

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid)
    return NextResponse.json(
      { error: "Incorrect current password" },
      { status: 400 }
    );

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email: session.user.email },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ success: true });
}
