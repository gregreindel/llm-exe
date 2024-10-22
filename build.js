const esbuild = require("esbuild");

buildAll();

async function buildAll() {
  return Promise.all([
    build('script', {
    	entryPoints: ['src/script.ts'],
    	platform: 'browser',
    	minify: true,
    	target: ['es6'],
    }),
    build("esm", {
      entryPoints: ["src/index.ts"],
      platform: "neutral",
      external: [
        "jsonschema",
        // "handlebars",
        "json-schema-to-ts",
        "exponential-backoff",
        "@aws-sdk/credential-providers",
        "@aws-crypto/sha256-js",
        "@smithy/protocol-http",
        "@smithy/signature-v4",
      ],
    }),
    build("cjs", {
      entryPoints: ["src/index.ts"],
      target: ["node18"],
      platform: "node",
      external: [
        "jsonschema",
        // "handlebars",
        "json-schema-to-ts",
        "exponential-backoff",
        "@aws-sdk/credential-providers",
        "@aws-crypto/sha256-js",
        "@smithy/protocol-http",
        "@smithy/signature-v4",
      ],
    }),
  ]);
}

async function build(name, options) {
  const path = `${name}.js`;
  console.log(`Building ${name}`);

  if (process.argv.includes("--watch")) {
    let ctx = await esbuild.context({
      outfile: `./dist/${path}`,
      bundle: true,
      logLevel: "info",
      sourcemap: true,
      ...options,
      minify: false,
    });
    await ctx.watch();
  } else {
    return esbuild.build({
      outfile: `./dist/${path}`,
      bundle: true,
      ...options,
    });
  }
}
