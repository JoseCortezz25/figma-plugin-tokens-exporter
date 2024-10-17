import type * as hast from "hast";
import { h } from "hastscript";

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Buffer } from "buffer";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatError(error: Error) {
  let errorMessage;
  if (error instanceof Error) errorMessage = error.message;
  else errorMessage = String(error);
  return errorMessage;
}

function ab2str(buf: Uint8Array) {
  return String.fromCharCode.apply(null, Array.from(new Uint16Array(buf)));
}

export const exportSelected = (svgCode: Uint8Array) => {
  const svg = ab2str(svgCode);
  return svg;
};

export function imageToDataURL(data: Uint8Array): string | undefined {
  if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e) {
    const base64 = Buffer.from(data).toString("base64");
    return "data:image/png;base64," + base64;
  } else if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    const base64 = Buffer.from(data).toString("base64");
    return "data:image/jpeg;base64," + base64;
  } else {
    console.error("TODO: unsupported image data type");
    return undefined;
  }
}

export const getStyleByNode = async (node: SceneNode): Promise<{ [key: string]: string }> => {
  const style = await node.getCSSAsync();
  return style;
};

export const formatNodeName = (name: string, id: number) => {
  let formattedName = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replaceAll('[', '')
    .replaceAll(']', '')
    .replaceAll('{', '')
    .replaceAll('}', '')
    + `-${id}`;

  formattedName = formattedName.replace(/^[^a-z]+/, '');
  if (formattedName === '') {
    formattedName = 'n';
  }

  return formattedName;
};

interface ColorRGB {
  a: number;
  b: number;
  g: number;
  r: number;
}

export const getColorByRGB = (colorRGB: ColorRGB) => {
  return `rgba(${colorRGB.r.toFixed(3)}, ${colorRGB.g.toFixed(3)}, ${colorRGB.b.toFixed(3)}, ${colorRGB.a.toFixed(3)})`;
};

const lineBreakRegExp = /\r\n|[\n\r\u2028\u2029\u0085]/;

export function processCharacters(characters: string): hast.Content[] {
  const lines = characters.split(lineBreakRegExp);
  const results: hast.RootContent[] = [];
  for (let i = 0; i < lines.length; ++i) {
    if (i !== 0) {
      results.push(h("br"));
    }
    results.push({
      type: "text",
      value: lines[i]
    });
  }
  return results;
}