import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.room.update({
    where: { room_number: '101' },
    data: { status: 'Available' }
  })
  await prisma.room.update({
    where: { room_number: '205' },
    data: { status: 'Booked' }
  })
  console.log('Reset room statuses')
}
main()
