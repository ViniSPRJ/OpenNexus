import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#opennexus",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#opennexus",
      rawTarget: "#opennexus",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "opennexus-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "opennexus-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "opennexus-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "opennexus-bot",
      rawTarget: "opennexus-bot",
    });
  });
});
