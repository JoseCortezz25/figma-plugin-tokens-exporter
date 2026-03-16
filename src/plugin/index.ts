import { Color, ExtractionMethod, PluginMessageType } from '../libs/types';

let currentMethod: ExtractionMethod = ExtractionMethod.STYLES;

async function initializePlugin() {

  figma.showUI(__html__, {
    width: 400,
    height: 600,
    title: 'Tokens Exporter'
  });

  figma.on("selectionchange", async () => {
    await extractAndSend();
  });

  figma.ui.onmessage = async (msg) => {
    if (msg.type === PluginMessageType.NOTIFY) {
      figma.notify(msg.message);
    }

    if (msg.type === PluginMessageType.SET_EXTRACTION_METHOD) {
      currentMethod = msg.method as ExtractionMethod;
      await extractAndSend();
    }
  };
}

function getStyleColors(): Color[] {
  const selectionColors = figma.getSelectionColors();
  const styles = selectionColors?.styles;

  if (!styles) return [];

  const onlyColors = styles.filter((paintStyle) => {
    return paintStyle.paints.every((paint) => paint.type === 'SOLID');
  });

  return onlyColors.map((paintStyle) => {
    const paint = paintStyle.paints[0];
    if (paint.type === 'SOLID') {
      return {
        name: paintStyle.name,
        r: paint.color.r * 255,
        g: paint.color.g * 255,
        b: paint.color.b * 255,
        a: paint.opacity ?? 1
      };
    }
    return null;
  }).filter((c): c is Color => c !== null);
}

async function getVariableColors(): Promise<Color[]> {
  const variableMap = new Map<string, Color>();

  async function traverseNode(node: SceneNode) {
    if ('boundVariables' in node && node.boundVariables) {
      const boundVars = node.boundVariables as Record<
        string,
        { type: string; id: string } | Array<{ type: string; id: string }>
      >;

      for (const binding of Object.values(boundVars)) {
        const aliases = Array.isArray(binding) ? binding : [binding];

        for (const alias of aliases) {
          if (alias && alias.type === 'VARIABLE_ALIAS' && !variableMap.has(alias.id)) {
            const variable = await figma.variables.getVariableByIdAsync(alias.id);

            if (variable && variable.resolvedType === 'COLOR') {
              const modeValues = Object.values(variable.valuesByMode);

              if (modeValues.length > 0) {
                const value = modeValues[0] as RGBA;

                if (typeof value === 'object' && 'r' in value) {
                  variableMap.set(alias.id, {
                    name: variable.name,
                    r: value.r * 255,
                    g: value.g * 255,
                    b: value.b * 255,
                    a: value.a ?? 1
                  });
                }
              }
            }
          }
        }
      }
    }

    if ('children' in node) {
      for (const child of (node as ChildrenMixin).children) {
        await traverseNode(child);
      }
    }
  }

  for (const node of figma.currentPage.selection) {
    await traverseNode(node);
  }

  return Array.from(variableMap.values());
}

async function extractAndSend() {
  let colors: Color[] = [];

  if (currentMethod === ExtractionMethod.STYLES) {
    colors = getStyleColors();
  } else if (currentMethod === ExtractionMethod.VARIABLES) {
    colors = await getVariableColors();
  } else if (currentMethod === ExtractionMethod.BOTH) {
    const styleColors = getStyleColors();
    const variableColors = await getVariableColors();

    // Deduplicate by name: styles take priority
    const nameSet = new Set(styleColors.map(c => c.name));
    const uniqueVariableColors = variableColors.filter(c => !nameSet.has(c.name));
    colors = [...styleColors, ...uniqueVariableColors];
  }

  figma.ui.postMessage({
    type: PluginMessageType.EXTRACT_TO_TOKENS,
    colors
  });
}

initializePlugin();
