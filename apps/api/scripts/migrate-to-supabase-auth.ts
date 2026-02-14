/**
 * One-time migration script: Create Supabase Auth users for existing database users.
 *
 * Run with: npx tsx apps/api/scripts/migrate-to-supabase-auth.ts
 *
 * This script:
 * 1. Finds all users without a supabaseAuthId
 * 2. Creates a Supabase Auth user for each
 * 3. Links the Supabase auth UUID to the internal user record
 * 4. Generates a password recovery link for each user
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';

async function migrateUsers() {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      supabaseAuthId: null,
    },
  });

  console.log(`Found ${users.length} users to migrate\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      // Create Supabase Auth user
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        email_confirm: true,
        app_metadata: {
          organizationId: user.organizationId,
          role: user.role,
        },
        user_metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });

      let supabaseId: string;

      if (error) {
        // If user already exists in Supabase auth, try to link them
        if (error.message.includes('already been registered') || error.message.includes('already exists')) {
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const existing = listData.users.find(u => u.email === user.email);
          if (existing) {
            supabaseId = existing.id;
            // Update their app_metadata
            await supabaseAdmin.auth.admin.updateUserById(existing.id, {
              app_metadata: {
                organizationId: user.organizationId,
                role: user.role,
              },
            });
            console.log(`  Linked existing Supabase user for ${user.email}`);
          } else {
            console.error(`  SKIP: ${user.email} — exists in Supabase but could not find`);
            skipCount++;
            continue;
          }
        } else {
          console.error(`  ERROR: ${user.email} — ${error.message}`);
          errorCount++;
          continue;
        }
      } else {
        supabaseId = data.user.id;
      }

      // Link Supabase auth ID to internal user
      await prisma.user.update({
        where: { id: user.id },
        data: { supabaseAuthId: supabaseId },
      });

      // Generate a password recovery link
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: user.email,
        options: {
          redirectTo: `${WEB_URL}/auth/callback`,
        },
      });

      if (linkData?.properties?.action_link) {
        console.log(`  OK: ${user.email} -> ${supabaseId}`);
        console.log(`      Recovery link: ${linkData.properties.action_link}`);
      } else {
        console.log(`  OK: ${user.email} -> ${supabaseId} (no recovery link generated)`);
      }

      successCount++;
    } catch (err) {
      console.error(`  ERROR: ${user.email} —`, err);
      errorCount++;
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Skipped: ${skipCount}`);
  console.log(`  Errors:  ${errorCount}`);

  await prisma.$disconnect();
}

migrateUsers().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
