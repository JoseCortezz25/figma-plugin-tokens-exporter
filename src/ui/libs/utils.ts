export const formatName = (name: string): string => {
  return name.replace(/[()]/g, "").replace(/[^a-zA-Z0-9]/g, "_");
};