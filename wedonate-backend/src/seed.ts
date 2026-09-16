import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const password = await bcrypt.hash('devpass123', 12);

  // Clear existing data (order respects foreign keys)
  await prisma.donation.deleteMany();
  await prisma.campaignUpdate.deleteMany();
  await prisma.inspectionReport.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.supportRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.message.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.kebele.deleteMany();

  // 1. Seed 2 Kebeles
  const k1 = await prisma.kebele.create({ data: { id: 'K-01', name: 'Kebele 1', status: 'ACTIVE' } });
  const k2 = await prisma.kebele.create({ data: { id: 'K-02', name: 'Kebele 2', status: 'ACTIVE' } });

  // 2. Seed City Admin
  await prisma.user.create({
    data: { 
      id: uuidv4(), firstName: 'City', lastName: 'Admin', email: 'cityadmin@test.com', 
      password, role: 'CITY_ADMIN', verificationStatus: 'VERIFIED' 
    }
  });

  // 3. Seed Kebele Admin (for Kebele 1)
  await prisma.user.create({
    data: { 
      id: uuidv4(), firstName: 'Kebele', lastName: 'Admin', email: 'kebeleadmin@test.com', 
      password, role: 'KEBELE_ADMIN', kebeleId: k1.id, verificationStatus: 'VERIFIED' 
    }
  });

  // 4. Seed 1 User
  const user = await prisma.user.create({
    data: { 
      id: uuidv4(), firstName: 'Normal', lastName: 'User', email: 'user@test.com', 
      password, role: 'USER', kebeleId: k1.id, verificationStatus: 'VERIFIED' 
    }
  });

  // 5. Seed 1 Organization
  const org = await prisma.user.create({
    data: { 
      id: uuidv4(), firstName: 'Org', lastName: 'Admin', email: 'org@test.com', 
      password, role: 'ORGANIZATION', verificationStatus: 'VERIFIED',
      orgName: 'Save The Children'
    }
  });

  // 6. Create 1 Direct Support for the User
  await prisma.supportRequest.create({
    data: {
      id: uuidv4(),
      userId: user.id,
      kebeleId: k1.id,
      source: 'SELF_SERVICE',
      title: 'Help for Medical Bills',
      description: 'I need help paying for urgent medical surgery.',
      category: 'MONEY',
      urgencyLevel: 5,
      goalAmount: 50000,
      raisedAmount: 0,
      status: 'PUBLISHED',
      isPublished: true,
      publishedAt: new Date()
    }
  });

  // 7. Create 1 Campaign for the Organization
  await prisma.campaign.create({
    data: {
      id: uuidv4(),
      userId: org.id,
      title: 'Winter Blanket Drive',
      description: 'Providing blankets for the homeless this winter.',
      category: 'CLOTHES',
      goalAmount: 200000,
      raisedAmount: 0,
      status: 'PUBLISHED',
      isPublished: true,
      publishedAt: new Date(),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  });

  console.log('✅ Seed complete!');
  console.log('📋 Credentials (Password for all is devpass123):');
  console.log('  CITY_ADMIN   : cityadmin@test.com');
  console.log('  KEBELE_ADMIN : kebeleadmin@test.com');
  console.log('  USER         : user@test.com');
  console.log('  ORGANIZATION : org@test.com');
}

main().catch(console.error).finally(() => prisma.$disconnect());
