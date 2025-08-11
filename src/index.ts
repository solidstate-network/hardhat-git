import pkg from '../package.json' with { type: 'json' };
import taskGit from './tasks/git.js';
import taskGitCheckout from './tasks/git_checkout.js';
import taskGitList from './tasks/git_list.js';
import taskGitRemove from './tasks/git_remove.js';
import taskGitShow from './tasks/git_show.js';
import './type_extensions.js';
import type { HardhatPlugin } from 'hardhat/types/plugins';

export * from './lib/hre.js';

const plugin: HardhatPlugin = {
  id: pkg.name!,
  npmPackage: pkg.name!,
  dependencies: () => [import('@solidstate/hardhat-solidstate-utils')],
  tasks: [taskGit, taskGitCheckout, taskGitList, taskGitRemove, taskGitShow],
  hookHandlers: {
    config: () => import('./hooks/config.js'),
  },
};

export default plugin;
