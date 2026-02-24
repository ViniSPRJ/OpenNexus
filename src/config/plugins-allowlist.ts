import type { OpenNexusConfig } from "./config.js";

export function ensurePluginAllowlisted(cfg: OpenNexusConfig, pluginId: string): OpenNexusConfig {
  const allow = cfg.plugins?.allow;
  if (!Array.isArray(allow) || allow.includes(pluginId)) {
    return cfg;
  }
  return {
    ...cfg,
    plugins: {
      ...cfg.plugins,
      allow: [...allow, pluginId],
    },
  };
}
