# Solidstate Hardhat Plugin Template

> Note: This repository was generated from a template or is the template itself. To set up a new project, update all values and address all comments marked "TODO" and remove this notice.

## Installation

<!-- TODO: set package name -->

```bash
npm install --save-dev todo
# or
yarn add --dev todo
```

## Usage

Load plugin in Hardhat config:

<!-- TODO: update plugin name and config key -->

```typescript
import HardhatPlugin from 'todo';

const config: HardhatUserConfig = {
  plugins: [
    HardhatPlugin,
  ],
  hardhatPlugin: {
    ... // see table for configuration options
  },
};
```

<!-- TODO: populate table and update config key -->

Add configuration under the `hardhatPlugin` key:

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
