import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, context: { params: { slug: string, id: string } }) {
  const { id } = await context.params;
    try {
        const commit = await prisma.commit.findUnique({
            where: { id },
            include: { files: true }
        });

        if(!commit) {
            return NextResponse.json({ error: "Commit not found" }, { status: 404 });
        }

        return NextResponse.json(commit);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch commit" }, { status: 500 });
    }
}