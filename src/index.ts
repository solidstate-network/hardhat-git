import pkg from '../package.json';
import taskGit from './tasks/git.js';
import taskGitClone from './tasks/git_clone.js';
import taskGitRemove from './tasks/git_remove.js';
import taskGitShow from './tasks/git_show.js';
import type { HardhatPlugin } from 'hardhat/types/plugins';

export * from './lib/hre.js';

const plugin: HardhatPlugin = {
  id: pkg.name!,
  npmPackage: pkg.name!,
  tasks: [taskGit, taskGitClone, taskGitRemove, taskGitShow],
};

export default plugin;
