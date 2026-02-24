import type { OpenNexusPluginApi } from "opennexus/plugin-sdk";
import { emptyPluginConfigSchema } from "opennexus/plugin-sdk";
import { createDiagnosticsOtelService } from "./src/service.js";

const plugin = {
  id: "diagnostics-otel",
  name: "Diagnostics OpenTelemetry",
  description: "Export diagnostics events to OpenTelemetry",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenNexusPluginApi) {
    api.registerService(createDiagnosticsOtelService());
  },
};

export default plugin;
