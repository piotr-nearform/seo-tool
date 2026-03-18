#!/usr/bin/env node

// src/cli/index.ts
import { Command } from "commander";
import { createRequire } from "module";

// src/cli/commands/init.ts
function registerInitCommand(program2) {
  program2.command("init").description("Initialize a new SEO pages project").action(() => {
    console.log("init: not yet implemented");
  });
}

// src/cli/commands/build.ts
function registerBuildCommand(program2) {
  program2.command("build").description("Build all SEO pages from config and templates").action(() => {
    console.log("build: not yet implemented");
  });
}

// src/cli/commands/preview.ts
function registerPreviewCommand(program2) {
  program2.command("preview").description("Start a local preview server for generated pages").action(() => {
    console.log("preview: not yet implemented");
  });
}

// src/cli/commands/audit.ts
function registerAuditCommand(program2) {
  program2.command("audit").description("Run content quality and SEO audit on generated pages").action(() => {
    console.log("audit: not yet implemented");
  });
}

// src/cli/commands/export.ts
function registerExportCommand(program2) {
  program2.command("export").description("Export generated pages for deployment").action(() => {
    console.log("export: not yet implemented");
  });
}

// src/cli/index.ts
var require2 = createRequire(import.meta.url);
var pkg = require2("../../package.json");
var program = new Command();
program.name("seo").description("Programmatic SEO page generator").version(pkg.version).option("--verbose", "Enable verbose output").option("--quiet", "Suppress all output except errors").option("--config <path>", "Path to config file", "config.yaml");
registerInitCommand(program);
registerBuildCommand(program);
registerPreviewCommand(program);
registerAuditCommand(program);
registerExportCommand(program);
program.parse(process.argv);
//# sourceMappingURL=index.js.map