import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const team = await prisma.team.findUnique({
    where: { id },
    include: { createdBy: true },
  });

  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  if (team.createdById === user.id) {
    return NextResponse.json({ error: "Owner cannot leave the team" }, { status: 403 });
  }

  await prisma.team.update({
    where: { id },
    data: {
      members: { disconnect: { id: user.id } },
    },
  });

  return NextResponse.json({ success: true });
}
