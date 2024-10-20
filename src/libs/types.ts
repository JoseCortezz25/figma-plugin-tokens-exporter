export enum Language {
  JSON = 'json',
  SASS = 'sass',
  CSS = 'css',
  JAVASCRIPT = 'javascript'
};

export enum Casing {
  CAMEL = 'camel',
  CONSTANT = 'constant',
  HEADER = 'header',
  PASCAL = 'pascal',
  CAPITAL = 'capital',
  DOT = 'dot',
  PARAM = 'param',
  SNAKE = 'snake'
};

export enum Model {
  RGB = 'rgb',
  HSL = 'hsl',
  HEX = 'hex'
};

export type Values = {
  language?: Language;
  casing?: Casing;
  model?: Model;
};

export type Color = {
  name: string;
  // color: string;
  r: number;
  g: number;
  b: number;
  a: number;
};

export enum PluginMessageType {
  EXTRACT_TO_HTML = "extract-to-html",
  SELECTION_CHANGE = "selection-change",
  EXTRACT_TO_SVG = "extract-to-svg",
  NOTIFY = "notify",
  EXTRACT_TO_TOKENS = "extract-tokens",
  EXTRACT_TO_FONT = "extract-font",
}
