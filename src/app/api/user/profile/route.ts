import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
    const { name, image } = await req.json();
    if (!name && !image)
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name && { name }),
        ...(image && { image }),
      },
      select: { id: true, name: true, email: true, image: true },
    });
  
    return NextResponse.json(updatedUser);
}
  