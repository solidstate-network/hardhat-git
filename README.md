# Hardhat Git

Isolated HRE execution based on Git refs.

## Installation

```bash
npm install --save-dev @solidstate/hardhat-git
# or
yarn add --dev @solidstate/hardhat-git
```

## Usage

This plugin is primarily intended to be a dependency for other plugins. It exposes a custom HRE factory which does the following:

- Create a temporary clone of the current repository.
- Check out the specified git reference.
- Install NPM dependencies.

The returned HRE instance can be used just like a standard HRE.

<!-- TODO: link to npm website instead of github -->

See the [`@solidstate/hardhat-contract-sizer`](https://github.com/solidstate-network/hardhat-contract-sizer) and [`@solidstate/hardhat-storage-layout-diff`](https://github.com/solidstate-network/hardhat-storage-layout-diff) packages for implementation examples.

Load the factory and checkout a git reference:

```typescript
import { createHardhatRuntimeEnvironmentAtGitRef } from '@solidstate/hardhat-git';

const gitHre = await createHardhatRuntimeEnvironmentAtGitRef(hre, 'HEAD~1');
```

Optionally declare the plugin as a dependency to expose the helper tasks:

```typescript
import HardhatGit from '@solidstate/hardhat-git';

const plugin: HardhatPlugin = {
  dependencies: [
    async () => {
      const { default: HardhatGit } = await import('@solidstate/hardhat-git');
      return HardhatGit;
    },
  ],
};
```

Load plugin standalone in Hardhat config:

```typescript
import HardhatGit from '@solidstate/hardhat-git';

const config: HardhatUserConfig = {
  plugins: [HardhatGit],
};
```

## Development

Install dependencies via Yarn:

```bash
yarn install
```

Setup Husky to format code on commit:

```bash
yarn prepare
```
