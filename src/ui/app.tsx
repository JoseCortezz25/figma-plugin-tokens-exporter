import { useState, useEffect, useRef, useReducer } from 'react';
import { Button } from '@ui/components/ui/button';
import { Casing, Language, Model, PluginMessageType } from '../libs/types';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Color } from '../libs/types';
import PreviewColor from './components/preview-color';
import '@ui/styles/main.css';
import { getFormatCode } from '../libs/utils';
import reducerForm, { ActionType } from './hooks/use-form';

function App() {
  const [colors, setColors] = useState<Color[]>([]);
  const [result, setResult] = useState<string>("");
  const htmlToCopyRef = useRef<string | undefined>();
  const initialState = {
    values: {
      language: Language.JSON,
      casing: Casing.CAMEL,
      model: Model.RGB
    }
  };
  const [state, dispatch] = useReducer(reducerForm, initialState);

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

  const generate = (colors: Color[]) => {
    console.log("Generating code...");
    console.log("Colors: ", colors);
    console.log("State: ", state.values);

    const result = getFormatCode(colors as Color[], state.values);
    setResult(result);
    console.log("Result: ", result);

  };

  return (
    <section className="px-3 my-6 flex flex-col gap-7">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-[15px] capitalize">Color Selection</h2>
          {colors.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {colors.map((color, index) => (
                <PreviewColor key={index} color={color} />
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground">No colors selected</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-[15px] capitalize">Language</h2>
          <RadioGroup
            className="grid grid-cols-2 gap-2"
            defaultValue={state.values.language}
            onValueChange={
              (value) => dispatch({
                type: ActionType.SET_LANGUAGE,
                values: { language: value as Language }
              })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Language.JSON} id="json" />
              <Label htmlFor="json">JSON</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Language.SASS} id="sass" />
              <Label htmlFor="sass">SASS</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Language.CSS} id="css" />
              <Label htmlFor="css">CSS</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Language.JAVASCRIPT} id="javascript" />
              <Label htmlFor="javascript">JavaScript</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-[15px] capitalize">Casing</h2>
          <RadioGroup
            className="grid grid-cols-2 gap-2"
            defaultValue={state.values.casing}
            onValueChange={
              (value) => dispatch({
                type: ActionType.SET_CASING,
                values: { casing: value as Casing }
              })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Casing.CAMEL} id="camel" />
              <Label htmlFor="camel">Camel</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Casing.CONSTANT} id="constant" />
              <Label htmlFor="constant">Constant</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Casing.HEADER} id="header" />
              <Label htmlFor="header">Header</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Casing.PASCAL} id="pascal" />
              <Label htmlFor="pascal">Pascal</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Casing.CAPITAL} id="capital" />
              <Label htmlFor="capital">Capital</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Casing.DOT} id="dot" />
              <Label htmlFor="dot">Dot</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Casing.PARAM} id="param" />
              <Label htmlFor="param">Param</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Casing.SNAKE} id="snake" />
              <Label htmlFor="snake">Snake</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-[15px] capitalize">Model</h2>
          <RadioGroup
            className="grid grid-cols-2 gap-2"
            defaultValue={state.values.model}
            onValueChange={
              (value) => dispatch({
                type: ActionType.SET_MODEL,
                values: { model: value as Model }
              })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Model.RGB} id="rgb" />
              <Label htmlFor="rgb">RGB</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Model.HSL} id="hsl" />
              <Label htmlFor="hsl">HSL</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value={Model.HEX} id="hex" />
              <Label htmlFor="hex">HEX</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          onClick={() => generate(colors)}
          className="w-full"
          disabled={colors.length === 0}
        >
          Export Colors
        </Button>

        <Button
          onClick={() => onCopyButtonClick()}
          variant="outline"
          className="w-full"
        >
          Copy to Clipboard
        </Button>
      </div>

      {result && (
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-[15px]">
            Code Preview
          </h2>
          <Textarea
            defaultValue={result}
            className="bg-neutral-100 w-full min-h-[300px] max-h-[300px] border-none outline-none focus:ring-0 focus-visible:ring-0"
          />
        </div>
      )}
    </section>
  );
}

export default App;