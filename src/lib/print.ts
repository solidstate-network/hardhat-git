import { HardhatGitClone } from './hardhat_git.js';
import { createTable } from '@solidstate/hardhat-solidstate-utils/table';
import chalk from 'chalk';

export const printClone = async (clone: HardhatGitClone) => {
  printClones([clone]);
};

export const printClones = async (clones: HardhatGitClone[]) => {
  const table = createTable();

  table.push([
    { content: chalk.bold('Parsed rev') },
    { content: chalk.bold('Directory') },
    { content: chalk.bold('Initialized') },
  ]);

  for (const clone of clones) {
    const isInitialized = await clone.isInitialized();
    table.push([
      { content: clone.rev },
      { content: clone.directory },
      {
        content: isInitialized
          ? chalk.green(isInitialized)
          : chalk.red(isInitialized),
      },
    ]);
  }

  console.log(table.toString());
};
