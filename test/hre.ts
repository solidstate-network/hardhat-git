import pkg from '../package.json';
import { createHardhatRuntimeEnvironmentAtGitRev } from '../src/index.js';
import envPaths from 'env-paths';
import hre from 'hardhat';
import { task } from 'hardhat/config';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, beforeEach, afterEach } from 'node:test';
import { simpleGit } from 'simple-git';

const revs = {
  // pnpm was the package manager in use at this rev
  pnpm: 'a307fffeeb69102331a671965236f6b87733f2fa',
  // yarn was the package manager in use at this rev
  // it is used for package manager inferrence test
  yarnInferred: '78a30554cd600c1aef47d2f566167e8fe5e3fbe7',
  // pnpm was the package manager in use at the following revs
  // they are used for npm, yarn, and bun tests
  npm: '77bdf11772ef59035b3a083b78d86203ebaa471d',
  bun: '2fb7bea7ae4250335f415ae076b0325edd4dd846',
  yarn: 'c336c3902b13566dd3df871ab1d4af9bed3f417b',
};

const resolveDirectory = (rev: string) =>
  path.resolve(envPaths(pkg.name).temp, rev);

describe('createHardhatRuntimeEnvironmentAtGitRev', () => {
  beforeEach(async () => {
    for (const rev of Object.values(revs)) {
      assert(!fs.existsSync(resolveDirectory(rev)));
    }
  });

  afterEach(async () => {
    for (const rev of Object.values(revs)) {
      await fs.promises.rm(resolveDirectory(rev), {
        recursive: true,
        force: true,
      });
    }
  });

  it('creates temporary directory', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRev(
      hre.config,
      revs.pnpm,
    );

    assert.equal(resolveDirectory(revs.pnpm), gitHre.config.paths.root);
    assert(fs.existsSync(gitHre.config.paths.root));
  });

  it('clones repository and checks out git rev', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRev(
      hre.config,
      revs.pnpm,
    );

    const git = simpleGit(gitHre.config.paths.root);

    assert(await git.checkIsRepo());
    assert.equal(await git.revparse('HEAD'), revs.pnpm);
  });

  it('installs dependencies', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRev(
      hre.config,
      revs.pnpm,
    );

    const nodeModulesDirectory = path.resolve(
      gitHre.config.paths.root,
      'node_modules',
    );

    const packageLockPath = path.resolve(
      gitHre.config.paths.root,
      'package-lock.json',
    );

    const pnpmLockPath = path.resolve(
      gitHre.config.paths.root,
      'pnpm-lock.yaml',
    );

    assert(fs.existsSync(nodeModulesDirectory));
    // package-lock.json not present because pnpm is the inferred package manager
    assert(!fs.existsSync(packageLockPath));
    // pnpm-lock.yaml present because pnpm is the inferred package manager
    assert(fs.existsSync(pnpmLockPath));
  });

  it('installs dependencies using package manager present at git rev', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRev(
      hre.config,
      revs.yarnInferred,
    );

    const nodeModulesDirectory = path.resolve(
      gitHre.config.paths.root,
      'node_modules',
    );

    const packageLockPath = path.resolve(
      gitHre.config.paths.root,
      'package-lock.json',
    );

    const pnpmLockPath = path.resolve(
      gitHre.config.paths.root,
      'pnpm-lock.yaml',
    );

    const yarnLockPath = path.resolve(gitHre.config.paths.root, 'yarn.lock');

    assert(fs.existsSync(nodeModulesDirectory));
    // package-lock.json not present because yarn is the inferred package manager
    assert(!fs.existsSync(packageLockPath));
    // pnpm-lock.yaml not present because yarn is the inferred package manager
    assert(!fs.existsSync(pnpmLockPath));
    // yarn.lock present because yarn is the inferred package manager
    assert(fs.existsSync(yarnLockPath));
  });

  it('installs dependencies using arbitrary command: npm install', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRev(
      { ...hre.config, git: { npmInstall: 'npm install' } },
      revs.npm,
    );

    const packageLockPath = path.resolve(
      gitHre.config.paths.root,
      'package-lock.json',
    );

    const pnpmLockPath = path.resolve(
      gitHre.config.paths.root,
      'pnpm-lock.yaml',
    );

    // package-lock.json only present because of custom command
    assert(fs.existsSync(packageLockPath));
    // pnpm-lock.yaml present because of git tracking
    assert(fs.existsSync(pnpmLockPath));
  });

  it('installs dependencies using arbitrary command: bun install', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRev(
      { ...hre.config, git: { npmInstall: 'bun install' } },
      revs.bun,
    );

    const bunLockPath = path.resolve(gitHre.config.paths.root, 'bun.lock');

    const pnpmLockPath = path.resolve(
      gitHre.config.paths.root,
      'pnpm-lock.yaml',
    );

    // bun.lock only present because of custom command
    assert(fs.existsSync(bunLockPath));
    // pnpm-lock.yaml present because of git tracking
    assert(fs.existsSync(pnpmLockPath));
  });

  it('installs dependencies using arbitrary command: yarn install', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRev(
      { ...hre.config, git: { npmInstall: 'yarn install' } },
      revs.yarn,
    );

    const yarnLockPath = path.resolve(gitHre.config.paths.root, 'yarn.lock');

    const pnpmLockPath = path.resolve(
      gitHre.config.paths.root,
      'pnpm-lock.yaml',
    );

    // yarn.lock only present because of custom command
    assert(fs.existsSync(yarnLockPath));
    // pnpm-lock.yaml present because of git tracking
    assert(fs.existsSync(pnpmLockPath));
  });

  it('registers plugins', async () => {
    const taskName = 'temp';

    const plugin = {
      id: 'temp',
      tasks: [
        task(taskName)
          .setAction(async () => {
            return taskName;
          })
          .build(),
      ],
    };

    const gitHre = await createHardhatRuntimeEnvironmentAtGitRev(
      hre.config,
      revs.pnpm,
      [plugin],
    );

    assert.equal(await gitHre.tasks.getTask(taskName).run(), taskName);
  });

  it('throws if dependency reinstallation with different package manager is attempted', async () => {
    await assert.rejects(
      createHardhatRuntimeEnvironmentAtGitRev(
        { ...hre.config, git: { npmInstall: 'yarn install' } },
        revs.pnpm,
      ),
    );
  });
});
