import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireCustomer } from "@/lib/api/customer-auth";

export async function GET() {
  const { error, user } = await requireCustomer();
  if (error || !user) {
    return jsonError("Unauthorized", 401);
  }

  const profileComplete = Boolean(
    user.businessName &&
      user.contactPerson &&
      user.email &&
      user.gstin &&
      user.businessType,
  );

  return jsonOk({
    id: user.id,
    phone: user.phone,
    businessName: user.businessName,
    contactPerson: user.contactPerson,
    email: user.email,
    gstin: user.gstin,
    businessType: user.businessType,
    profileComplete,
  });
}
