import { PluginMessageType } from '../libs/types';

async function initializePlugin() {

  figma.showUI(__html__, {
    width: 400,
    height: 520,
    title: 'Tokens Exporter'
  });

  figma.on("selectionchange", async () => {
    const selectionColors = figma.getSelectionColors();
    const styles = selectionColors?.styles;

    if (!styles) return;
    const onlyColors = styles.filter((paintStyle) => {
      return paintStyle.paints.every((paint) => paint.type === 'SOLID');
    });

    const colors = onlyColors.map((paintStyle) => {
      if (paintStyle.paints[0].type === 'SOLID') {
        return {
          name: paintStyle.name,
          r: paintStyle.paints[0].color.r * 255,
          g: paintStyle.paints[0].color.g * 255,
          b: paintStyle.paints[0].color.b * 255,
          a: paintStyle.paints[0].opacity
        };
      }
    });


    figma.ui.postMessage({
      type: PluginMessageType.EXTRACT_TO_TOKENS,
      colors: colors
    });
  });

  figma.ui.onmessage = (msg) => {
    if (msg.type === PluginMessageType.NOTIFY) {
      figma.notify(msg.message);
    }
  };
}

initializePlugin();
