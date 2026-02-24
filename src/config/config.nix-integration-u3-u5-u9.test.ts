import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  createConfigIO,
  DEFAULT_GATEWAY_PORT,
  resolveConfigPathCandidate,
  resolveGatewayPort,
  resolveIsNixMode,
  resolveStateDir,
} from "./config.js";
import { withTempHome, withTempHomeConfig } from "./test-helpers.js";

function envWith(overrides: Record<string, string | undefined>): NodeJS.ProcessEnv {
  // Hermetic env: don't inherit process.env because other tests may mutate it.
  return { ...overrides };
}

function loadConfigForHome(home: string) {
  return createConfigIO({
    env: envWith({ OPENNEXUS_HOME: home }),
    homedir: () => home,
  }).loadConfig();
}

async function withLoadedConfigForHome(
  config: unknown,
  run: (cfg: ReturnType<typeof loadConfigForHome>) => Promise<void> | void,
) {
  await withTempHomeConfig(config, async ({ home }) => {
    const cfg = loadConfigForHome(home);
    await run(cfg);
  });
}

describe("Nix integration (U3, U5, U9)", () => {
  describe("U3: isNixMode env var detection", () => {
    it("isNixMode is false when OPENNEXUS_NIX_MODE is not set", () => {
      expect(resolveIsNixMode(envWith({ OPENNEXUS_NIX_MODE: undefined }))).toBe(false);
    });

    it("isNixMode is false when OPENNEXUS_NIX_MODE is empty", () => {
      expect(resolveIsNixMode(envWith({ OPENNEXUS_NIX_MODE: "" }))).toBe(false);
    });

    it("isNixMode is false when OPENNEXUS_NIX_MODE is not '1'", () => {
      expect(resolveIsNixMode(envWith({ OPENNEXUS_NIX_MODE: "true" }))).toBe(false);
    });

    it("isNixMode is true when OPENNEXUS_NIX_MODE=1", () => {
      expect(resolveIsNixMode(envWith({ OPENNEXUS_NIX_MODE: "1" }))).toBe(true);
    });
  });

  describe("U5: CONFIG_PATH and STATE_DIR env var overrides", () => {
    it("STATE_DIR defaults to ~/.opennexus when env not set", () => {
      expect(resolveStateDir(envWith({ OPENNEXUS_STATE_DIR: undefined }))).toMatch(/\.opennexus$/);
    });

    it("STATE_DIR respects OPENNEXUS_STATE_DIR override", () => {
      expect(resolveStateDir(envWith({ OPENNEXUS_STATE_DIR: "/custom/state/dir" }))).toBe(
        path.resolve("/custom/state/dir"),
      );
    });

    it("STATE_DIR respects OPENNEXUS_HOME when state override is unset", () => {
      const customHome = path.join(path.sep, "custom", "home");
      expect(
        resolveStateDir(envWith({ OPENNEXUS_HOME: customHome, OPENNEXUS_STATE_DIR: undefined })),
      ).toBe(path.join(path.resolve(customHome), ".opennexus"));
    });

    it("CONFIG_PATH defaults to OPENNEXUS_HOME/.opennexus/opennexus.json", () => {
      const customHome = path.join(path.sep, "custom", "home");
      expect(
        resolveConfigPathCandidate(
          envWith({
            OPENNEXUS_HOME: customHome,
            OPENNEXUS_CONFIG_PATH: undefined,
            OPENNEXUS_STATE_DIR: undefined,
          }),
        ),
      ).toBe(path.join(path.resolve(customHome), ".opennexus", "opennexus.json"));
    });

    it("CONFIG_PATH defaults to ~/.opennexus/opennexus.json when env not set", () => {
      expect(
        resolveConfigPathCandidate(
          envWith({ OPENNEXUS_CONFIG_PATH: undefined, OPENNEXUS_STATE_DIR: undefined }),
        ),
      ).toMatch(/\.opennexus[\\/]opennexus\.json$/);
    });

    it("CONFIG_PATH respects OPENNEXUS_CONFIG_PATH override", () => {
      expect(
        resolveConfigPathCandidate(
          envWith({ OPENNEXUS_CONFIG_PATH: "/nix/store/abc/opennexus.json" }),
        ),
      ).toBe(path.resolve("/nix/store/abc/opennexus.json"));
    });

    it("CONFIG_PATH expands ~ in OPENNEXUS_CONFIG_PATH override", async () => {
      await withTempHome(async (home) => {
        expect(
          resolveConfigPathCandidate(
            envWith({ OPENNEXUS_HOME: home, OPENNEXUS_CONFIG_PATH: "~/.opennexus/custom.json" }),
            () => home,
          ),
        ).toBe(path.join(home, ".opennexus", "custom.json"));
      });
    });

    it("CONFIG_PATH uses STATE_DIR when only state dir is overridden", () => {
      expect(resolveConfigPathCandidate(envWith({ OPENNEXUS_STATE_DIR: "/custom/state" }))).toBe(
        path.join(path.resolve("/custom/state"), "opennexus.json"),
      );
    });
  });

  describe("U5b: tilde expansion for config paths", () => {
    it("expands ~ in common path-ish config fields", async () => {
      await withTempHome(async (home) => {
        const configDir = path.join(home, ".opennexus");
        await fs.mkdir(configDir, { recursive: true });
        const pluginDir = path.join(home, "plugins", "demo-plugin");
        await fs.mkdir(pluginDir, { recursive: true });
        await fs.writeFile(
          path.join(pluginDir, "index.js"),
          'export default { id: "demo-plugin", register() {} };',
          "utf-8",
        );
        await fs.writeFile(
          path.join(pluginDir, "opennexus.plugin.json"),
          JSON.stringify(
            {
              id: "demo-plugin",
              configSchema: { type: "object", additionalProperties: false, properties: {} },
            },
            null,
            2,
          ),
          "utf-8",
        );
        await fs.writeFile(
          path.join(configDir, "opennexus.json"),
          JSON.stringify(
            {
              plugins: {
                load: {
                  paths: ["~/plugins/demo-plugin"],
                },
              },
              agents: {
                defaults: { workspace: "~/ws-default" },
                list: [
                  {
                    id: "main",
                    workspace: "~/ws-agent",
                    agentDir: "~/.opennexus/agents/main",
                    sandbox: { workspaceRoot: "~/sandbox-root" },
                  },
                ],
              },
              channels: {
                whatsapp: {
                  accounts: {
                    personal: {
                      authDir: "~/.opennexus/credentials/wa-personal",
                    },
                  },
                },
              },
            },
            null,
            2,
          ),
          "utf-8",
        );

        const cfg = loadConfigForHome(home);

        expect(cfg.plugins?.load?.paths?.[0]).toBe(path.join(home, "plugins", "demo-plugin"));
        expect(cfg.agents?.defaults?.workspace).toBe(path.join(home, "ws-default"));
        expect(cfg.agents?.list?.[0]?.workspace).toBe(path.join(home, "ws-agent"));
        expect(cfg.agents?.list?.[0]?.agentDir).toBe(
          path.join(home, ".opennexus", "agents", "main"),
        );
        expect(cfg.agents?.list?.[0]?.sandbox?.workspaceRoot).toBe(path.join(home, "sandbox-root"));
        expect(cfg.channels?.whatsapp?.accounts?.personal?.authDir).toBe(
          path.join(home, ".opennexus", "credentials", "wa-personal"),
        );
      });
    });
  });

  describe("U6: gateway port resolution", () => {
    it("uses default when env and config are unset", () => {
      expect(resolveGatewayPort({}, envWith({ OPENNEXUS_GATEWAY_PORT: undefined }))).toBe(
        DEFAULT_GATEWAY_PORT,
      );
    });

    it("prefers OPENNEXUS_GATEWAY_PORT over config", () => {
      expect(
        resolveGatewayPort(
          { gateway: { port: 19002 } },
          envWith({ OPENNEXUS_GATEWAY_PORT: "19001" }),
        ),
      ).toBe(19001);
    });

    it("falls back to config when env is invalid", () => {
      expect(
        resolveGatewayPort(
          { gateway: { port: 19003 } },
          envWith({ OPENNEXUS_GATEWAY_PORT: "nope" }),
        ),
      ).toBe(19003);
    });
  });

  describe("U9: telegram.tokenFile schema validation", () => {
    it("accepts config with only botToken", async () => {
      await withLoadedConfigForHome(
        {
          channels: { telegram: { botToken: "123:ABC" } },
        },
        async (cfg) => {
          expect(cfg.channels?.telegram?.botToken).toBe("123:ABC");
          expect(cfg.channels?.telegram?.tokenFile).toBeUndefined();
        },
      );
    });

    it("accepts config with only tokenFile", async () => {
      await withLoadedConfigForHome(
        {
          channels: { telegram: { tokenFile: "/run/agenix/telegram-token" } },
        },
        async (cfg) => {
          expect(cfg.channels?.telegram?.tokenFile).toBe("/run/agenix/telegram-token");
          expect(cfg.channels?.telegram?.botToken).toBeUndefined();
        },
      );
    });

    it("accepts config with both botToken and tokenFile", async () => {
      await withLoadedConfigForHome(
        {
          channels: {
            telegram: {
              botToken: "fallback:token",
              tokenFile: "/run/agenix/telegram-token",
            },
          },
        },
        async (cfg) => {
          expect(cfg.channels?.telegram?.botToken).toBe("fallback:token");
          expect(cfg.channels?.telegram?.tokenFile).toBe("/run/agenix/telegram-token");
        },
      );
    });
  });
});
