import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export const POST = withErrorHandling(async (req) => {
  await requireRole(MANAGEMENT_ROLES);

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) return fail("No file provided", 422);

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return fail("Only JPEG, PNG, WEBP, or GIF images are allowed.", 422);
  }
  if (file.size > 5 * 1024 * 1024) {
    return fail("Image must be smaller than 5MB.", 422);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return ok({ url: `/uploads/${filename}` }, { status: 201 });
});
