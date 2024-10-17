interface PreviewColorProps {
  color: string;
};

const PreviewColor = ({ color }: PreviewColorProps) => {
  return (
    <div className="size-[25px] rounded-full" style={{ backgroundColor: color }}></div>
  );
};

export default PreviewColor;