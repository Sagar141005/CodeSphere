import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: { inviteId: string } }
) {
  const { inviteId } = context.params;
  const { action } = await req.json();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invite = await prisma.teamInvite.findUnique({
    where: { id: inviteId },
    include: { team: true },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  // Only invited user can respond
  if (invite.invitedId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "ACCEPT") {
    await prisma.$transaction([
      prisma.teamInvite.update({
        where: { id: inviteId },
        data: { status: "ACCEPTED" },
      }),
      prisma.team.update({
        where: { id: invite.teamId },
        data: {
          members: { connect: { id: invite.invitedId } },
        },
      }),
    ]);
  }

  if (action === "REJECT") {
    await prisma.teamInvite.update({
      where: { id: inviteId },
      data: { status: "REJECTED" },
    });
  }

  return NextResponse.json({ success: true });
}
