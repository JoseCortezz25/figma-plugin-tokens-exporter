import { initializeNetwork } from '@common/network/init';
import { NetworkSide } from '@common/network/sides';
import { PluginMessageType } from '@ui/libs/types';

async function initializePlugin() {
  initializeNetwork(NetworkSide.PLUGIN);

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
          color: `rgba(${(paintStyle.paints[0].color.r * 255).toFixed(2)}, ${(paintStyle.paints[0].color.g * 255).toFixed(2)}, ${(paintStyle.paints[0].color.b * 255).toFixed(2)}, ${paintStyle.paints[0].opacity})`
        };
      }
    });

    console.log("Colors", colors);

    figma.ui.postMessage({
      type: PluginMessageType.EXTRACT_TO_TOKENS,
      colors: colors
    });
  });
}

initializePlugin();
