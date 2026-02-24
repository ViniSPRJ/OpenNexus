import type { OpenNexusPluginApi } from "opennexus/plugin-sdk";
import { emptyPluginConfigSchema } from "opennexus/plugin-sdk";
import { createSynologyChatPlugin } from "./src/channel.js";
import { setSynologyRuntime } from "./src/runtime.js";

const plugin = {
  id: "synology-chat",
  name: "Synology Chat",
  description: "Native Synology Chat channel plugin for OpenNexus",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenNexusPluginApi) {
    setSynologyRuntime(api.runtime);
    api.registerChannel({ plugin: createSynologyChatPlugin() });
  },
};

export default plugin;
