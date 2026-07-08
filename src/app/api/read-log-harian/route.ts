import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), "public", "LOG HARIAN.md");
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "LOG HARIAN.md not found in project root." }, { status: 404 });
        }
        const content = fs.readFileSync(filePath, "utf-8");
        return NextResponse.json({ content });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
