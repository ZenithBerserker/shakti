/**
 * Create or reset an admin user (bcrypt password). Loads `.env` / `.env.local` for DATABASE_URL.
 *
 *   npm run admin:create -- <email> <password> [displayName]
 *
 * Example:
 *   npm run admin:create -- admin@cleaningb2b.demo 'Admin@12345' 'Operations Admin'
 */
import { loadEnvFromDotfiles } from "./load-env-from-dotfiles";

loadEnvFromDotfiles();

async function main() {
  const { Role } = await import("@prisma/client");
  const bcrypt = (await import("bcryptjs")).default;
  const { prisma } = await import("../src/lib/prisma");

  const [, , emailRaw, password, nameArg] = process.argv;
  if (!emailRaw || !password) {
    console.error(
      "Usage: npm run admin:create -- <email> <password> [displayName]",
    );
    process.exit(1);
  }

  const email = emailRaw.toLowerCase().trim();
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const name = nameArg?.trim() || "Operations Admin";

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name, role: Role.ADMIN },
  });

  console.log("OK — admin saved:", admin.email, admin.name, admin.role);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
