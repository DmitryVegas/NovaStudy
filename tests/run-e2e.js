import { runTier1Tests } from './tier1_feature_coverage.test.js';
import { runTier2Tests } from './tier2_boundary_corner.test.js';
import { runTier3Tests } from './tier3_cross_feature.test.js';
import { runTier4Tests } from './tier4_real_world.test.js';

async function runAllSuites() {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('🧪 NovaStudy DB Sync & Persistence E2E Test Suite');
  console.log('   Opaque-Box Testing Protocol (Node.js Test Runner)');
  console.log('====================================================');

  const args = process.argv.slice(2);
  const tierArg = args.find(a => a.startsWith('--tier='));
  const targetTier = tierArg ? parseInt(tierArg.split('=')[1], 10) : null;

  let totalPassed = 0;
  let totalFailed = 0;

  const suites = [
    { tier: 1, name: 'Tier 1: Feature Coverage', fn: runTier1Tests },
    { tier: 2, name: 'Tier 2: Boundary & Corner Cases', fn: runTier2Tests },
    { tier: 3, name: 'Tier 3: Cross-Feature Combinations', fn: runTier3Tests },
    { tier: 4, name: 'Tier 4: Real-World Scenarios', fn: runTier4Tests }
  ];

  for (const suite of suites) {
    if (targetTier && suite.tier !== targetTier) {
      continue;
    }

    try {
      const result = await suite.fn();
      totalPassed += result.passed;
      totalFailed += result.failed;
    } catch (err) {
      console.error(`\n❌ Critical error executing ${suite.name}:`, err);
      totalFailed++;
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n====================================================');
  console.log('📊 E2E TEST SUMMARY RESULTS');
  console.log('====================================================');
  console.log(`  Total Tests Run : ${totalPassed + totalFailed}`);
  console.log(`  Passed          : ${totalPassed} ✅`);
  console.log(`  Failed          : ${totalFailed} ${totalFailed > 0 ? '❌' : ''}`);
  console.log(`  Execution Time  : ${durationSec}s`);
  console.log('====================================================');

  if (totalFailed > 0) {
    console.error('❌ E2E TEST SUITE FAILED!');
    process.exit(1);
  } else {
    console.log('✅ ALL E2E TEST SUITES PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runAllSuites().catch(err => {
  console.error('Unhandled fatal error in test runner:', err);
  process.exit(1);
});
