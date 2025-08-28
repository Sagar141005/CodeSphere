import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await req.json();
  if (!userId)
    return NextResponse.json({ error: "User ID required" }, { status: 400 });

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!currentUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const team = await prisma.team.findUnique({
    where: { id },
    include: { createdBy: true },
  });

  if (!team)
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  if (team.createdBy.id !== currentUser.id) {
    return NextResponse.json(
      { error: "Only team owner can remove members" },
      { status: 403 }
    );
  }

  await prisma.team.update({
    where: { id },
    data: {
      members: { disconnect: { id: userId } },
    },
  });

  return NextResponse.json({ success: true });
}
