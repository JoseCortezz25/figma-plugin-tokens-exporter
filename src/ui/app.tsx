import { useState, useEffect, useRef } from 'react';
import { Button } from '@ui/components/ui/button';
import { PluginMessageType } from './libs/types';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Color } from './libs/types';
import PreviewColor from './components/preview-color';
import '@ui/styles/main.css';

function App() {
  const [colors, setColors] = useState<Color[]>([]);
  const htmlToCopyRef = useRef<string | undefined>();

  useEffect(() => {
    const onDocumentCopy = (e: ClipboardEvent) => {
      if (htmlToCopyRef.current) {
        e.preventDefault();
        e.clipboardData?.setData("text/plain", htmlToCopyRef.current);
        htmlToCopyRef.current = undefined;
      }
    };

    document.addEventListener("copy", onDocumentCopy);
  }, []);

  const postMessageToPlugin = (message: string): void => {
    parent.postMessage({ pluginMessage: { type: PluginMessageType.NOTIFY, message } }, '*');
  };

  const onCopyButtonClick = () => {
    htmlToCopyRef.current = "In this place, the colors will be copied.";
    document.execCommand("copy");

    postMessageToPlugin("Copied to clipboard.");
  };



  onmessage = async (event: MessageEvent) => {
    const pluginMessage = event.data.pluginMessage;

    if (pluginMessage.type === PluginMessageType.EXTRACT_TO_TOKENS) {
      const { colors } = pluginMessage;
      setColors(colors as Color[]);
    }
  };

  return (
    <section className="px-3 my-6 flex flex-col gap-7">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-[15px] capitalize">Color Selection</h2>
          {colors.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {colors.map((color, index) => (
                <PreviewColor key={index} color={color.color} />
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground">No colors selected</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-[15px] capitalize">Language</h2>
          <RadioGroup defaultValue="json" className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json">JSON</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sass" id="sass" />
              <Label htmlFor="sass">SASS</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="css" id="css" />
              <Label htmlFor="css">CSS</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="javascript" id="javascript" />
              <Label htmlFor="javascript">JavaScript</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-[15px] capitalize">Casing</h2>
          <RadioGroup defaultValue="camel" className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="camel" id="camel" />
              <Label htmlFor="camel">Camel</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="constant" id="constant" />
              <Label htmlFor="constant">Constant</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="header" id="header" />
              <Label htmlFor="header">Header</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pascal" id="pascal" />
              <Label htmlFor="pascal">Pascal</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="capital" id="capital" />
              <Label htmlFor="capital">Capital</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dot" id="dot" />
              <Label htmlFor="dot">Dot</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="param" id="param" />
              <Label htmlFor="param">Param</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="snake" id="snake" />
              <Label htmlFor="snake">Snake</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-[15px] capitalize">Model</h2>
          <RadioGroup defaultValue="rgb" className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rgb" id="rgb" />
              <Label htmlFor="rgb">RGB</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hsl" id="hsl" />
              <Label htmlFor="hsl">HSL</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hex" id="hex" />
              <Label htmlFor="hex">HEX</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={() => { }} className="w-full" disabled={colors.length === 0}>
          Export Colors
        </Button>

        <Button onClick={() => onCopyButtonClick()} variant="outline" className="w-full">
          Copy to Clipboard
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-[15px]">
          Code Preview
        </h2>
        <Textarea
          className="bg-neutral-100 w-full min-h-[300px] max-h-[300px] border-none outline-none focus:ring-0 focus-visible:ring-0"
        />
      </div>
    </section>
  );
}

export default App;