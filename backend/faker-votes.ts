/**
 * Votiix Fake Vote Generator
 * 
 * This script generates fake voting data directly into the database for testing
 * the live dashboard updates. It bypasses the normal voting flow (authentication,
 * blind tokens) and inserts votes directly.
 * 
 * Usage:
 *   npx ts-node faker-votes.ts --election-id <UUID> --voters 100 --delay 1000 --seed 12345
 * 
 * Arguments:
 *   --election-id  : UUID of the election to generate votes for (required)
 *   --voters       : Number of voters to simulate (default: 50)
 *   --delay        : Delay in milliseconds between votes (default: 500)
 *   --seed         : Random seed for reproducible results (default: random)
 *   --help         : Show help message
 * 
 * Environment:
 *   DATABASE_URL   : PostgreSQL connection string
 * 
 * @author Votiix Team
 */

import { PrismaClient, Prisma } from '@votiix/db';
import * as crypto from 'crypto';

// Parse command line arguments
function parseArgs(): {
  electionId: string;
  voterCount: number;
  delayMs: number;
  seed: number;
} {
  const args = process.argv.slice(2);
  let electionId = '';
  let voterCount = 50;
  let delayMs = 500;
  let seed = Math.floor(Math.random() * 1000000);

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--election-id':
        electionId = args[++i];
        break;
      case '--voters':
        voterCount = parseInt(args[++i], 10);
        break;
      case '--delay':
        delayMs = parseInt(args[++i], 10);
        break;
      case '--seed':
        seed = parseInt(args[++i], 10);
        break;
      case '--help':
        console.log(`
Votiix Fake Vote Generator

Usage:
  npx ts-node faker-votes.ts --election-id <UUID> [options]

Options:
  --election-id  UUID of the election (required)
  --voters       Number of voters to simulate (default: 50)
  --delay        Delay in ms between votes (default: 500)
  --seed         Random seed for reproducibility (default: random)
  --help         Show this help message

Example:
  npx ts-node faker-votes.ts --election-id abc-123 --voters 100 --delay 1000 --seed 42
`);
        process.exit(0);
    }
  }

  if (!electionId) {
    console.error('Error: --election-id is required');
    process.exit(1);
  }

  return { electionId, voterCount, delayMs, seed };
}

// Seeded random number generator (Mulberry32)
function createSeededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate a fake blind token hash
function generateFakeTokenHash(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate a fake transaction hash
function generateTxHash(token: string, timestamp: Date, contestId: string): string {
  return crypto
    .createHash('sha256')
    .update(token + timestamp.toISOString() + contestId)
    .digest('hex');
}

// Sleep function
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { electionId, voterCount, delayMs, seed } = parseArgs();
  const random = createSeededRandom(seed);

  console.log('='.repeat(60));
  console.log('🗳️  Votiix Fake Vote Generator');
  console.log('='.repeat(60));
  console.log(`Election ID:  ${electionId}`);
  console.log(`Voters:       ${voterCount}`);
  console.log(`Delay:        ${delayMs}ms`);
  console.log(`Seed:         ${seed}`);
  console.log('='.repeat(60));
  console.log('');

  const prisma = new PrismaClient();

  try {
    // Verify election exists and is Active
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: {
        contests: {
          include: {
            candidates: true,
          },
        },
      },
    });

    if (!election) {
      console.error(`❌ Election not found: ${electionId}`);
      process.exit(1);
    }

    if (election.status !== 'Active') {
      console.error(`❌ Election status is "${election.status}". Must be "Active" to generate votes.`);
      console.error('   Use: POST /elections/{id}/transition with {"target_status": "Active"}');
      process.exit(1);
    }

    if (election.contests.length === 0) {
      console.error('❌ No contests found for this election. Create contests first.');
      process.exit(1);
    }

    console.log(`✅ Found election: ${election.title}`);
    console.log(`   Status: ${election.status}`);
    console.log(`   Contests: ${election.contests.length}`);
    console.log('');

    // Display candidates per contest
    for (const contest of election.contests) {
      console.log(`📋 Contest: ${contest.officeTitle}`);
      for (const candidate of contest.candidates) {
        console.log(`   - ${candidate.name}`);
      }
    }
    console.log('');

    // Get a polling station (or create fake one)
    let stationId: string | null = null;
    const stations = await prisma.pollingStation.findMany({ take: 1 });
    if (stations.length > 0) {
      stationId = stations[0].id;
      console.log(`📍 Using polling station: ${stations[0].name}`);
    } else {
      console.log('⚠️  No polling station found. Votes will not have station assigned.');
    }

    console.log('');
    console.log('🚀 Starting vote generation...');
    console.log('');

    let votesGenerated = 0;
    const startTime = Date.now();

    for (let i = 0; i < voterCount; i++) {
      const voterNum = i + 1;

      // Generate votes for each contest
      for (const contest of election.contests) {
        if (contest.candidates.length === 0) continue;

        // Randomly select a candidate (weighted distribution for realistic results)
        const candidateIndex = Math.floor(random() * contest.candidates.length);
        const selectedCandidate = contest.candidates[candidateIndex];

        // Generate fake token and transaction hash
        const blindTokenHash = generateFakeTokenHash();
        const timestamp = new Date();
        const txHash = generateTxHash(blindTokenHash, timestamp, contest.id);

        // Create BlindToken (simulate it being used)
        await prisma.blindToken.create({
          data: {
            hash: blindTokenHash,
            electionId: election.id,
            isUsed: true,
            issuedAt: timestamp,
            usedAt: timestamp,
          },
        });

        // Create VotePackage
        await prisma.votePackage.create({
          data: {
            contestId: contest.id,
            pollingStationId: stationId,
            selections: [selectedCandidate.id] as unknown as Prisma.InputJsonValue,
            blindTokenHash: blindTokenHash,
            txHash: txHash,
            timestamp: timestamp,
          },
        });

        // Update or create TallyResult
        const existingTally = await prisma.tallyResult.findUnique({
          where: { candidateId: selectedCandidate.id },
        });

        if (existingTally) {
          await prisma.tallyResult.update({
            where: { candidateId: selectedCandidate.id },
            data: {
              voteCount: { increment: 1 },
              lastUpdated: timestamp,
            },
          });
        } else {
          await prisma.tallyResult.create({
            data: {
              contestId: contest.id,
              candidateId: selectedCandidate.id,
              voteCount: 1,
              status: 'Provisional',
            },
          });
        }

        votesGenerated++;
      }

      // Progress update
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const progress = ((voterNum / voterCount) * 100).toFixed(0);
      process.stdout.write(
        `\r🗳️  Voter ${voterNum}/${voterCount} (${progress}%) | Votes: ${votesGenerated} | Time: ${elapsed}s`
      );

      // Delay between voters (for live dashboard testing)
      if (delayMs > 0 && voterNum < voterCount) {
        await sleep(delayMs);
      }
    }

    console.log('\n');
    console.log('='.repeat(60));
    console.log('✅ Vote generation complete!');
    console.log('='.repeat(60));
    console.log(`Total votes generated: ${votesGenerated}`);
    console.log(`Total time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    console.log('');

    // Display final results
    console.log('📊 Final Results:');
    console.log('');

    for (const contest of election.contests) {
      console.log(`📋 ${contest.officeTitle}:`);

      const results = await prisma.tallyResult.findMany({
        where: { contestId: contest.id },
        include: { candidate: true },
        orderBy: { voteCount: 'desc' },
      });

      for (const result of results) {
        const bar = '█'.repeat(Math.min(result.voteCount, 30));
        console.log(`   ${result.candidate.name.padEnd(20)} ${result.voteCount.toString().padStart(5)} votes ${bar}`);
      }
      console.log('');
    }

    console.log('💡 Tip: Open the Live Dashboard to see the results!');
    console.log('   GET /api/v1/public/elections/{id}/results');
    console.log('');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
