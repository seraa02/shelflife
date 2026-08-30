import { execSync } from 'child_process';
import path from 'path';

export default function setup() {
  const backendDir = path.resolve(__dirname, '../../');
  execSync('npx prisma db push --force-reset --skip-generate', {
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    cwd: backendDir,
    stdio: 'pipe',
  });
}
