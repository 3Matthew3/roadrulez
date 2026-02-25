// Helper to run seed.ts via ts-node with correct CommonJS module setting
// Run with: node prisma/run-seed.js
const { execSync } = require('child_process')
execSync(
    'npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
    { stdio: 'inherit', shell: 'cmd.exe' }
)
