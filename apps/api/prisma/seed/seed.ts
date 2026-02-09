import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash default dev password
  const defaultPasswordHash = await bcrypt.hash('password123', 12);

  // 1. Create Organization
  console.log('Creating organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Property Management',
      slug: 'acme-property-management',
      settings: {},
      subscriptionTier: 'professional',
      subscriptionStatus: 'active',
      maxBuildings: 100,
      maxUsers: 25,
    },
  });
  console.log(`✅ Created organization: ${org.name} (${org.id})`);

  // 2. Create Users
  console.log('Creating users...');
  const adminUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'admin@acme.com',
      firstName: 'John',
      lastName: 'Admin',
      role: 'org_admin',
      passwordHash: defaultPasswordHash,
      isActive: true,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'manager@acme.com',
      firstName: 'Sarah',
      lastName: 'Manager',
      role: 'branch_manager',
      passwordHash: defaultPasswordHash,
      isActive: true,
    },
  });

  const assessorUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'assessor@acme.com',
      firstName: 'Mike',
      lastName: 'Assessor',
      role: 'assessor',
      passwordHash: defaultPasswordHash,
      isActive: true,
    },
  });

  console.log(`✅ Created users: ${adminUser.email}, ${managerUser.email}, ${assessorUser.email}`);

  // 3. Create Branches
  console.log('Creating branches...');
  const westCoastBranch = await prisma.branch.create({
    data: {
      organizationId: org.id,
      name: 'West Coast Portfolio',
      code: 'WC',
      addressLine1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'USA',
    },
  });

  const eastCoastBranch = await prisma.branch.create({
    data: {
      organizationId: org.id,
      name: 'East Coast Portfolio',
      code: 'EC',
      addressLine1: '456 Park Ave',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    },
  });

  console.log(`✅ Created branches: ${westCoastBranch.name}, ${eastCoastBranch.name}`);

  // 4. Assign users to branches
  await prisma.userBranch.createMany({
    data: [
      { userId: managerUser.id, branchId: westCoastBranch.id },
      { userId: managerUser.id, branchId: eastCoastBranch.id },
      { userId: assessorUser.id, branchId: westCoastBranch.id },
    ],
  });
  console.log('✅ Assigned users to branches');

  // 5. Create Buildings
  console.log('Creating buildings...');
  const building1 = await prisma.building.create({
    data: {
      organizationId: org.id,
      branchId: westCoastBranch.id,
      name: 'Financial District Tower',
      code: 'FDT-01',
      addressLine1: '555 Market St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'USA',
      yearBuilt: 1985,
      grossSquareFeet: 150000,
      currentReplacementValue: 75000000,
      buildingType: 'Office',
      numFloors: 25,
      description: 'Class A office building in the Financial District',
    },
  });

  const building2 = await prisma.building.create({
    data: {
      organizationId: org.id,
      branchId: westCoastBranch.id,
      name: 'Silicon Valley Campus',
      code: 'SVC-01',
      addressLine1: '1000 Innovation Way',
      city: 'Palo Alto',
      state: 'CA',
      postalCode: '94301',
      country: 'USA',
      yearBuilt: 2010,
      grossSquareFeet: 200000,
      currentReplacementValue: 120000000,
      buildingType: 'Campus',
      numFloors: 4,
      description: 'Modern tech campus with multiple buildings',
    },
  });

  const building3 = await prisma.building.create({
    data: {
      organizationId: org.id,
      branchId: eastCoastBranch.id,
      name: 'Manhattan Plaza',
      code: 'MP-01',
      addressLine1: '789 Broadway',
      city: 'New York',
      state: 'NY',
      postalCode: '10003',
      country: 'USA',
      yearBuilt: 1978,
      grossSquareFeet: 180000,
      currentReplacementValue: 95000000,
      buildingType: 'Mixed Use',
      numFloors: 30,
      description: 'Mixed-use tower with retail and office space',
    },
  });

  console.log(`✅ Created buildings: ${building1.name}, ${building2.name}, ${building3.name}`);

  // 6. Create Uniformat Elements (sample - real system would have 100+)
  console.log('Creating Uniformat elements...');
  const uniformatElements = await prisma.uniformatElement.createMany({
    data: [
      {
        code: 'A10',
        name: 'Foundations',
        systemGroup: 'Substructure',
        level: 1,
        defaultLifetimeYears: 100,
        isActive: true,
        sortOrder: 1,
      },
      {
        code: 'B10',
        name: 'Superstructure',
        systemGroup: 'Shell',
        level: 1,
        defaultLifetimeYears: 75,
        isActive: true,
        sortOrder: 2,
      },
      {
        code: 'B20',
        name: 'Exterior Enclosure',
        systemGroup: 'Shell',
        level: 1,
        defaultLifetimeYears: 50,
        isActive: true,
        sortOrder: 3,
      },
      {
        code: 'B2010',
        name: 'Exterior Walls',
        systemGroup: 'Shell',
        level: 2,
        parentCode: 'B20',
        defaultLifetimeYears: 50,
        defaultUnitOfMeasure: 'SF',
        isActive: true,
        sortOrder: 4,
      },
      {
        code: 'B3010',
        name: 'Roof Coverings',
        systemGroup: 'Shell',
        level: 2,
        defaultLifetimeYears: 25,
        defaultUnitOfMeasure: 'SF',
        isActive: true,
        sortOrder: 5,
      },
      {
        code: 'C10',
        name: 'Interior Construction',
        systemGroup: 'Interiors',
        level: 1,
        defaultLifetimeYears: 30,
        isActive: true,
        sortOrder: 6,
      },
      {
        code: 'D20',
        name: 'Plumbing',
        systemGroup: 'Services',
        level: 1,
        defaultLifetimeYears: 40,
        isActive: true,
        sortOrder: 7,
      },
      {
        code: 'D30',
        name: 'HVAC',
        systemGroup: 'Services',
        level: 1,
        defaultLifetimeYears: 25,
        isActive: true,
        sortOrder: 8,
      },
      {
        code: 'D40',
        name: 'Fire Protection',
        systemGroup: 'Services',
        level: 1,
        defaultLifetimeYears: 50,
        isActive: true,
        sortOrder: 9,
      },
      {
        code: 'D50',
        name: 'Electrical',
        systemGroup: 'Services',
        level: 1,
        defaultLifetimeYears: 40,
        isActive: true,
        sortOrder: 10,
      },
    ],
  });
  console.log(`✅ Created ${uniformatElements.count} Uniformat elements`);

  // 7. Create Assessments
  console.log('Creating assessments...');
  const assessment1 = await prisma.assessment.create({
    data: {
      organizationId: org.id,
      branchId: westCoastBranch.id,
      buildingId: building1.id,
      name: 'Annual Assessment 2026',
      description: 'Comprehensive annual building condition assessment',
      status: 'in_progress',
      targetCompletionDate: new Date('2026-03-31'),
      createdById: managerUser.id,
      startedAt: new Date(),
    },
  });

  const assessment2 = await prisma.assessment.create({
    data: {
      organizationId: org.id,
      branchId: westCoastBranch.id,
      buildingId: building2.id,
      name: 'Q1 2026 Assessment',
      description: 'Quarterly inspection for Silicon Valley Campus',
      status: 'draft',
      createdById: adminUser.id,
    },
  });

  console.log(`✅ Created assessments: ${assessment1.name}, ${assessment2.name}`);

  // 8. Assign assessors
  await prisma.assessmentAssignee.create({
    data: {
      assessmentId: assessment1.id,
      userId: assessorUser.id,
      assignedById: managerUser.id,
    },
  });
  console.log('✅ Assigned assessors to assessments');

  // 9. Add assessment elements to assessment 1
  console.log('Adding elements to assessment...');
  const uniformatList = await prisma.uniformatElement.findMany({
    where: { isActive: true },
    take: 5,
  });

  for (const uniformat of uniformatList) {
    await prisma.assessmentElement.create({
      data: {
        assessmentId: assessment1.id,
        uniformatElementId: uniformat.id,
        uniformatCode: uniformat.code,
        systemGroup: uniformat.systemGroup,
        lifetimeYears: uniformat.defaultLifetimeYears,
        unitOfMeasure: uniformat.defaultUnitOfMeasure,
        status: 'pending',
      },
    });
  }

  // Update assessment element count
  await prisma.assessment.update({
    where: { id: assessment1.id },
    data: { totalElements: uniformatList.length },
  });

  console.log(`✅ Added ${uniformatList.length} elements to assessment`);

  // 10. Create Deficiency Categories
  console.log('Creating deficiency categories...');
  await prisma.deficiencyCategory.createMany({
    data: [
      { code: 'STRUCT', name: 'Structural', color: '#FF0000', sortOrder: 1 },
      { code: 'LEAK', name: 'Leaks/Water Damage', color: '#0000FF', sortOrder: 2 },
      { code: 'MECH', name: 'Mechanical', color: '#FFA500', sortOrder: 3 },
      { code: 'ELEC', name: 'Electrical', color: '#FFFF00', sortOrder: 4 },
      { code: 'SAFE', name: 'Safety/Code', color: '#FF6600', sortOrder: 5 },
      { code: 'COSM', name: 'Cosmetic', color: '#00FF00', sortOrder: 6 },
    ],
  });
  console.log('✅ Created deficiency categories');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Organization: ${org.name}`);
  console.log(`   - Users: 3 (admin, manager, assessor)`);
  console.log(`   - Branches: 2`);
  console.log(`   - Buildings: 3`);
  console.log(`   - Assessments: 2`);
  console.log(`   - Uniformat Elements: ${uniformatElements.count}`);
  console.log(`   - Assessment Elements: ${uniformatList.length}`);
  console.log(`   - Deficiency Categories: 6`);
  console.log('\n🔑 Test Users (password: password123):');
  console.log(`   - Admin: admin@acme.com (${adminUser.id})`);
  console.log(`   - Manager: manager@acme.com (${managerUser.id})`);
  console.log(`   - Assessor: assessor@acme.com (${assessorUser.id})`);
  console.log('\n🏢 Buildings:');
  console.log(`   - ${building1.name} (${building1.id})`);
  console.log(`   - ${building2.name} (${building2.id})`);
  console.log(`   - ${building3.name} (${building3.id})`);
  console.log('\n📋 Assessments:');
  console.log(`   - ${assessment1.name} - Status: ${assessment1.status} (${assessment1.id})`);
  console.log(`   - ${assessment2.name} - Status: ${assessment2.status} (${assessment2.id})`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
