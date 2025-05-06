import pkg from '../package.json';
import taskGit from './tasks/git.js';
import taskGitClone from './tasks/git_clone.js';
import taskGitRemove from './tasks/git_remove.js';
import taskGitShow from './tasks/git_show.js';
import './type_extensions.js';
import type { HardhatPlugin } from 'hardhat/types/plugins';

const plugin: HardhatPlugin = {
  id: pkg.name!,
  npmPackage: pkg.name!,
  tasks: [taskGit, taskGitClone, taskGitRemove, taskGitShow],
  hookHandlers: {
    config: import.meta.resolve('./hooks/config.js'),
  },
};

export default plugin;
