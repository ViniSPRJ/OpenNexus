import { vi } from "vitest";
import { installChromeUserDataDirHooks } from "./chrome-user-data-dir.test-harness.js";

const chromeUserDataDir = { dir: "/tmp/opennexus" };
installChromeUserDataDirHooks(chromeUserDataDir);

vi.mock("./chrome.js", () => ({
  isChromeCdpReady: vi.fn(async () => true),
  isChromeReachable: vi.fn(async () => true),
  launchOpenNexusChrome: vi.fn(async () => {
    throw new Error("unexpected launch");
  }),
  resolveOpenNexusUserDataDir: vi.fn(() => chromeUserDataDir.dir),
  stopOpenNexusChrome: vi.fn(async () => {}),
}));
