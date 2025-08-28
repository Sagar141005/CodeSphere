import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const { email } = await req.json();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const room = await prisma.room.findUnique({
    where: { slug },
    include: { owner: true },
  });
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // Only owner can invite
  if (room.owner.email !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userToInvite = await prisma.user.findUnique({
    where: { email },
  });
  if (!userToInvite) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const invite = await prisma.roomInvite.create({
    data: {
      roomId: room.id,
      invitedId: userToInvite.id,
      invitedById: room.ownerId,
      status: "PENDING",
    },
  });

  return NextResponse.json(invite);
}
