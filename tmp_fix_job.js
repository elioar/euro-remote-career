const { PrismaClient } = require('../lib/generated/prisma'); // Try direct import
const prisma = new PrismaClient();

async function main() {
  const job = await prisma.job.findUnique({
    where: { slug: 'test-job' }, // Likely the slug for "Test Job"
    include: { moderationLogs: { orderBy: { createdAt: 'desc' }, take: 1 } }
  }) || await prisma.job.findFirst({
    where: { title: 'Test Job' },
    include: { moderationLogs: { orderBy: { createdAt: 'desc' }, take: 1 } }
  });

  if (job && job.status === 'PENDING_REVIEW' && job.moderationLogs[0]?.action === 'APPROVED') {
    console.log(`Fixing job: ${job.title}`);
    await prisma.moderationLog.update({
      where: { id: job.moderationLogs[0].id },
      data: { action: 'PENDING' }
    });
    console.log('Fixed!');
  } else {
    console.log('No inconsistent data found for Test Job.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
