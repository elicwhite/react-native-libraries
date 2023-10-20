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
  const directoryData  = await result.json();

  const packages = directoryData.libraries.filter(lib => lib.npm.weekDownloads > 100000);

  const repoFullNames = packages.map(pkg => pkg.github.fullName);
  const uniqueRepoFullNames = new Set(repoFullNames);

  for (const repoName of uniqueRepoFullNames) {
    if (!fs.existsSync(path.join('libraries', repoName))) {
      console.log('Adding git submodule for', repoName);
      await execFile('git', ['submodule', 'add', '--depth', '1', `https://github.com/${repoName}.git`, repoName], {
        cwd: 'libraries'
      });
    }
  }

  console.log(`Update all ${uniqueRepoFullNames.size} git submodules`);
  await execFile('git', ['submodule', 'update', '--depth', '1', "--recursive", '--remote'], {
    cwd: 'libraries'
  });
  console.log('Done!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});