/**
 * Cleanup test/demo data while preserving GeneralSponsors, Articles,
 * and Suppliers that correspond to GeneralSponsors (matched by slug or
 * companyName ~ name).
 *
 * Deletes: Applications (+cascades), Vacancies, Masters, Partners,
 * non-sponsor Suppliers, demo-business-*@barsynergy.local users
 * (cascades their BusinessAccount + sessions + profiles).
 *
 * Defaults to dry-run. Pass --confirm to execute.
 * Refuses non-local DATABASE_URL hosts unless --force-remote.
 */
import { URL } from 'node:url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['error', 'warn'] });

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'postgres']);
const DEMO_EMAIL_PATTERN = /^demo-business-.*@barsynergy\.local$/i;

function parseFlags(argv) {
  return {
    confirm: argv.includes('--confirm'),
    forceRemote: argv.includes('--force-remote')
  };
}

function ensureLocalDb(databaseUrl, forceRemote) {
  if (!databaseUrl) throw new Error('DATABASE_URL is missing.');
  const parsed = new URL(databaseUrl);
  if (!LOCAL_HOSTS.has(parsed.hostname) && !forceRemote) {
    throw new Error(
      `Refusing to run against non-local DB host "${parsed.hostname}". Pass --force-remote to override.`
    );
  }
  return parsed.hostname;
}

function normalizeName(s) {
  return (s || '').trim().toLowerCase();
}

async function collectSponsorKeys() {
  const sponsors = await prisma.generalSponsor.findMany({
    select: { id: true, name: true, slug: true }
  });
  const slugs = new Set(sponsors.map((s) => s.slug));
  const names = new Set(sponsors.map((s) => normalizeName(s.name)));
  return { sponsors, slugs, names };
}

async function findKeepSupplierIds(sponsorSlugs, sponsorNames) {
  if (sponsorSlugs.size === 0 && sponsorNames.size === 0) return new Set();
  const suppliers = await prisma.supplier.findMany({
    select: { id: true, slug: true, companyName: true, title: true }
  });
  const keep = new Set();
  for (const s of suppliers) {
    if (sponsorSlugs.has(s.slug)) keep.add(s.id);
    else if (sponsorNames.has(normalizeName(s.companyName))) keep.add(s.id);
    else if (sponsorNames.has(normalizeName(s.title))) keep.add(s.id);
  }
  return keep;
}

async function buildReport() {
  const [
    sponsorInfo,
    applicationCount,
    vacancyCount,
    masterCount,
    partnerCount,
    supplierCount,
    articleCount,
    demoUsers
  ] = await Promise.all([
    collectSponsorKeys(),
    prisma.application.count(),
    prisma.vacancy.count(),
    prisma.master.count(),
    prisma.partner.count(),
    prisma.supplier.count(),
    prisma.article.count(),
    prisma.user.findMany({
      where: {
        email: { contains: '@barsynergy.local' }
      },
      select: { id: true, email: true, role: true }
    })
  ]);

  const keepSupplierIds = await findKeepSupplierIds(
    sponsorInfo.slugs,
    sponsorInfo.names
  );
  const demoUserMatches = demoUsers.filter((u) => DEMO_EMAIL_PATTERN.test(u.email));

  return {
    sponsors: sponsorInfo.sponsors,
    keepSupplierIds,
    counts: {
      applications: applicationCount,
      vacancies: vacancyCount,
      masters: masterCount,
      partners: partnerCount,
      suppliersTotal: supplierCount,
      suppliersKeep: keepSupplierIds.size,
      suppliersDelete: supplierCount - keepSupplierIds.size,
      articles: articleCount,
      demoUsersDelete: demoUserMatches.length
    },
    demoUsers: demoUserMatches
  };
}

async function execute(report) {
  const result = await prisma.$transaction(async (tx) => {
    const applications = await tx.application.deleteMany({});
    const vacancies = await tx.vacancy.deleteMany({});
    const masters = await tx.master.deleteMany({});
    const partners = await tx.partner.deleteMany({});
    const suppliers = await tx.supplier.deleteMany({
      where:
        report.keepSupplierIds.size > 0
          ? { id: { notIn: Array.from(report.keepSupplierIds) } }
          : {}
    });
    const demoUsers = await tx.user.deleteMany({
      where: { id: { in: report.demoUsers.map((u) => u.id) } }
    });

    return { applications, vacancies, masters, partners, suppliers, demoUsers };
  });

  return result;
}

function printReport(report, hostname) {
  console.log(`[clean-test-data] DB host: ${hostname}`);
  console.log('');
  console.log('Preserved (not touched):');
  console.log(`  Articles:         ${report.counts.articles}`);
  console.log(`  GeneralSponsors:  ${report.sponsors.length}`);
  console.log(`  Suppliers (kept): ${report.counts.suppliersKeep}`);
  console.log('');
  console.log('To delete:');
  console.log(`  Applications:     ${report.counts.applications} (cascades notifications + messages)`);
  console.log(`  Vacancies:        ${report.counts.vacancies}`);
  console.log(`  Masters:          ${report.counts.masters}`);
  console.log(`  Partners:         ${report.counts.partners}`);
  console.log(`  Suppliers:        ${report.counts.suppliersDelete} of ${report.counts.suppliersTotal}`);
  console.log(`  Demo users:       ${report.counts.demoUsersDelete} (cascades BusinessAccount/Sessions/Profile)`);
  if (report.demoUsers.length > 0) {
    for (const u of report.demoUsers) {
      console.log(`    - ${u.email} [${u.role}]`);
    }
  }
  console.log('');
  if (report.sponsors.length > 0) {
    console.log('GeneralSponsors detected:');
    for (const s of report.sponsors) {
      console.log(`  - ${s.name} (slug=${s.slug})`);
    }
    console.log('');
  }
}

async function main() {
  const { confirm, forceRemote } = parseFlags(process.argv.slice(2));
  const hostname = ensureLocalDb(process.env.DATABASE_URL, forceRemote);

  const report = await buildReport();
  printReport(report, hostname);

  if (!confirm) {
    console.log('[clean-test-data] DRY RUN — pass --confirm to execute deletes.');
    return;
  }

  console.log('[clean-test-data] Executing deletes...');
  const result = await execute(report);
  console.log('[clean-test-data] Done. Deleted counts:');
  console.log(`  Applications: ${result.applications.count}`);
  console.log(`  Vacancies:    ${result.vacancies.count}`);
  console.log(`  Masters:      ${result.masters.count}`);
  console.log(`  Partners:     ${result.partners.count}`);
  console.log(`  Suppliers:    ${result.suppliers.count}`);
  console.log(`  Demo users:   ${result.demoUsers.count}`);
}

main()
  .catch((err) => {
    console.error('[clean-test-data] Failed.');
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
