import type { OpenNexusPluginApi } from "opennexus/plugin-sdk";
import { emptyPluginConfigSchema } from "opennexus/plugin-sdk";
import { twitchPlugin } from "./src/plugin.js";
import { setTwitchRuntime } from "./src/runtime.js";

export { monitorTwitchProvider } from "./src/monitor.js";

const plugin = {
  id: "twitch",
  name: "Twitch",
  description: "Twitch channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenNexusPluginApi) {
    setTwitchRuntime(api.runtime);
    // oxlint-disable-next-line typescript/no-explicit-any
    api.registerChannel({ plugin: twitchPlugin as any });
  },
};

export default plugin;
