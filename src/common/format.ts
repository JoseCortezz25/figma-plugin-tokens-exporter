import type { Options } from "prettier";
import prettier from "prettier/standalone";
import pluginBabel from "prettier/plugins/babel";
import pluginEstree from "prettier/plugins/estree";
import pluginPostcss from "prettier/plugins/postcss";
import pluginHtml from "prettier/plugins/html";

export function formatJS(
  value: string,
  options: Options = {}
): Promise<string> {
  return prettier.format(value, {
    ...options,
    parser: "babel",
    plugins: [pluginEstree, pluginBabel]
  });
}

export function formatHTML(
  value: string,
  options: Options = {}
): Promise<string> {
  return prettier.format(value, {
    ...options,
    parser: "html",
    plugins: [pluginHtml, pluginPostcss]
  });
}
