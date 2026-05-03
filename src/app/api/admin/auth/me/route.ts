import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-auth";

export async function GET() {
  const { error, admin } = await requireAdmin();
  if (error || !admin) return jsonError("Unauthorized", 401);

  return jsonOk({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
}
