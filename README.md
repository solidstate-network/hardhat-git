# Hardhat Git

Isolated HRE execution based on Git refs.

## Installation

```bash
npm install --save-dev @solidstate/hardhat-git
# or
yarn add --dev @solidstate/hardhat-git
```

## Usage

<!-- TODO: link hardhat-storage-layout-diff and hardhat-contract-sizer examples -->

This plugin is primarily intended to be a dependency for other plugins. It exposes a custom HRE factory which does the following:

- Create a temporary clone of the current repository.
- Check out the given git reference.
- Install NPM dependencies.

The returned HRE instance can be used just like a standard HRE.

Load the factory and checkout a git reference:

```typescript
import { createHardhatRuntimeEnvironmentAtGitRef } from '@solidstate/hardhat-git';

const gitHre = await createHardhatRuntimeEnvironmentAtGitRef(hre, 'HEAD~1');
```

Optionally declare the plugin as a dependency to expose the helper tasks:

```typescript
import HardhatGit from '@solidstate/hardhat-git';

const plugin: HardhatPlugin = {
  dependencies: [HardhatGit],
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

| option       | description                                                   | default         |
| ------------ | ------------------------------------------------------------- | --------------- |
| `npmInstall` | Command used to install NPM dependencies in repository clones | `'npm install'` |

## Development

Install dependencies via Yarn:

```bash
yarn install
```

Setup Husky to format code on commit:

```bash
yarn prepare
```
