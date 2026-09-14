import esbuild from "esbuild";

const options = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "main.js",
  external: ["obsidian", "fs", "path", "child_process"],
  format: "cjs",
};

const production = process.argv.includes("production");

if (production) {
  await esbuild.build(options);
} else {
  const ctx = await esbuild.context(options);
  await ctx.watch();

  console.log("Watching for changes...");
}
