import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { email } = await req.json();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const team = await prisma.team.findUnique({
    where: { id },
    include: { createdBy: true },
  });

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  if (team.createdBy.email !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userToInvite = await prisma.user.findUnique({ where: { email } });
  if (!userToInvite) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await prisma.teamInvite.findFirst({
    where: {
      teamId: team.id,
      invitedId: userToInvite.id,
      status: "PENDING",
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Invite already sent" }, { status: 400 });
  }

  const invite = await prisma.teamInvite.create({
    data: {
      teamId: team.id,
      invitedId: userToInvite.id,
      invitedById: team.createdById,
      status: "PENDING",
    },
  });

  return NextResponse.json(invite);
}
