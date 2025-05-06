# Hardhat Git

Isolated HRE execution based on Git refs.

## Installation

```bash
npm install --save-dev @solidstate/hardhat-git
# or
yarn add --dev @solidstate/hardhat-git
```

## Usage

Load plugin in Hardhat config:

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

<!-- TODO: populate table and update config key -->

Add configuration under the `git` key:

| option | description | default |
| ------ | ----------- | ------- |
|        |             |         |

## Development

Install dependencies via Yarn:

```bash
yarn install
```

Setup Husky to format code on commit:

```bash
yarn prepare
```
