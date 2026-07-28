const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE Complaint ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;');
    console.log('Column added!');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
