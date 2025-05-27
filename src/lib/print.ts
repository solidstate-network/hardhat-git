import { HardhatGitClone } from './hardhat_git.js';
import chalk from 'chalk';
import Table from 'cli-table3';

export const printClone = async (clone: HardhatGitClone) => {
  printClones([clone]);
};

export const printClones = async (clones: HardhatGitClone[]) => {
  const table = new Table({
    style: { head: [], border: [], 'padding-left': 2, 'padding-right': 2 },
    chars: {
      mid: '·',
      'top-mid': '|',
      'left-mid': ' ·',
      'mid-mid': '|',
      'right-mid': '·',
      left: ' |',
      'top-left': ' ·',
      'top-right': '·',
      'bottom-left': ' ·',
      'bottom-right': '·',
      middle: '·',
      top: '-',
      bottom: '-',
      'bottom-mid': '|',
    },
  });

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
