export interface PluginOptions {
  text: string;
};

export interface Payload {
  text?: string;
}

export enum Steps {
  SELECT = "SELECT",
  STAGE = "STAGE",
  GENERATE = "GENERATE",
  TOKENS = "TOKENS",
}

