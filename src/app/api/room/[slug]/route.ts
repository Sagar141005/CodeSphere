import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  _: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params; // ✅ Await params
  try {
    const room = await prisma.room.findUnique({
      where: { slug },
      select: { id: true, name: true, content: true, slug: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

export async function POST(
  _: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const room = await prisma.room.findUnique({
    where: { slug },
    select: {
      id: true,
      ownerId: true,
      members: { select: { id: true } },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (room.ownerId === session.user.id) {
    // Owner should delete instead of leave
    return NextResponse.json(
      { error: "Owner cannot leave the room. Delete it instead." },
      { status: 400 }
    );
  }

  const isMember = room.members.some((m) => m.id === session.user.id);
  if (!isMember) {
    return NextResponse.json(
      { error: "You are not a member of this room." },
      { status: 400 }
    );
  }

  // Disconnect user from members
  await prisma.room.update({
    where: { id: room.id },
    data: { members: { disconnect: { id: session.user.id } } },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params; // ✅ Await params
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const room = await prisma.room.findUnique({
      where: { slug },
      include: {
        owner: true,
        team: {
          include: {
            createdBy: true,
          },
        },
      },
    });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const isOwner =
      room.owner.email === session.user.email ||
      room.team?.createdBy?.email === session.user.email;
    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.room.delete({
      where: { slug },
    });

    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params; // ✅ Await params
  try {
    const { content } = await req.json();

    const updatedRoom = await prisma.room.update({
      where: { slug },
      data: { content },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}
