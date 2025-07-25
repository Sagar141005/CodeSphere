import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // replace spaces and special chars with -
    .replace(/(^-|-$)+/g, ""); // trim leading/trailing dashes
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Room name is required" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({
    where: { id },
    include: { createdBy: true },
  });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  if (team.createdBy.email !== session.user.email) {
    return NextResponse.json({ error: "Forbidden: Only team owner can add members" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  const room = await prisma.room.create({
    data: {
      name,
      slug: `${id}-${Date.now()}`,
      owner: { connect: { id: user?.id } },
      team: { connect: { id } },
      content: "",
    },
  });

  return NextResponse.json(room);
}
