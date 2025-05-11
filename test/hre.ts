import pkg from '../package.json';
import { createHardhatRuntimeEnvironmentAtGitRef } from '../src/index.js';
import hre from 'hardhat';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, beforeEach, afterEach } from 'node:test';
import { simpleGit } from 'simple-git';

// arbitrary git ref
const ref = '78a30554cd600c1aef47d2f566167e8fe5e3fbe7';
// directory cached in constant; tested in directory creation test
const directory = path.resolve(os.tmpdir(), pkg.name, ref);

describe('createHardhatRuntimeEnvironmentAtGitRef', () => {
  beforeEach(async () => {
    assert(!fs.existsSync(directory));
  });

  afterEach(async () => {
    await fs.promises.rm(directory, { recursive: true, force: true });
  });

  it('creates temporary directory', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRef(hre, ref);

    // make sure that the cached directory is correct
    assert.equal(directory, gitHre.config.paths.root);
    assert(fs.existsSync(gitHre.config.paths.root));
  });

  it('clones repository and checks out git ref', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRef(hre, ref);

    const git = simpleGit(gitHre.config.paths.root);

    assert(await git.checkIsRepo());
    assert.equal(await git.revparse('HEAD'), ref);
  });

  it('installs dependencies', async () => {
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRef(hre, ref);

    const nodeModulesDirectory = path.resolve(
      gitHre.config.paths.root,
      'node_modules',
    );

    const packageLockPath = path.resolve(
      gitHre.config.paths.root,
      'package-lock.json',
    );

    const yarnLockPath = path.resolve(gitHre.config.paths.root, 'yarn.lock');

    assert(fs.existsSync(nodeModulesDirectory));
    // package-lock.json not present because yarn is the inferred package manager
    assert(!fs.existsSync(packageLockPath));
    // yarn.lock present because yarn is the inferred package manager
    assert(fs.existsSync(yarnLockPath));
  });

  it('installs dependencies using arbitrary command', async () => {
    // TODO: unsafe config modification
    hre.config.git.npmInstall = 'npm install';
    const gitHre = await createHardhatRuntimeEnvironmentAtGitRef(hre, ref);

    const packageLockPath = path.resolve(
      gitHre.config.paths.root,
      'package-lock.json',
    );

    const yarnLockPath = path.resolve(gitHre.config.paths.root, 'yarn.lock');

    // package-lock.json only present because of custom command
    assert(fs.existsSync(packageLockPath));
    // yarn.lock present because of git tracking
    assert(fs.existsSync(yarnLockPath));
  });
});
