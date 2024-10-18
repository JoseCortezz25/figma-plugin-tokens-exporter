import { Color } from "@libs/types";
import { colorToRgb } from "@libs/utils";

interface PreviewColorProps {
  color: Color;
};

const PreviewColor = ({ color }: PreviewColorProps) => {
  const { r, g, b, a } = color;
  const colorRgb = colorToRgb(r, g, b, a);
  return (
    <div className="size-[25px] rounded-full" style={{ backgroundColor: colorRgb }}></div>
  );
};

export default PreviewColor;