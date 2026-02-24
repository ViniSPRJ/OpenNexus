import type {
  AnyAgentTool,
  OpenNexusPluginApi,
  OpenNexusPluginToolFactory,
} from "../../src/plugins/types.js";
import { createLobsterTool } from "./src/lobster-tool.js";

export default function register(api: OpenNexusPluginApi) {
  api.registerTool(
    ((ctx) => {
      if (ctx.sandboxed) {
        return null;
      }
      return createLobsterTool(api) as AnyAgentTool;
    }) as OpenNexusPluginToolFactory,
    { optional: true },
  );
}
