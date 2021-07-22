# `index.test.ts`

**DO NOT MODIFY**. This file has been autogenerated. Run `rome test internal/compiler/transforms/compileForBundle/index.test.ts --update-snapshots` to update.

## `requireRewriteTransform`

### `Diagnostics`

```ts

```

### `Input`

```ts
const a = {};
const b = 3;

module.exports = a;
module.exports = b;

```

### `Output`

```ts
	const ___R$requireRewriteTransform$input_ts = {};
	const ___R$$priv$requireRewriteTransform$input_ts$a = {};
	const ___R$$priv$requireRewriteTransform$input_ts$b = 3;

	___R$requireRewriteTransform$input_ts = ___R$$priv$requireRewriteTransform$input_ts$a;
	___R$requireRewriteTransform$input_ts = ___R$$priv$requireRewriteTransform$input_ts$b;

```