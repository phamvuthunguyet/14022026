import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "stars.json");
    const raw = await readFile(filePath, "utf-8");
    const config = JSON.parse(raw);
    return NextResponse.json(config);
  } catch (e) {
    return NextResponse.json(
      {
        error:
          "Failed to load stars: " +
          (e instanceof Error ? e.message : String(e)),
      },
      { status: 500 },
    );
  }
}
