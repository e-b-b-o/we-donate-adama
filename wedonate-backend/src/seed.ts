import { PrismaClient, OrgType, DonationType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const password = await bcrypt.hash('devpass123', 12);

  // 1. Seed Kebeles
  const k1 = await prisma.kebele.upsert({
    where: { name: 'Adama Central Kebele' },
    update: {},
    create: { id: uuidv4(), name: 'Adama Central Kebele', status: 'ACTIVE' },
  });

  const k2 = await prisma.kebele.upsert({
    where: { name: 'Adama East Kebele' },
    update: {},
    create: { id: uuidv4(), name: 'Adama East Kebele', status: 'ACTIVE' },
  });

  // 2. Seed System Admin
  await prisma.user.upsert({
    where: { email: 'systemadmin@test.com' },
    update: {},
    create: {
      id: uuidv4(), firstName: 'System', lastName: 'Admin', email: 'systemadmin@test.com',
      password, role: 'SYSTEM_ADMIN', verificationStatus: 'VERIFIED'
    }
  });

  // 3. Seed City Admin
  await prisma.user.upsert({
    where: { email: 'cityadmin@test.com' },
    update: {},
    create: {
      id: uuidv4(), firstName: 'City', lastName: 'Admin', email: 'cityadmin@test.com',
      password, role: 'CITY_ADMIN', verificationStatus: 'VERIFIED'
    }
  });

  // 4. Seed Kebele Admin (for Adama Central)
  await prisma.user.upsert({
    where: { email: 'kebeleadmin@test.com' },
    update: {},
    create: {
      id: uuidv4(), firstName: 'Kebele', lastName: 'Admin', email: 'kebeleadmin@test.com',
      password, role: 'KEBELE_ADMIN', kebeleId: k1.id, verificationStatus: 'VERIFIED'
    }
  });

  // 5. Seed Normal User (Verified)
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      id: uuidv4(), firstName: 'Demo', lastName: 'User', email: 'user@test.com',
      password, role: 'USER', kebeleId: k1.id, verificationStatus: 'VERIFIED'
    }
  });

  // 6. Seed Pending User
  await prisma.user.upsert({
    where: { email: 'pendinguser@test.com' },
    update: {},
    create: {
      id: uuidv4(), firstName: 'Pending', lastName: 'User', email: 'pendinguser@test.com',
      password, role: 'USER', kebeleId: k2.id, verificationStatus: 'PENDING'
    }
  });

  // 7. Seed Organization
  const org = await prisma.user.upsert({
    where: { email: 'org@test.com' },
    update: {},
    create: {
      id: uuidv4(), firstName: 'Save', lastName: 'Adama', email: 'org@test.com',
      password, role: 'ORGANIZATION', verificationStatus: 'VERIFIED',
      orgName: 'Save Adama Foundation', orgType: 'NGO'
    }
  });

  // 8. Seed Pending Organization
  await prisma.user.upsert({
    where: { email: 'pendingorg@test.com' },
    update: {},
    create: {
      id: uuidv4(), firstName: 'Hope', lastName: 'Relief', email: 'pendingorg@test.com',
      password, role: 'ORGANIZATION', verificationStatus: 'PENDING',
      orgName: 'Hope Relief Org', orgType: 'PRIVATE_CHARITY'
    }
  });

  // 9. Create Support Requests
  // Only create if they don't exist by matching a unique constraint or checking existence.
  // We'll check by title to maintain idempotency.
  const existingSupportReq = await prisma.supportRequest.findFirst({ where: { title: 'Help for Medical Bills' } });
  let supportRequest;
  if (!existingSupportReq) {
    supportRequest = await prisma.supportRequest.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        kebeleId: k1.id,
        source: 'SELF_SERVICE',
        title: 'Help for Medical Bills',
        description: 'I need help paying for urgent medical surgery for my daughter.',
        category: 'MONEY',
        urgencyLevel: 5,
        goalAmount: 50000,
        raisedAmount: 5000,
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
        imageUrl: 'https://res.cloudinary.com/lggovb15/image/upload/v1726760721/n5f6vokf12s0x8koyd9x.jpg'
      }
    });
  } else {
    supportRequest = existingSupportReq;
  }

  const existingPendingSupportReq = await prisma.supportRequest.findFirst({ where: { title: 'School Supplies Needed' } });
  if (!existingPendingSupportReq) {
    await prisma.supportRequest.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        kebeleId: k2.id,
        source: 'SELF_SERVICE',
        title: 'School Supplies Needed',
        description: 'I need notebooks and pens for the upcoming school year.',
        category: 'OTHER',
        urgencyLevel: 2,
        status: 'PENDING_REVIEW',
        isPublished: false,
      }
    });
  }

  // 10. Create Campaigns
  const existingCampaign = await prisma.campaign.findFirst({ where: { title: 'Winter Blanket Drive' } });
  let campaign;
  if (!existingCampaign) {
    campaign = await prisma.campaign.create({
      data: {
        id: uuidv4(),
        userId: org.id,
        title: 'Winter Blanket Drive',
        description: 'Providing blankets for the homeless this winter in Adama.',
        category: 'CLOTHES',
        goalAmount: 200000,
        raisedAmount: 15000,
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        imageUrl: 'https://res.cloudinary.com/lggovb15/image/upload/v1726760721/n5f6vokf12s0x8koyd9x.jpg'
      }
    });
  } else {
    campaign = existingCampaign;
  }

  const existingPendingCampaign = await prisma.campaign.findFirst({ where: { title: 'Flood Relief Fund' } });
  if (!existingPendingCampaign) {
    await prisma.campaign.create({
      data: {
        id: uuidv4(),
        userId: org.id,
        title: 'Flood Relief Fund',
        description: 'Emergency funds for families affected by the recent floods.',
        category: 'MONEY',
        goalAmount: 500000,
        raisedAmount: 0,
        status: 'PENDING_REVIEW',
        isPublished: false,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // 11. Create Donations
  const existingDonationCampaign = await prisma.donation.findFirst({ where: { description: 'Demo campaign donation' } });
  if (!existingDonationCampaign && campaign) {
    await prisma.donation.create({
      data: {
        id: uuidv4(),
        donorId: user.id,
        campaignId: campaign.id,
        amount: 15000,
        currency: 'ETB',
        donationType: 'MONEY',
        paymentMethod: 'TELEBIRR',
        paymentStatus: 'SUCCESS',
        description: 'Demo campaign donation'
      }
    });
  }

  const existingDonationSupport = await prisma.donation.findFirst({ where: { description: 'Demo support request donation' } });
  if (!existingDonationSupport && supportRequest) {
    await prisma.donation.create({
      data: {
        id: uuidv4(),
        donorId: user.id,
        supportRequestId: supportRequest.id,
        amount: 5000,
        currency: 'ETB',
        donationType: 'MONEY',
        paymentMethod: 'CBE',
        paymentStatus: 'SUCCESS',
        description: 'Demo support request donation'
      }
    });
  }

  // 12. Public Content (News, Events, FAQs, HeroImages, GalleryPhotos, Testimonials)
  const existingNews = await prisma.news.findFirst({ where: { title: 'Launch of Adama WeDonate Platform' } });
  if (!existingNews) {
    await prisma.news.create({
      data: {
        id: uuidv4(),
        title: 'Launch of Adama WeDonate Platform',
        content: 'We are excited to announce the official launch of the WeDonate platform in Adama. Join us to support the community.',
        isPublished: true,
        imageUrl: 'https://res.cloudinary.com/lggovb15/image/upload/v1726760721/n5f6vokf12s0x8koyd9x.jpg'
      }
    });
  }

  const existingFAQ = await prisma.faq.findFirst({ where: { question: 'How can I register as an organization?' } });
  if (!existingFAQ) {
    await prisma.faq.create({
      data: {
        id: uuidv4(),
        question: 'How can I register as an organization?',
        answer: 'You can register by clicking "Sign Up", selecting "Organization", and providing your legal registration documents.',
        isActive: true,
        sortOrder: 1
      }
    });
  }

  const existingHero = await prisma.heroImage.findFirst({ where: { caption: 'Supporting Adama Together' } });
  if (!existingHero) {
    await prisma.heroImage.create({
      data: {
        id: uuidv4(),
        imageUrl: 'https://res.cloudinary.com/lggovb15/image/upload/v1726760721/n5f6vokf12s0x8koyd9x.jpg',
        caption: 'Supporting Adama Together',
        isActive: true,
        sortOrder: 1
      }
    });
  }

  const existingGallery = await prisma.galleryPhoto.findFirst({ where: { title: 'Community Distribution Event' } });
  if (!existingGallery) {
    await prisma.galleryPhoto.create({
      data: {
        id: uuidv4(),
        imageUrl: 'https://res.cloudinary.com/lggovb15/image/upload/v1726760721/n5f6vokf12s0x8koyd9x.jpg',
        title: 'Community Distribution Event',
        description: 'Volunteers distributing clothes to families in need.',
        uploadedBy: 'systemadmin@test.com'
      }
    });
  }
  
  const existingTestimonial = await prisma.testimonial.findFirst({ where: { name: 'Abebe Bikila' } });
  if (!existingTestimonial) {
    await prisma.testimonial.create({
      data: {
        id: uuidv4(),
        name: 'Abebe Bikila',
        role: 'Community Member',
        text: 'This platform has made it so easy to help those in need around me.',
        rating: 5,
        isActive: true
      }
    });
  }

  console.log('✅ Seed complete!');
  console.log('📋 Credentials (Password for all is devpass123):');
  console.log('  SYSTEM_ADMIN : systemadmin@test.com');
  console.log('  CITY_ADMIN   : cityadmin@test.com');
  console.log('  KEBELE_ADMIN : kebeleadmin@test.com');
  console.log('  USER         : user@test.com');
  console.log('  ORGANIZATION : org@test.com');
}

main().catch(console.error).finally(() => prisma.$disconnect());
