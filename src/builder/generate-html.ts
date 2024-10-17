// This file contains old logic to generate HTML content from a Figma node. 
// It uses the `getStyleByNode` function from `@common/utils` to get the CSS styles of a node and the `imageToDataURL` function to convert image fills to data URLs.

import { formatNodeName, imageToDataURL } from '@common/utils';
import { VectorLikeNodeChecker } from '@common/vector-node-checker';

// Definición de la interfaz TreeNodes
interface TreeNodes {
  node: SceneNode;
  children: TreeNodes[];
}

class TreeNodeBuilder {
  private uniqueIdCounter = 0;
  private vectorLikeNodeChecker = new VectorLikeNodeChecker();
  private processedSVGNodes = new Set<string>();
  private html: string = '';
  private styles: string = '';
  private indentLevel: number = 0;

  constructor() { }

  // Función para añadir indentación
  private addIndentation(level: number): string {
    return '  '.repeat(level);
  }

  private async getStyleByNode(node: SceneNode): Promise<{ [key: string]: string }> {
    const style = await node.getCSSAsync();
    return style;
  }

  // Nueva función generateTreeNodes con tipado según TreeNodes
  private generateTreeNodes(node: SceneNode): TreeNodes {
    const result: TreeNodes = {
      node: node,
      children: []
    };

    if ('children' in node && Array.isArray(node.children)) {
      for (const child of (node.children as SceneNode[])) {
        result.children.push(this.generateTreeNodes(child));
      }
    }

    return result;
  };

  private async processNode(node: TreeNodes): Promise<void> {
    const nodeChild = node.node;
    if (!nodeChild.visible) {
      return;
    }

    if ("isMask" in nodeChild && nodeChild.isMask) {
      return undefined;
    }

    const formattedName = formatNodeName(nodeChild.name, this.uniqueIdCounter++);
    if (nodeChild.type === 'TEXT') {
      const fontFamily = (nodeChild.fontName as FontName).family;
      const allFonts = await figma.listAvailableFontsAsync();
      const usableFonts = allFonts.filter(font => !font.fontName.family.startsWith('.'));
      const font = usableFonts.find(font => font.fontName.family === fontFamily);

      if (font) {
        console.log("Font", font?.fontName);
        await figma.loadFontAsync(font.fontName);
      }
      this.html += `${this.addIndentation(this.indentLevel)}<p class="${formattedName}" id="node-${formatNodeName(nodeChild.id, nodeChild.id)}">\n`;
    } else {
      this.html += `${this.addIndentation(this.indentLevel)}<div class="${formattedName}" id="node-${formatNodeName(nodeChild.id, nodeChild.id)}">\n`;
    }
    this.indentLevel++;

    if (this.vectorLikeNodeChecker.check(nodeChild)) {
      console.log("Node:", node);
      if (this.processedSVGNodes.has(nodeChild.id)) {
        this.indentLevel--;
        this.html += `${this.addIndentation(this.indentLevel)}</div>\n`;
        return;
      }

      try {
        const svg = await nodeChild.exportAsync({ format: "SVG" });
        const svgText = String.fromCharCode(...svg);

        this.html += `${svgText}\n`;

        this.processedSVGNodes.add(nodeChild.id);

        if ((nodeChild as Tree).children && Array.isArray((nodeChild as any).children)) {
          for (const child of (nodeChild as any).children) {
            this.processedSVGNodes.add(child.id);
          }
        }

      } catch (error) {
        console.error("Error exporting SVG", error);
      }
    }

    if (nodeChild.type === 'TEXT') {
      this.html += `${this.addIndentation(this.indentLevel)}${nodeChild.characters}\n`;
    }

    let imageDataUrl: string | undefined = "";

    if (
      (nodeChild.type == "RECTANGLE" ||
        nodeChild.type == "FRAME") &&
      nodeChild.fills !== figma.mixed &&
      nodeChild.fills.length
    ) {
      const fill = nodeChild.fills[0];
      if (fill.type === "IMAGE" && fill.imageHash) {
        const image = figma.getImageByHash(fill.imageHash);
        imageDataUrl = image
          ? imageToDataURL(await image.getBytesAsync())
          : undefined;
      }
    }

    if (nodeChild.type !== 'VECTOR' || nodeChild.type !== 'ELLIPSE' || nodeChild.type !== 'POLYGON') {
      const nodeStyles = await this.getStyleByNode(nodeChild);

      this.styles += `.${formattedName} {\n`;

      for (const key in nodeStyles) {
        if (nodeStyles.hasOwnProperty(key)) {
          const styleValue = nodeStyles[key];
          const backgroundImage = styleValue.replace('url(<path-to-image>)', `url("${imageDataUrl}")`).replaceAll('lightgray', 'transparent');

          if (key === 'background') {
            this.styles += `  ${key}: ${backgroundImage};\n`;
          } else {
            this.styles += `  ${key}: ${nodeStyles[key]};\n`;
          }
        }
      }
      this.styles += `}\n`;
    }

    for (const child of node.children) {
      await this.processNode(child);
    }

    this.indentLevel--;
    if (nodeChild.type === 'TEXT') {
      this.html += `${this.addIndentation(this.indentLevel)}</p>\n`;
    } else {
      this.html += `${this.addIndentation(this.indentLevel)}</div>\n`;
    }
  };

  /**
   *  Limpia el resultado del generador.
   *  @example
   * // Ejemplo de uso:
   * const treeNodeBuilder = new TreeNodeBuilder();
   * treeNodeBuilder.clean();
   * **/
  public clean() {
    this.uniqueIdCounter = 0;
    this.html = '';
    this.styles = '';
    this.indentLevel = 0;
    this.processedSVGNodes = new Set<string>();
  }

  /**
   * Procesa los nodos actuales del árbol y genera el HTML correspondiente.
   * 
   * @param {TreeNodes} currentTreeNodes - Los nodos actuales del árbol que se van a procesar.
   * @returns {Promise<string>} - Una promesa que se resuelve cuando el procesamiento de los nodos ha finalizado y retorna el HTML y CSS .
   * 
   * @description
   * Esta función recorre los nodos del árbol proporcionado, generando el HTML y los estilos CSS correspondientes
   * para cada nodo. Si un nodo no es visible, se omite en el HTML generado. Los nodos vectoriales se exportan como SVG.
   * 
   * @example
   * // Ejemplo de uso:
   * const treeNodeBuilder = new TreeNodeBuilder();
   * await treeNodeBuilder.buildTreeNodesHTML(selectedNode);
   */
  public async buildTreeNodesHTML(currentTreeNodes: SceneNode): Promise<string> {
    const nodes = this.generateTreeNodes(currentTreeNodes);

    await this.processNode(nodes);
    this.html = `<style>\n${this.styles}</style>\n` + this.html;

    return this.html;
  }
}

export { TreeNodeBuilder };