import util from 'node:util';
import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const execFile = util.promisify(childProcess.execFile);

async function run() {
  const url = new URL('https://reactnative.directory/api/libraries');
  url.search = new URLSearchParams({
    limit: 9999,
    isPopular: true,
  });

  const result = await fetch(url);
  if (!result.ok) {
    console.error(`API request failed with status ${result.status}`);
    return;
  }

  const directoryData = await result.json();

  if (!directoryData.libraries || directoryData.libraries.length === 0) {
    console.error('API returned no libraries, aborting');
    return;
  }

  const packages = directoryData.libraries.filter(lib => lib.npm.weekDownloads > 10000);

  if (packages.length === 0) {
    console.error('No libraries matched the filter criteria, aborting');
    return;
  }

  const repoFullNames = packages.map(pkg => pkg.github.fullName);
  const uniqueRepoFullNames = new Set(repoFullNames);

  console.log(`Found ${uniqueRepoFullNames.size} libraries from the directory`);

  // Add new submodules
  for (const repoName of uniqueRepoFullNames) {
    if (!fs.existsSync(path.join('libraries', repoName))) {
      console.log('Adding git submodule for', repoName);
      await execFile('git', ['submodule', 'add', '--depth', '1', `https://github.com/${repoName}.git`, repoName], {
        cwd: 'libraries'
      });
    }
  }

  // Remove submodules that are no longer in the directory
  const { stdout } = await execFile('git', ['submodule', 'status']);
  const existingSubmodules = stdout.trim().split('\n')
    .map(line => line.trim().split(/\s+/)[1]) // path is the second field
    .filter(Boolean);

  for (const submodulePath of existingSubmodules) {
    // submodulePath is like "libraries/org/repo"
    const repoName = submodulePath.replace(/^libraries\//, '');
    if (!uniqueRepoFullNames.has(repoName)) {
      console.log('Removing submodule', repoName);
      await execFile('git', ['submodule', 'deinit', '-f', submodulePath]);
      await execFile('git', ['rm', '-f', submodulePath]);
      const gitModulesDir = path.join('.git', 'modules', submodulePath);
      if (fs.existsSync(gitModulesDir)) {
        fs.rmSync(gitModulesDir, { recursive: true });
      }
    }
  }

  await execFile('git', ['submodule', 'sync', '--recursive'], {
    cwd: 'libraries'
  });

  console.log(`Updating all ${uniqueRepoFullNames.size} git submodules...`);
  const update = childProcess.spawn('git', ['submodule', 'update', '--depth', '1', '--init', '--force', '--remote'], {
    cwd: 'libraries',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  update.stdout.pipe(process.stdout);
  update.stderr.pipe(process.stderr);
  await new Promise((resolve, reject) => {
    update.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`git submodule update exited with code ${code}`));
    });
    update.on('error', reject);
  });
  console.log('Done!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
