import pkg from '../package.json' with { type: 'json' };
import { createHardhatRuntimeEnvironmentAtGitRev } from '../src/index.js';
import { exists, remove } from '@nomicfoundation/hardhat-utils/fs';
import envPaths from 'env-paths';
import hre from 'hardhat';
import { task } from 'hardhat/config';
import assert from 'node:assert';
import path from 'node:path';
import { describe, it, beforeEach, afterEach } from 'node:test';
import { simpleGit } from 'simple-git';

const revs = {
  // pnpm was the package manager in use at this rev
  pnpm: '6c493d4b20c98e2e944c152093ce3789b3192ac3',
  // yarn was the package manager in use at this rev
  // it is used for package manager inferrence test
  yarnInferred: 'e2ed7861909d9fa5792608673885e6371479b31f',
  // pnpm was the package manager in use at the following revs
  // they are used for npm, yarn, and bun tests
  npm: 'c80f29d69550e1da289cb335eb97d6453ade1517',
  bun: '92267683b6a96ec81726fa0d92488c7e6d61ad89',
  yarn: '6aaf2ff5647f9fe98e9a69bf307daae00ab29c23',
};

const resolveDirectory = (rev: string) =>
  path.resolve(envPaths(pkg.name.replace(/\//g, '-')).temp, rev);

describe('createHardhatRuntimeEnvironmentAtGitRev', () => {
  beforeEach(async () => {
    for (const rev of Object.values(revs)) {
      assert(!(await exists(resolveDirectory(rev))));
    }
  });

  afterEach(async () => {
    for (const rev of Object.values(revs)) {
      await remove(resolveDirectory(rev));
    }
  });

  it('creates temporary directory', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRev(
      hre.config,
      revs.pnpm,
    );

    assert.equal(resolveDirectory(revs.pnpm), gitHre.config.paths.root);
    assert(await exists(gitHre.config.paths.root));
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

    assert(await exists(nodeModulesDirectory));
    // package-lock.json not present because pnpm is the inferred package manager
    assert(!(await exists(packageLockPath)));
    // pnpm-lock.yaml present because pnpm is the inferred package manager
    assert(await exists(pnpmLockPath));
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

    assert(await exists(nodeModulesDirectory));
    // package-lock.json not present because yarn is the inferred package manager
    assert(!(await exists(packageLockPath)));
    // pnpm-lock.yaml not present because yarn is the inferred package manager
    assert(!(await exists(pnpmLockPath)));
    // yarn.lock present because yarn is the inferred package manager
    assert(await exists(yarnLockPath));
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
    assert(await exists(packageLockPath));
    // pnpm-lock.yaml present because of git tracking
    assert(await exists(pnpmLockPath));
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
    assert(await exists(bunLockPath));
    // pnpm-lock.yaml present because of git tracking
    assert(await exists(pnpmLockPath));
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
    assert(await exists(yarnLockPath));
    // pnpm-lock.yaml present because of git tracking
    assert(await exists(pnpmLockPath));
  });

  it('registers plugins', async () => {
    const taskName = 'temp';

    const plugin = {
      id: 'temp',
      tasks: [
        task(taskName)
          .setInlineAction(async () => {
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
