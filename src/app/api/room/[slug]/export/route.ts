import { prisma } from "@/lib/prisma";
import JSZip from "jszip";
import { NextResponse } from "next/server";

async function bundleFileTree(
  zip: JSZip,
  files: any[],
  parentId: string | null
) {
  const children = files.filter((f) => f.parentId === parentId);

  for (const file of children) {
    if (file.type === "folder") {
      const folder = zip.folder(file.name);
      if (folder) {
        await bundleFileTree(folder, files, file.id);
      }
    } else {
      zip.file(file.name, file.content || "");
    }
  }
}

export async function GET(
  _: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  try {
    const room = await prisma.room.findUnique({
      where: { slug },
      include: { files: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const zip = new JSZip();
    await bundleFileTree(zip, room.files, null);

    const blob = await zip.generateAsync({ type: "blob" });

    return new NextResponse(blob.stream(), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${room.name}.zip"`,
      },
    });
  } catch (error) {
    console.error("Error exporting room:", error);
    return NextResponse.json(
      { error: "Failed to export room" },
      { status: 500 }
    );
  }
}
