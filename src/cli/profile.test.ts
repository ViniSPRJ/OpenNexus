import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "opennexus",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "opennexus", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "opennexus", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "opennexus", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "opennexus", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "opennexus", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "opennexus", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "opennexus", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "opennexus", "--profile", "work", "--dev", "status"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".opennexus-dev");
    expect(env.OPENNEXUS_PROFILE).toBe("dev");
    expect(env.OPENNEXUS_STATE_DIR).toBe(expectedStateDir);
    expect(env.OPENNEXUS_CONFIG_PATH).toBe(path.join(expectedStateDir, "opennexus.json"));
    expect(env.OPENNEXUS_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      OPENNEXUS_STATE_DIR: "/custom",
      OPENNEXUS_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.OPENNEXUS_STATE_DIR).toBe("/custom");
    expect(env.OPENNEXUS_GATEWAY_PORT).toBe("19099");
    expect(env.OPENNEXUS_CONFIG_PATH).toBe(path.join("/custom", "opennexus.json"));
  });

  it("uses OPENNEXUS_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      OPENNEXUS_HOME: "/srv/opennexus-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/opennexus-home");
    expect(env.OPENNEXUS_STATE_DIR).toBe(path.join(resolvedHome, ".opennexus-work"));
    expect(env.OPENNEXUS_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".opennexus-work", "opennexus.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "opennexus doctor --fix",
      env: {},
      expected: "opennexus doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "opennexus doctor --fix",
      env: { OPENNEXUS_PROFILE: "default" },
      expected: "opennexus doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "opennexus doctor --fix",
      env: { OPENNEXUS_PROFILE: "Default" },
      expected: "opennexus doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "opennexus doctor --fix",
      env: { OPENNEXUS_PROFILE: "bad profile" },
      expected: "opennexus doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "opennexus --profile work doctor --fix",
      env: { OPENNEXUS_PROFILE: "work" },
      expected: "opennexus --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "opennexus --dev doctor",
      env: { OPENNEXUS_PROFILE: "dev" },
      expected: "opennexus --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("opennexus doctor --fix", { OPENNEXUS_PROFILE: "work" })).toBe(
      "opennexus --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("opennexus doctor --fix", { OPENNEXUS_PROFILE: "  jbopennexus  " })).toBe(
      "opennexus --profile jbopennexus doctor --fix",
    );
  });

  it("handles command with no args after opennexus", () => {
    expect(formatCliCommand("opennexus", { OPENNEXUS_PROFILE: "test" })).toBe(
      "opennexus --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm opennexus doctor", { OPENNEXUS_PROFILE: "work" })).toBe(
      "pnpm opennexus --profile work doctor",
    );
  });
});
