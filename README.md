# Hardhat Git

Isolated HRE execution based on Git revisions.

## Installation

```bash
npm install --save-dev @solidstate/hardhat-git
# or
pnpm add -D @solidstate/hardhat-git
```

## Usage

This plugin is primarily intended to be a dependency for other plugins. It exposes a custom HRE factory which does the following:

- Create a temporary clone of the current repository.
- Check out the specified git revision.
- Install NPM dependencies.

The returned HRE instance can be used just like a standard HRE.

See the [`@solidstate/hardhat-contract-sizer`](https://www.npmjs.com/package/@solidstate/hardhat-contract-sizer) and [`@solidstate/hardhat-storage-layout-diff`](https://www.npmjs.com/package/solidstate/hardhat-storage-layout-inspector) packages for implementation examples.

Load the factory and checkout a git revision:

```typescript
import { createHardhatRuntimeEnvironmentAtGitRev } from '@solidstate/hardhat-git';

const gitHre = await createHardhatRuntimeEnvironmentAtGitRev(hre, 'HEAD~1');
```

Optionally declare the plugin as a dependency to expose the helper tasks:

```typescript
const plugin: HardhatPlugin = {
  dependencies: [async () => (await import('@solidstate/hardhat-git')).default],
};
```

Load plugin standalone in Hardhat config:

```typescript
import HardhatGit from '@solidstate/hardhat-git';

const config: HardhatUserConfig = {
  plugins: [
    HardhatGit,
  ],
  git: {
    ... // see table for configuration options
  },
};
```

Add configuration under the `git` key:

| option       | description                                                   | default                                                               |
| ------------ | ------------------------------------------------------------- | --------------------------------------------------------------------- |
| `npmInstall` | Command used to install NPM dependencies in repository clones | inferred via `package-manager-detector`, falls back to`'npm install'` |

## Development

Install dependencies via pnpm:

```bash
pnpm install
```

Setup Husky to format code on commit:

```bash
pnpm prepare
```
