import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json([], { status: 200 });
  }

  const invites = await prisma.roomInvite.findMany({
    where: { invitedId: session.user.id, status: "PENDING" },
    include: {
      room: true,
      invitedBy: true,
    },
  });

  return NextResponse.json(invites);
}
