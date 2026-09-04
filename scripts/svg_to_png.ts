import { walk } from "https://deno.land/std@0.218.2/fs/walk.ts";
import { resvg } from "https://deno.land/x/resvg_wasm@0.2.0/mod.ts";
import { parse } from "https://deno.land/std@0.218.2/path/mod.ts";

async function convertSvgs() {
  for await (const entry of walk(".", {
    match: [/\.svg$/],
    skip: [/_site/, /_temp/],
  })) {
    const filePath = entry.path;
    const { name } = parse(filePath);
    const svgData = await Deno.readFile(filePath);

    // Resvg is a good option for converting SVG to PNG in Deno
    const pngData = await resvg(svgData).render();

    // Save the new PNG file
    const outputDir = `_site/img`; // Adjust this path as needed
    await Deno.mkdir(outputDir, { recursive: true });
    await Deno.writeFile(`${outputDir}/${name}.png`, pngData);
  }
}

await convertSvgs();
