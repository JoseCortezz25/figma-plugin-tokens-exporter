/* eslint-disable @typescript-eslint/no-unused-vars */
import { Color, Language, Model, Values } from "./types";
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatName = (name: string): string => {
  return name.replace(/[()]/g, "").replace(/[^a-zA-Z0-9]/g, "_");
};

const getIntroAndOutro = (config: Values) => {
  let intro = "";
  let outro = "";

  switch (config.language) {
    case "json":
      intro = "{\n";
      outro = "}";
      break;
    case "css":
      intro = ":root {\n";
      outro = "}";
      break;
    case "sass":
    case "javascript":
      intro = "";
      outro = "";
      break;
  }

  return { intro, outro };
};

const getFormatCasing = (name: string, config: Values) => {
  const formatName = name.replace(/[()]/g, "");

  switch (config.casing) {
    case "camel":
      return formatName
        .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
          index === 0 ? match.toLowerCase() : match.toUpperCase()
        ).replace(/\s+/g, "");

    case "constant":
      return formatName.replace(/\s+/g, "_").toUpperCase();

    case "header":
      return formatName
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .replace(/\s+/g, "-");

    case "pascal":
      return formatName
        .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match) => match.toUpperCase())
        .replace(/\s+/g, "");

    case "capital":
      return formatName.replace(/\b\w/g, (char) => char.toUpperCase());

    case "dot":
      return formatName.toLowerCase().replace(/\s+/g, ".");

    case "param":
      return formatName.toLowerCase().replace(/\s+/g, "-");

    case "snake":
      return formatName.toLowerCase().replace(/\s+/g, "_");

    default:
      return formatName.replaceAll(" ", "_");
  }
};

const rgbaToHex = (r: number, g: number, b: number, a: number) => {
  r = Math.round(r);
  g = Math.round(g);
  b = Math.round(b);
  a = Math.round(a * 255);

  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1) +
    (a.toString(16).padStart(2, '0'));
};

// Función arrow para convertir RGBA a HSL
const rgbaToHsl = (r: number, g: number, b: number, a: number) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [
    Math.round(h * 360),
    Math.round(s * 100),
    Math.round(l * 100),
    a
  ];
};

export const colorToRgb = (r: number, g: number, b: number, a: number) => {
  return `rgba(${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)}, ${a.toFixed(2)})`;
};

const getFormatModel = (color: Color, config: Values) => {
  const { r, g, b, a } = color;

  switch (config.model) {
    case Model.RGB:
      return colorToRgb(r, g, b, a);
    case Model.HEX:
      return rgbaToHex(r, g, b, a);
    case Model.HSL:
      return rgbaToHsl(r, g, b, a);
    default:
      return color;
  }
};


export const getFormatCode = (colors: Color[], config: Values) => {
  const { intro, outro } = getIntroAndOutro(config);
  let code = intro;

  colors.forEach((color) => {
    if (config.language === Language.JAVASCRIPT) {
      code += `const ${getFormatCasing(color.name, config)} = '${getFormatModel(color, config)}';\n`;
    }

    if (config.language === Language.JSON) {
      code += `  "${getFormatCasing(color.name, config)}": "${getFormatModel(color, config)}",\n`;
    }

    if (config.language === Language.CSS) {
      code += `  ---${getFormatCasing(color.name, config)}: ${getFormatModel(color, config)};\n`;
    }

    if (config.language === Language.SASS) {
      code += `$${getFormatCasing(color.name, config)}: ${getFormatModel(color, config)};\n`;
    }
  });

  code += outro;
  return code;
};