#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { marked } from "marked";
import puppeteer from "puppeteer";
import path from "path";

//Here goes your output directory, you can change this url for your current computer.
const OUTPUT_DIR = "/Users/ap0lo99/Documents/it-projects";

//Here you can change the name of the extension
const server = new Server(
    {
        name: "mcp-export-pdf",
        version: "2.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "export_to_pdf",
                description: "Exporta respuestas, documentación o guías en Markdown a un PDF estilizado profesionalmente.",
                inputSchema: {
                    type: "object",
                    properties: {
                        filename: {
                            type: "string",
                            description: "Nombre del archivo PDF (ej: Guia_SQL.pdf)",
                        },
                        title: {
                            type: "string",
                            description: "Título principal para la cabecera del documento",
                        },
                        content: {
                            type: "string",
                            description: "El contenido en formato Markdown completo a exportar",
                        },
                    },
                    required: ["filename", "content"],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "export_to_pdf") {
        const { filename, title, content } = request.params.arguments;

        const safeFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
        const filePath = path.join(OUTPUT_DIR, safeFilename);

        try {
            // 1. Convertir el Markdown a HTML
            const markdownBody = title ? `# ${title}\n\n${content}` : content;
            const htmlContent = await marked.parse(markdownBody);

            // 2. Aplicar una plantilla HTML/CSS profesional (GitHub Style / Clean Modern)
            const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #24292e;
              padding: 40px;
              font-size: 14px;
            }
            h1 { font-size: 26px; border-bottom: 2px solid #eaecef; padding-bottom: 8px; color: #0366d6; }
            h2 { font-size: 20px; border-bottom: 1px solid #eaecef; padding-bottom: 6px; margin-top: 24px; }
            h3 { font-size: 16px; margin-top: 18px; }
            p, ul, ol { margin-bottom: 16px; }
            code {
              background-color: #f6f8fa;
              padding: 2px 5px;
              border-radius: 3px;
              font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
              font-size: 85%;
            }
            pre {
              background-color: #f6f8fa;
              padding: 16px;
              border-radius: 6px;
              overflow: auto;
              line-height: 1.45;
            }
            pre code { background-color: transparent; padding: 0; }
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 16px;
            }
            table th, table td {
              padding: 8px 12px;
              border: 1px solid #dfe2e5;
            }
            table th {
              background-color: #f6f8fa;
              font-weight: bold;
            }
            table tr:nth-child(2n) {
              background-color: #f8f9fa;
            }
            blockquote {
              padding: 0 1em;
              color: #6a737d;
              border-left: 0.25em solid #dfe2e5;
              margin: 0 0 16px 0;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;

            // 3. Renderizar el PDF con Puppeteer
            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();
            await page.setContent(fullHtml, { waitUntil: "networkidle0" });

            await page.pdf({
                path: filePath,
                format: "A4",
                margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
                printBackground: true,
            });

            await browser.close();

            return {
                content: [
                    {
                        type: "text",
                        text: `PDF generado profesionalmente en: ${filePath}`,
                    },
                ],
            };
        } catch (error) {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `Error al crear el PDF: ${error.message}`,
                    },
                ],
            };
        }
    }

    throw new Error(`Herramienta no encontrada: ${request.params.name}`);
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((err) => {
    console.error("Error fatal en el servidor MCP PDF:", err);
    process.exit(1);
});
