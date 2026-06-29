import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'wana12345';

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const host = await prisma.user.upsert({
    where: { email: 'host@wana.local' },
    update: { passwordHash, role: 'host' },
    create: {
      email: 'host@wana.local',
      name: 'Waná Host',
      role: 'host',
      passwordHash,
    },
  });

  const guest = await prisma.user.upsert({
    where: { email: 'guest@wana.local' },
    update: { passwordHash, role: 'guest' },
    create: {
      email: 'guest@wana.local',
      name: 'Demo Guest',
      role: 'guest',
      passwordHash,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@wana.local' },
    update: { passwordHash, role: 'admin' },
    create: {
      email: 'admin@wana.local',
      name: 'Waná Admin',
      role: 'admin',
      passwordHash,
    },
  });

  const property = await prisma.property.upsert({
    where: { slug: 'domo-bosque-sereno' },
    update: {},
    create: {
      slug: 'domo-bosque-sereno',
      title: 'Domo Bosque Sereno',
      description:
        'Domo eco-lodge en el bosque con vista panorámica. Ideal para desconectar con naturaleza, fogata privada y cielo estrellado.',
      pricePerNight: 280000,
      maxGuests: 4,
      status: 'published',
      city: 'Villa de Leyva',
      country: 'CO',
      latitude: 5.6369,
      longitude: -73.5277,
      amenities: ['wifi', 'fogata', 'vista', 'estacionamiento'],
      hostId: host.id,
    },
  });

  await prisma.propertyMedia.deleteMany({ where: { propertyId: property.id } });
  await prisma.propertyMedia.createMany({
    data: [
      {
        propertyId: property.id,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200',
        thumbnailUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
        sortOrder: 0,
        status: 'approved',
        contentType: 'image/jpeg',
      },
      {
        propertyId: property.id,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1501785888041-7c11e575e336?w=1200',
        thumbnailUrl: 'https://images.unsplash.com/photo-1501785888041-7c11e575e336?w=400',
        sortOrder: 1,
        status: 'approved',
        contentType: 'image/jpeg',
      },
    ],
  });

  await prisma.review.deleteMany({ where: { propertyId: property.id } });
  await prisma.review.createMany({
    data: [
      { propertyId: property.id, rating: 5, comment: 'Experiencia mágica, volveremos.', isVisible: true },
      { propertyId: property.id, rating: 4, comment: 'Muy tranquilo y bien ubicado.', isVisible: true },
    ],
  });

  console.log('Seed complete:');
  console.log({
    hostId: host.id,
    guestId: guest.id,
    adminId: admin.id,
    propertySlug: property.slug,
    demoPassword: DEMO_PASSWORD,
    accounts: {
      guest: 'guest@wana.local',
      host: 'host@wana.local',
      admin: 'admin@wana.local',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
