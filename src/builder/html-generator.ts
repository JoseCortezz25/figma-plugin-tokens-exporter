import type * as hast from "hast";
import { h } from "hastscript";
import * as svgParser from "svg-parser";
import { VectorLikeNodeChecker } from "@common/vector-node-checker";
import { compact } from "lodash-es";
import { formatNodeName, imageToDataURL, processCharacters } from "@common/utils";

export class HTMLGenerator {
  private readonly vectorLikeNodeChecker = new VectorLikeNodeChecker();
  private uniqueIdCounter = 0;
  private styles = ``;
  private fonts = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  `;

  /**
   * Generates CSS for a given node and adds it to the class's `styles` property.
   * 
   * @param {SceneNode} node - The scene node from which CSS styles will be extracted.
   * @param {string} className - The CSS class name to be assigned to the node.
   * @returns {Promise<string>} - A promise that resolves to the CSS class name.
   * 
   * @description
   * This function takes a scene node and a class name, asynchronously extracts the CSS styles from the node,
   * and generates a string with the styles in CSS format. It then adds this string to the class's `styles` property.
   * 
   * @example
   * // Example usage:
   * const node = figma.currentPage.selection[0];
   * const className = "my-node-class";
   * const cssClassName = await generateCSS(node, className);
   * console.log(cssClassName); // "my-node-class"
   */
  async generateCSS(node: SceneNode, className: string): Promise<string> {
    let styleContent = `.${className} {`;

    if (node.type === "TEXT") {
      const fontName = node.fontName as FontName;
      const fontWeight = node.fontWeight;
      const loadFont = `<link href="https://fonts.googleapis.com/css2?family=${String(fontName.family)}:wght@${String(fontWeight)}&display=swap" rel="stylesheet" />`;
      this.fonts += loadFont;
    }

    // Node Image
    if (node.type === "RECTANGLE" && node.fills !== figma.mixed && node.fills.length) {
      const fill = node.fills[0];
      if (fill.type === "IMAGE" && fill.imageHash) {
        // styleContent += `background-image: url("data:image/png;base64,${await node.getFillImageByHashAsync(fill.imageHash)}");`;
      }
    }
    const styles = await node.getCSSAsync();
    for (const key in styles) {

      // eslint-disable-next-line no-prototype-builtins
      if (styles.hasOwnProperty(key)) {
        if (
          node.type === "RECTANGLE" &&
          node.fills !== figma.mixed &&
          node.fills.length &&
          node.fills[0].type === "IMAGE" &&
          node.fills[0].imageHash &&
          (key.includes("background") || styles[key].includes("cover"))
        ) {
          styleContent += `object-fit: cover;`;
        }

        styleContent += `${key}: ${styles[key]};`;
      }
    }
    styleContent += "}";
    this.styles += styleContent;
    return className;
  }

  /**
 * Generates the HTML content corresponding to a scene node.
 * 
 * @param {SceneNode} node - The scene node from which the HTML content will be generated.
 * @returns {Promise<hast.RootContent | undefined>} - A promise that resolves to the generated HTML content or `undefined` if the node is not visible or is a mask.
 * 
 * @description
 * This function takes a scene node and generates the corresponding HTML content based on its type and properties.
 * If the node is not visible or is a mask, the function returns `undefined`. For `RECTANGLE` nodes with image fills,
 * it generates an `<img>` tag. For vector-like nodes, it exports the node as SVG and processes the SVG content.
 * For `TEXT`, `COMPONENT`, `COMPONENT_SET`, `INSTANCE`, `FRAME`, and `GROUP` nodes, it generates a `<div>` tag with the corresponding CSS class
 * and processes its children recursively.
 * 
 * @example
 * // Example usage:
 * const htmlGenerator = new HTMLGenerator();
 * const macaronLayers = compact(
 *  await Promise.all(
 *    selection.map((node) => htmlGenerator.generate(node))
 *  )
 * );
 */
  async generate(
    node: SceneNode
  ): Promise<hast.RootContent | undefined> {

    if (!node.visible) {
      return undefined;
    }

    if ("isMask" in node && node.isMask) {
      return undefined;
    }

    this.uniqueIdCounter++;

    if (node.type == "RECTANGLE" && node.fills !== figma.mixed && node.fills.length) {
      console.log('-----------------');

      console.log("Node Type: ", node.type);
      console.log("Node", node.fills);

      const fill = node.fills[0];
      console.log("Node", fill);
      if (fill.type === "IMAGE" && fill.imageHash) {
        const image = figma.getImageByHash(fill.imageHash);
        console.log("Image: ", image);

        const dataURL = image ? await image.getBytesAsync() : undefined;
        const rawImage = imageToDataURL(dataURL || new Uint8Array());
        console.log("Raw Image: ", rawImage);

        console.log('-------- end ---------');
        return h("img", {
          src: String(rawImage),
          class: await this.generateCSS(node, formatNodeName(node.name, this.uniqueIdCounter))
        });
      }
    }

    if (this.vectorLikeNodeChecker.check(node)) {
      try {
        const svg = await node.exportAsync({ format: "SVG" });
        const svgText = String.fromCharCode(...svg);

        const root = svgParser.parse(svgText) as hast.Root;
        const svgElem = root.children[0];
        if (svgElem.type !== "element") {
          throw new Error("Expected element type");
        }

        const properties = { ...svgElem.properties };
        delete properties.xmlns;
        return { ...svgElem, properties };
      } catch (error) {
        console.error(`error exporting ${node.name} to SVG`);
        console.error(String(error));
      }
    }

    switch (node.type) {
      case "TEXT": {
        return h("div", {
          class: await this.generateCSS(node, formatNodeName(node.name, this.uniqueIdCounter))
        }, ...processCharacters(node.characters));
      }
      case "COMPONENT":
      case "COMPONENT_SET":
      case "INSTANCE":
      case "FRAME": {
        return h(
          "div",
          {
            class: await this.generateCSS(node, formatNodeName(node.name, this.uniqueIdCounter))
          },
          ...compact(
            await Promise.all(
              node.children.map((child) =>
                this.generate(child)
              )
            )
          )
        );
      }
      case "GROUP": {
        return h(
          "div",
          {
            class: await this.generateCSS(node, formatNodeName(node.name, this.uniqueIdCounter))
          },
          ...compact(
            await Promise.all(
              node.children.map((child) =>
                this.generate(child)
              )
            )
          )
        );
      }
      default:
        console.log("ignoring", node.type);
        return undefined;
    }

  }

  /**
   * Returns the CSS class names and add the styles to the class's `styles` property.
   * 
   * @returns {string} - The CSS styles extracted from the scene nodes.
   * 
   * @example
   * // Example usage:
   * const htmlGenerator = new HTMLGenerator();
   * const styles = htmlGenerator.getStyles();
   * console.log(styles); // ".my-node-class { color: red; }"
   */
  getStyles() {
    return this.styles;
  }

  getFonts() {
    return this.fonts;
  }
}