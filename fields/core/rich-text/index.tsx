import { Field } from "@/types/field";
import { htmlSwapPrefix, rawToRelativeUrls } from "@/lib/githubImage";
import { EditComponent } from "./edit-component";
import { ViewComponent } from "./view-component";
import { marked } from "marked";
import TurndownService from "turndown";
import { tables, strikethrough } from "joplin-turndown-plugin-gfm";
import { z } from "zod";
import { Config } from "@/types/config";

// The editor will pass either raw or html around depending on the mode being used
export type RichTextValue = { raw: string, html?: undefined } | { html: string, raw?: undefined }

export const rawToHtmlWithRelativeUrls = (raw: any, field: Field, config: Record<string, any>) => {

  let html = field.options?.format === "html" ? raw
    : raw ? marked(raw)
      : raw;

  const prefixInput = field.options?.input ?? config.object.media?.input;
  const prefixOutput = field.options?.output ?? config.object.media?.output;

  return htmlSwapPrefix(html, prefixOutput, prefixInput, true);
};

export const htmlToRawWithRelativeUrls = (raw: any, field: Field, config: Record<string, any>) => {

  let content = rawToRelativeUrls(config.owner, config.repo, config.branch, raw);

  const prefixInput = field.options?.input ?? config.object.media?.input;
  const prefixOutput = field.options?.output ?? config.object.media?.output;

  content = htmlSwapPrefix(content, prefixInput, prefixOutput);

  if (field.options?.format !== "html") {

    const turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
    });

    turndownService.use([tables, strikethrough]);
    turndownService.addRule("retain-html", {
      filter: (node: any, options: any) => (
        (
          node.nodeName === "IMG" && (node.getAttribute("width") || node.getAttribute("height"))
        ) ||
        (
          ["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6"].includes(node.nodeName) && (node.getAttribute("style") || node.getAttribute("class"))
        )
      ),
      replacement: (content: string, node: any, options: any) => node.outerHTML
    });

    // We need to strip <colgroup> and <col> tags otherwise turndown won't convert tables
    content = content.replace(/<colgroup>.*?<\/colgroup>/g, '');

    content = turndownService.turndown(content);
  }

  return content;
}

const read = (value: string, field: Field, config: Config) => {
  // Initial value only passes in raw value (which is parsed in the editor). This way we can preserve 
  // the loaded raw value instead of converting raw to html to raw when there are no changes.
  // Also less confusion if we only pass around one value at a time.
  return { raw: value };
};

// html -> (raw = serialized value)
const write = ({ raw, html }: RichTextValue, field: Field, config: Config) => {
  return raw ?? htmlToRawWithRelativeUrls(html, field, config);
};

const schema = (_: Field) => {
  const zHtml = z.object({ html: z.string() })
  const zRaw = z.object({ raw: z.string() })
  return zHtml.or(zRaw);
};

export { EditComponent, schema, ViewComponent, read, write };