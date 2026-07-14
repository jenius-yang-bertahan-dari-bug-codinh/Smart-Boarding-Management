const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const rooms = await prisma.room.findMany({
      include: {
        members: {
          where: { status: 'active' },
          take: 1
        }
      },
      orderBy: { room_number: 'asc' }
    });
    
    const mappedRooms = rooms.map(room => {
      const activeMember = room.members.length > 0 ? room.members[0] : null;
      return {
        id: room.id.toString(),
        roomNo: room.room_number,
        status: activeMember ? 'Active Member' : (room.status === 'Maintenance' ? 'Maintenance' : 'Empty Room')
      };
    });
    console.log(mappedRooms);
}
main().catch(console.error).finally(() => prisma.$disconnect());
