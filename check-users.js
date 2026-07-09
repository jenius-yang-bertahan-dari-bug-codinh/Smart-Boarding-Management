const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.update({
    where: { email: 'admin@example.com' },
    data: { password: hashedPassword }
  });
  console.log("Password reset for admin@example.com to 'admin123'");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
