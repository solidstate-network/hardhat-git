import pkg from '../package.json';
import { createHardhatRuntimeEnvironmentAtGitRef } from '../src/index.js';
import envPaths from 'env-paths';
import hre from 'hardhat';
import { task } from 'hardhat/config';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, beforeEach, afterEach } from 'node:test';
import { simpleGit } from 'simple-git';

// pnpm was the package manager in use at this ref
const ref = 'a307fffeeb69102331a671965236f6b87733f2fa';
const directory = path.resolve(envPaths(pkg.name).temp, ref);

// pnpm was the package manager in use at this ref
// it is used for npm, yarn, and bun tests
// these package managers appear to use compatible node_modules structure, while pnpm does not
// this appears to lead to module resolution failures if the ref is cloned with pnpm and another package manager in the same process
const altRef = '77bdf11772ef59035b3a083b78d86203ebaa471d';
const altDirectory = path.resolve(envPaths(pkg.name).temp, altRef);

// yarn was the package manager in use at this ref
// it is used for package manager inferrence test
const yarnRef = '78a30554cd600c1aef47d2f566167e8fe5e3fbe7';
const yarnDirectory = path.resolve(envPaths(pkg.name).temp, yarnRef);

describe('createHardhatRuntimeEnvironmentAtGitRef', () => {
  beforeEach(async () => {
    assert(!fs.existsSync(directory));
    assert(!fs.existsSync(altDirectory));
    assert(!fs.existsSync(yarnDirectory));
  });

  afterEach(async () => {
    await fs.promises.rm(directory, { recursive: true, force: true });
    await fs.promises.rm(altDirectory, { recursive: true, force: true });
    await fs.promises.rm(yarnDirectory, { recursive: true, force: true });
  });

  it('creates temporary directory', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRef(
      hre.config,
      ref,
    );

    // make sure that the cached directory is correct
    assert.equal(directory, gitHre.config.paths.root);
    assert(fs.existsSync(gitHre.config.paths.root));
  });

  it('clones repository and checks out git ref', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRef(
      hre.config,
      ref,
    );

    const git = simpleGit(gitHre.config.paths.root);

    assert(await git.checkIsRepo());
    assert.equal(await git.revparse('HEAD'), ref);
  });

  it('installs dependencies', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRef(
      hre.config,
      ref,
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

  it('installs dependencies using package manager present at git ref', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRef(
      hre.config,
      yarnRef,
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
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRef(
      { ...hre.config, git: { npmInstall: 'npm install' } },
      altRef,
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
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRef(
      { ...hre.config, git: { npmInstall: 'bun install' } },
      altRef,
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
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRef(
      { ...hre.config, git: { npmInstall: 'yarn install' } },
      altRef,
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

    const gitHre = await createHardhatRuntimeEnvironmentAtGitRef(
      hre.config,
      ref,
      [plugin],
    );

    assert.equal(await gitHre.tasks.getTask(taskName).run(), taskName);
  });
});
