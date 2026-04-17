/**
 * Votiix Election Seed Script
 * 
 * This script creates a complete election setup for testing, including:
 * - Political parties
 * - An election with contests
 * - Candidates for each contest
 * - Polling stations
 * - Sample voter registrations
 * 
 * Usage:
 *   npx ts-node seed-election.ts
 * 
 * Environment:
 *   DATABASE_URL   : PostgreSQL connection string
 * 
 * @author Votiix Team
 */

import { PrismaClient } from '@votiix/db';
import * as crypto from 'crypto';

// Generate RSA keypair for blind signatures
function generateRSAKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

async function main() {
  console.log('='.repeat(60));
  console.log('🗳️  Votiix Election Seed Script');
  console.log('='.repeat(60));
  console.log('');

  const prisma = new PrismaClient();

  try {
    // Step 1: Create Parties
    console.log('📋 Creating political parties...');

    const parties = await Promise.all([
      prisma.party.upsert({
        where: { id: '11111111-1111-1111-1111-111111111111' },
        update: {},
        create: {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Freedom & Progress Party',
          shortCode: 'FPP',
          logoUrl: null,
        },
      }),
      prisma.party.upsert({
        where: { id: '22222222-2222-2222-2222-222222222222' },
        update: {},
        create: {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'National Unity Coalition',
          shortCode: 'NUC',
          logoUrl: null,
        },
      }),
      prisma.party.upsert({
        where: { id: '33333333-3333-3333-3333-333333333333' },
        update: {},
        create: {
          id: '33333333-3333-3333-3333-333333333333',
          name: 'Democratic Alliance',
          shortCode: 'DA',
          logoUrl: null,
        },
      }),
    ]);

    console.log(`   ✅ Created ${parties.length} parties`);

    // Step 2: Create Election with RSA keys
    console.log('🗓️  Creating election...');

    const { publicKey, privateKey } = generateRSAKeyPair();

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days from now

    const election = await prisma.election.upsert({
      where: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
      update: {},
      create: {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        title: 'Presidential Election 2024',
        startDate: startDate,
        endDate: endDate,
        status: 'Draft',
        rsaPublicKey: publicKey,
        rsaPrivateKey: privateKey,
      },
    });

    console.log(`   ✅ Created election: ${election.title}`);
    console.log(`   📅 Start: ${startDate.toISOString()}`);
    console.log(`   📅 End: ${endDate.toISOString()}`);

    // Step 3: Create Contests
    console.log('📋 Creating contests...');

    const presidentContest = await prisma.contest.upsert({
      where: { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' },
      update: {},
      create: {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        electionId: election.id,
        officeTitle: 'President',
        seatsAvailable: 1,
      },
    });

    const senateContest = await prisma.contest.upsert({
      where: { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc' },
      update: {},
      create: {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        electionId: election.id,
        officeTitle: 'Senate Representative',
        seatsAvailable: 3,
      },
    });

    console.log(`   ✅ Created ${presidentContest.officeTitle}`);
    console.log(`   ✅ Created ${senateContest.officeTitle}`);

    // Step 4: Create Candidates
    console.log('👥 Creating candidates...');

    // Presidential Candidates
    const presidentialCandidates = [
      { name: 'Ahmed Hassan', partyId: parties[0].id, listPosition: 1 },
      { name: 'Sarah El-Maghraby', partyId: parties[1].id, listPosition: 2 },
      { name: 'Omar Farouk', partyId: parties[2].id, listPosition: 3 },
      { name: 'Layla Independent', partyId: null, listPosition: 4 },
    ];

    for (const candidate of presidentialCandidates) {
      await prisma.candidate.upsert({
        where: {
          id: `d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}-d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}-d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}-d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}-d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}`,
        },
        update: {},
        create: {
          id: `d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}-d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}-d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}-d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}-d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}d${candidate.listPosition}`,
          contestId: presidentContest.id,
          name: candidate.name,
          partyId: candidate.partyId,
          listPosition: candidate.listPosition,
          photoUrl: null,
        },
      });
      console.log(`   ✅ ${candidate.name} (President)`);
    }

    // Senate Candidates
    const senateCandidates = [
      { name: 'Mahmoud Samir', partyId: parties[0].id, listPosition: 1 },
      { name: 'Fatma Khalil', partyId: parties[0].id, listPosition: 2 },
      { name: 'Hassan Ibrahim', partyId: parties[1].id, listPosition: 3 },
      { name: 'Nadia Youssef', partyId: parties[1].id, listPosition: 4 },
      { name: 'Karim Adel', partyId: parties[2].id, listPosition: 5 },
      { name: 'Rania Mostafa', partyId: null, listPosition: 6 },
    ];

    for (const candidate of senateCandidates) {
      await prisma.candidate.upsert({
        where: {
          id: `e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}-e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}-e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}-e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}-e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}`,
        },
        update: {},
        create: {
          id: `e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}-e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}-e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}-e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}-e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}e${candidate.listPosition}`,
          contestId: senateContest.id,
          name: candidate.name,
          partyId: candidate.partyId,
          listPosition: candidate.listPosition,
          photoUrl: null,
        },
      });
      console.log(`   ✅ ${candidate.name} (Senate)`);
    }

    // Step 5: Create Polling Stations
    console.log('🏛️  Creating polling stations...');

    const stations = [
      { name: 'Cairo Central Station', address: '15 Tahrir Square, Downtown Cairo', capacity: 10 },
      { name: 'Giza University Station', address: 'Cairo University Campus, Giza', capacity: 8 },
      { name: 'Alexandria Port Station', address: '25 Corniche Road, Alexandria', capacity: 6 },
    ];

    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      await prisma.pollingStation.upsert({
        where: { id: `f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}-f${i + 1}f${i + 1}f${i + 1}f${i + 1}-f${i + 1}f${i + 1}f${i + 1}f${i + 1}-f${i + 1}f${i + 1}f${i + 1}f${i + 1}-f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}` },
        update: {},
        create: {
          id: `f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}-f${i + 1}f${i + 1}f${i + 1}f${i + 1}-f${i + 1}f${i + 1}f${i + 1}f${i + 1}-f${i + 1}f${i + 1}f${i + 1}f${i + 1}-f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}f${i + 1}`,
          name: station.name,
          address: station.address,
          terminalCapacity: station.capacity,
        },
      });
      console.log(`   ✅ ${station.name}`);
    }

    // Step 6: Create Sample Voter Registrations
    console.log('👥 Creating sample voter registrations...');

    const sampleVoters = [
      { mosipUin: 'UIN-DEMO-001', fingerprintId: 1 },
      { mosipUin: 'UIN-DEMO-002', fingerprintId: 2 },
      { mosipUin: 'UIN-DEMO-003', fingerprintId: 3 },
      { mosipUin: 'UIN-DEMO-004', fingerprintId: 4 },
      { mosipUin: 'UIN-DEMO-005', fingerprintId: 5 },
    ];

    for (const voter of sampleVoters) {
      try {
        await prisma.voterRegistry.upsert({
          where: {
            electionId_mosipUin: {
              electionId: election.id,
              mosipUin: voter.mosipUin,
            },
          },
          update: {},
          create: {
            electionId: election.id,
            mosipUin: voter.mosipUin,
            fingerprintId: voter.fingerprintId,
            hasVoted: false,
          },
        });
        console.log(`   ✅ ${voter.mosipUin} (Finger ID: ${voter.fingerprintId})`);
      } catch (e) {
        // Voter already exists
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Seed complete!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 Summary:');
    console.log(`   Election ID: ${election.id}`);
    console.log(`   Parties: ${parties.length}`);
    console.log(`   Contests: 2`);
    console.log(`   Presidential Candidates: ${presidentialCandidates.length}`);
    console.log(`   Senate Candidates: ${senateCandidates.length}`);
    console.log(`   Polling Stations: ${stations.length}`);
    console.log(`   Registered Voters: ${sampleVoters.length}`);
    console.log('');
    console.log('📌 Next steps:');
    console.log('   1. Transition election to Active:');
    console.log(`      POST /api/v1/admin/elections/${election.id}/transition`);
    console.log('      Body: {"target_status": "Active"}');
    console.log('');
    console.log('   2. Generate fake votes for live dashboard testing:');
    console.log(`      npx ts-node faker-votes.ts --election-id ${election.id} --voters 50 --delay 500`);
    console.log('');
    console.log('   3. View live results:');
    console.log(`      GET /api/v1/public/elections/${election.id}/results`);
    console.log('');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
