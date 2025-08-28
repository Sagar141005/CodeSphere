import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ inviteId: string }> }
) {
  const { inviteId } = await context.params;
  const { action } = await req.json(); // "ACCEPT" or "REJECT"

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch invite
  const invite = await prisma.roomInvite.findUnique({
    where: { id: inviteId },
    include: { room: true },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  // Only invited user may respond
  if (invite.invitedId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "ACCEPT") {
    await prisma.$transaction([
      prisma.roomInvite.update({
        where: { id: inviteId },
        data: { status: "ACCEPTED" },
      }),
      prisma.room.update({
        where: { id: invite.roomId },
        data: {
          members: { connect: { id: invite.invitedId } },
        },
      }),
    ]);
  }

  if (action === "REJECT") {
    await prisma.roomInvite.update({
      where: { id: inviteId },
      data: { status: "REJECTED" },
    });
  }

  return NextResponse.json({ success: true });
}
