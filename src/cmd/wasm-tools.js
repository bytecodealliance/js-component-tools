import { readFile, writeFile } from "node:fs/promises";
import {
  print as printFn,
  parse as parseFn,
  componentWit as componentWitFn,
  componentNew as componentNewFn,
} from "../../obj/wasm-tools.js";
import { basename, extname } from 'node:path';

export async function parse(file, opts) {
  const source = (await readFile(file)).toString();
  const output = parseFn(source);
  await writeFile(opts.output, output);
}

export async function print(file, opts) {
  const source = await readFile(file);
  const output = printFn(source);
  if (opts.output) {
    await writeFile(opts.output, output);
  } else {
    console.log(output);
  }
}

export async function componentWit(file, opts) {
  const source = await readFile(file);
  const output = componentWitFn(source);
  if (opts.output) {
    await writeFile(opts.output, output);
  } else {
    console.log(output);
  }
}

export async function componentNew(file, opts) {
  const source = file ? await readFile(file) : null;
  if (opts.wit)
    opts.wit = await readFile(opts.wit, 'utf8');
  if (opts.adapt) {
    opts.adapters = await Promise.all(opts.adapt.map(async adapt => {
      let adapter;
      if (adapt.includes('='))
        adapter = adapt.split('=');
      else 
        adapter = [basename(adapt).slice(0, -extname(adapt).length), adapt];
      adapter[1] = await readFile(adapter[1]);
      return adapter;
    }));
  }
  if (opts.encoding)
    opts.stringEncoding = opts.encoding;
  const output = componentNewFn(source, opts);
  await writeFile(opts.output, output);
}
