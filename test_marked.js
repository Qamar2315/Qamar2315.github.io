const marked = require('marked');

const long_description = "Developed and published a feature-rich VS Code Extension that converts Markdown files into professional, publication-ready documents. The extension prioritizes clean, watermark-free output and offers advanced theming options for various use cases (Academic, Corporate, Tech).\n\nKey capabilities include:\n1. **Multi-Format Conversion Engine:** Engineered a conversion pipeline using markdown-it and Puppeteer (headless Chrome) for high-fidelity PDF rendering, with adapters for HTML and DOCX export.\n2. **Advanced Theming System:** Created 10 professional CSS-based themes that dynamically inject styling into the rendering pipeline, supporting syntax highlighting and complex layouts.\n3. **VS Code Integration:** Deeply integrated with the VS Code API for command palette commands, context menu actions, and reactive configuration settings.";

console.log(marked.parse(long_description));
