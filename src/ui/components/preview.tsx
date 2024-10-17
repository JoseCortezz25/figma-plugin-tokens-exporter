import { createRef, useLayoutEffect, useState } from "react";

interface ContentSize {
  width: number;
  height: number;
}

interface PreviewProps {
  htmlOutput: string;
  contentSize: ContentSize
}

const Preview: React.FC<PreviewProps> = ({ htmlOutput, contentSize }) => {
  const ref = createRef<HTMLDivElement>();
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (ref.current) {
      setViewSize({
        width: ref.current.clientWidth,
        height: ref.current.clientHeight
      });
    }
  }, []);

  const scale = Math.min(
    viewSize.width / contentSize.width,
    viewSize.height / contentSize.height
  );

  return (
    <div
      ref={ref}
      className="w-full h-full"
      style={{
        background: `repeating-conic-gradient(#eee 0% 25%, transparent 0% 50%) 50% / 20px 20px`
      }}
    >
      <iframe
        style={{
          width: `${contentSize.width}px`,
          height: `${contentSize.height}px`,
          transformOrigin: "top left",
          transform: `
            translate(${viewSize.width / 2}px, ${viewSize.height / 2}px)
            scale(${scale})
            translate(-${contentSize.width / 2}px, -${contentSize.height / 2
            }px)`
        }}
        srcDoc={htmlOutput}
      />
    </div>
  );
};

export { Preview };