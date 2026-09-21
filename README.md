# 📄 MCP Export to PDF

A custom **Model Context Protocol (MCP)** server for LM Studio that allows AI models to export conversations, summaries, or structured Markdown documentation directly into a styled, professional PDF file.

It uses `marked` to parse Markdown into HTML and `puppeteer` to render HTML into a high-fidelity PDF, supporting tables, code blocks, emojis, and modern CSS formatting.

## 🚀 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/)
- [LM Studio](https://lmstudio.ai/) with MCP support enabled.
- macOS, Linux, or Windows.

## 📦 Local Installation

1. Clone this repository to your preferred location:
   ```bash
   git clone git@github.com:YOUR_USERNAME/mcp-export-pdf.git
   cd mcp-export-pdf
   ```

2. Install the required dependencies:
   ```bash
   pnpm install
   ```

3. Get the **absolute path** to the `index.js` file:
   - **macOS / Linux:**
     ```bash
     echo "$(pwd)/index.js"
     ```
   - **Windows (PowerShell):**
     ```powershell
     echo "$((Get-Location).Path)\index.js"
     ```
   *(Copy the exact output path from your terminal for the next step).*

## ⚙️ LM Studio Setup

To register this server in LM Studio, add the absolute path to your global MCP configuration file.

1. Open your configuration file in an editor:
   - **macOS / Linux:** `open -e ~/.lmstudio/mcp.json` (or `nano ~/.lmstudio/mcp.json`)
   - **Windows:** `%USERPROFILE%\.lmstudio\mcp.json`

2. Add the `export-pdf` entry inside the `mcpServers` object. Replace `/ABSOLUTE/PATH/TO/mcp-export-pdf/index.js` with the real path obtained in the previous step:

   ```json
   {
     "mcpServers": {
       "export-pdf": {
         "command": "node",
         "args": [
           "/ABSOLUTE/PATH/TO/mcp-export-pdf/index.js"
         ]
       }
     }
   }
   ```

3. Save the changes, open **LM Studio**, navigate to the **Integrations (MCP)** tab, and restart the server to load the `export_to_pdf` tool.

## 💡 Chat Usage

Once active, any model capable of *Tool Calling* (such as Qwen 2.5 Coder) can invoke this tool automatically.

**Example Prompt:**
> *"Generate a quick guide on Hexagonal Architecture in Go and export it to PDF using the `export_to_pdf` tool under the name `Hexagonal_Guide.pdf`."*

The model will output the content in Markdown, trigger `export_to_pdf`, and the server will render the PDF directly into your configured workspace directory.

## 🛠️ Tech Stack

- **@modelcontextprotocol/sdk**: Core MCP server SDK handling Standard I/O (STDIO) communication.
- **Marked**: Fast Markdown-to-HTML parser.
- **Puppeteer**: Headless Chromium engine for PDF generation.
