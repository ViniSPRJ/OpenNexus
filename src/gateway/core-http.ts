import type { IncomingMessage, ServerResponse } from "node:http";
import { createOpenNexusTools } from "../agents/opennexus-tools.js";
import {
  resolveEffectiveToolPolicy,
  resolveGroupToolPolicy,
  resolveSubagentToolPolicy,
} from "../agents/pi-tools.policy.js";
import {
  applyToolPolicyPipeline,
  buildDefaultToolPolicyPipelineSteps,
} from "../agents/tool-policy-pipeline.js";
import {
  collectExplicitAllowlist,
  mergeAlsoAllowPolicy,
  resolveToolProfilePolicy,
} from "../agents/tool-policy.js";
import { resolveChannelDefaultAccountId } from "../channels/plugins/helpers.js";
import { listChannelPlugins } from "../channels/plugins/index.js";
import { buildChannelAccountSnapshot } from "../channels/plugins/status.js";
import { loadConfig } from "../config/config.js";
import { resolveMainSessionKey } from "../config/sessions.js";
import { logWarn } from "../logger.js";
import { getPluginToolMeta } from "../plugins/tools.js";
import { isSubagentSessionKey } from "../routing/session-key.js";
import { DEFAULT_GATEWAY_HTTP_TOOL_DENY } from "../security/dangerous-tools.js";
import { normalizeMessageChannel } from "../utils/message-channel.js";
import type { AuthRateLimiter } from "./auth-rate-limit.js";
import { authorizeHttpGatewayConnect, type ResolvedGatewayAuth } from "./auth.js";
import {
  readJsonBodyOrError,
  sendGatewayAuthFailure,
  sendInvalidRequest,
  sendJson,
  sendMethodNotAllowed,
} from "./http-common.js";
import { getBearerToken, getHeader } from "./http-utils.js";

const DEFAULT_BODY_BYTES = 2 * 1024 * 1024;

type CoreBody = {
  args?: unknown;
  action?: unknown;
  sessionKey?: unknown;
};

type ChannelAccountSnapshotLite = {
  accountId?: string;
  configured?: boolean;
};

function resolveSessionKeyFromBody(body: CoreBody): string | undefined {
  if (typeof body.sessionKey === "string" && body.sessionKey.trim()) {
    return body.sessionKey.trim();
  }
  return undefined;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message || String(err);
  }
  if (typeof err === "string") {
    return err;
  }
  return String(err);
}

async function executeTool(params: {
  toolName: string;
  args: Record<string, unknown>;
  action?: string;
  req: IncomingMessage;
  res: ServerResponse;
  auth: ResolvedGatewayAuth;
  rateLimiter?: AuthRateLimiter;
}): Promise<boolean> {
  const { toolName, args, action, req, res, auth, rateLimiter } = params;
  const cfg = loadConfig();
  const token = getBearerToken(req);
  const authResult = await authorizeHttpGatewayConnect({
    auth,
    connectAuth: token ? { token, password: token } : null,
    req,
    trustedProxies: cfg.gateway?.trustedProxies,
    allowRealIpFallback: cfg.gateway?.allowRealIpFallback,
    rateLimiter,
  });
  if (!authResult.ok) {
    sendGatewayAuthFailure(res, authResult);
    return true;
  }

  const messageChannel = normalizeMessageChannel(
    getHeader(req, "x-opennexus-message-channel") ?? "",
  );
  const accountId = getHeader(req, "x-opennexus-account-id")?.trim() || undefined;

  const argsSessionKey =
    typeof args.sessionKey === "string" && args.sessionKey.trim()
      ? args.sessionKey.trim()
      : undefined;
  const rawSessionKey = resolveSessionKeyFromBody({ sessionKey: argsSessionKey });
  const sessionKey =
    !rawSessionKey || rawSessionKey === "main" ? resolveMainSessionKey(cfg) : rawSessionKey;

  const {
    agentId,
    globalPolicy,
    globalProviderPolicy,
    agentPolicy,
    agentProviderPolicy,
    profile,
    providerProfile,
    profileAlsoAllow,
    providerProfileAlsoAllow,
  } = resolveEffectiveToolPolicy({ config: cfg, sessionKey });

  const profilePolicy = resolveToolProfilePolicy(profile);
  const providerProfilePolicy = resolveToolProfilePolicy(providerProfile);
  const profilePolicyWithAlsoAllow = mergeAlsoAllowPolicy(profilePolicy, profileAlsoAllow);
  const providerProfilePolicyWithAlsoAllow = mergeAlsoAllowPolicy(
    providerProfilePolicy,
    providerProfileAlsoAllow,
  );
  const groupPolicy = resolveGroupToolPolicy({
    config: cfg,
    sessionKey,
    messageProvider: messageChannel ?? undefined,
    accountId: accountId ?? null,
  });
  const subagentPolicy = isSubagentSessionKey(sessionKey)
    ? resolveSubagentToolPolicy(cfg)
    : undefined;

  const allTools = createOpenNexusTools({
    agentSessionKey: sessionKey,
    agentChannel: messageChannel ?? undefined,
    agentAccountId: accountId,
    config: cfg,
    pluginToolAllowlist: collectExplicitAllowlist([
      profilePolicy,
      providerProfilePolicy,
      globalPolicy,
      globalProviderPolicy,
      agentPolicy,
      agentProviderPolicy,
      groupPolicy,
      subagentPolicy,
    ]),
  });

  const subagentFiltered = applyToolPolicyPipeline({
    // oxlint-disable-next-line typescript/no-explicit-any
    tools: allTools as any,
    // oxlint-disable-next-line typescript/no-explicit-any
    toolMeta: (tool) => getPluginToolMeta(tool as any),
    warn: logWarn,
    steps: [
      ...buildDefaultToolPolicyPipelineSteps({
        profilePolicy: profilePolicyWithAlsoAllow,
        profile,
        providerProfilePolicy: providerProfilePolicyWithAlsoAllow,
        providerProfile,
        globalPolicy,
        globalProviderPolicy,
        agentPolicy,
        agentProviderPolicy,
        groupPolicy,
        agentId,
      }),
      { policy: subagentPolicy, label: "subagent tools.allow" },
    ],
  });

  const gatewayToolsCfg = cfg.gateway?.tools;
  const defaultGatewayDeny: string[] = DEFAULT_GATEWAY_HTTP_TOOL_DENY.filter(
    (name) => !gatewayToolsCfg?.allow?.includes(name),
  );
  const gatewayDenyNames = defaultGatewayDeny.concat(
    Array.isArray(gatewayToolsCfg?.deny) ? gatewayToolsCfg.deny : [],
  );
  const gatewayDenySet = new Set(gatewayDenyNames);
  const gatewayFiltered = subagentFiltered.filter((t) => !gatewayDenySet.has(t.name));

  const tool = gatewayFiltered.find((t) => t.name === toolName);
  if (!tool) {
    sendJson(res, 404, {
      ok: false,
      error: { type: "not_found", message: `Tool not available: ${toolName}` },
    });
    return true;
  }

  try {
    const toolArgs = action ? { ...args, action } : args;
    // oxlint-disable-next-line typescript/no-explicit-any
    const result = await (tool as any).execute?.(`core-http-${Date.now()}`, toolArgs);
    sendJson(res, 200, { ok: true, result });
  } catch (err) {
    logWarn(`core-http: tool execution failed: ${String(err)}`);
    sendJson(res, 500, {
      ok: false,
      error: { type: "tool_error", message: getErrorMessage(err) || "tool execution failed" },
    });
  }

  return true;
}

async function buildChannelsStatus() {
  const cfg = loadConfig();
  const plugins = listChannelPlugins();
  const channels: Record<string, unknown> = {};
  const channelAccounts: Record<string, unknown> = {};
  const channelDefaultAccountId: Record<string, unknown> = {};

  for (const plugin of plugins) {
    const accountIds = plugin.config.listAccountIds(cfg);
    const defaultAccountId = resolveChannelDefaultAccountId({
      plugin,
      cfg,
      accountIds,
    });
    const accounts: unknown[] = [];
    for (const accountId of accountIds) {
      const account = plugin.config.resolveAccount(cfg, accountId);
      const enabled = plugin.config.isEnabled
        ? plugin.config.isEnabled(account, cfg)
        : !(
            account &&
            typeof account === "object" &&
            (account as { enabled?: boolean }).enabled === false
          );
      let configured = true;
      if (plugin.config.isConfigured) {
        configured = await plugin.config.isConfigured(account, cfg);
      }
      const snapshot = await buildChannelAccountSnapshot({
        plugin,
        cfg,
        accountId,
        runtime: undefined,
        probe: undefined,
        audit: undefined,
      });
      accounts.push({
        ...snapshot,
        enabled,
        configured,
      });
    }
    const defaultAccount = accounts.find((entry): entry is ChannelAccountSnapshotLite => {
      return (
        !!entry &&
        typeof entry === "object" &&
        "accountId" in entry &&
        typeof (entry as ChannelAccountSnapshotLite).accountId === "string" &&
        (entry as ChannelAccountSnapshotLite).accountId === defaultAccountId
      );
    });
    const summary = plugin.status?.buildChannelSummary
      ? await plugin.status.buildChannelSummary({
          account: plugin.config.resolveAccount(cfg, defaultAccountId),
          cfg,
          defaultAccountId,
          snapshot:
            defaultAccount ?? ({ accountId: defaultAccountId } as ChannelAccountSnapshotLite),
        })
      : {
          configured: defaultAccount?.configured ?? false,
        };

    channels[plugin.id] = summary;
    channelAccounts[plugin.id] = accounts;
    channelDefaultAccountId[plugin.id] = defaultAccountId;
  }

  return {
    ts: Date.now(),
    channels,
    channelAccounts,
    channelDefaultAccountId,
  };
}

export async function handleCoreHttpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  opts: {
    auth: ResolvedGatewayAuth;
    maxBodyBytes?: number;
    rateLimiter?: AuthRateLimiter;
  },
): Promise<boolean> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  if (!url.pathname.startsWith("/core")) {
    return false;
  }

  if (req.method !== "POST") {
    sendMethodNotAllowed(res, "POST");
    return true;
  }

  const bodyUnknown = await readJsonBodyOrError(req, res, opts.maxBodyBytes ?? DEFAULT_BODY_BYTES);
  if (bodyUnknown === undefined) {
    return true;
  }
  const body = (bodyUnknown ?? {}) as CoreBody;
  const argsRaw = body.args;
  const args =
    argsRaw && typeof argsRaw === "object" && !Array.isArray(argsRaw)
      ? (argsRaw as Record<string, unknown>)
      : {};

  if (url.pathname === "/core/exec") {
    return executeTool({
      toolName: "exec",
      args,
      action: typeof body.action === "string" ? body.action : undefined,
      req,
      res,
      auth: opts.auth,
      rateLimiter: opts.rateLimiter,
    });
  }

  if (url.pathname === "/core/memory/write") {
    return executeTool({
      toolName: "memory_write",
      args,
      action: undefined,
      req,
      res,
      auth: opts.auth,
      rateLimiter: opts.rateLimiter,
    });
  }

  if (url.pathname === "/core/memory/search") {
    return executeTool({
      toolName: "memory_search",
      args,
      action: undefined,
      req,
      res,
      auth: opts.auth,
      rateLimiter: opts.rateLimiter,
    });
  }

  if (url.pathname === "/core/memory/compact") {
    return executeTool({
      toolName: "memory_compact",
      args,
      action: undefined,
      req,
      res,
      auth: opts.auth,
      rateLimiter: opts.rateLimiter,
    });
  }

  if (url.pathname === "/core/browser") {
    return executeTool({
      toolName: "browser",
      args,
      action: typeof body.action === "string" ? body.action : undefined,
      req,
      res,
      auth: opts.auth,
      rateLimiter: opts.rateLimiter,
    });
  }

  if (url.pathname === "/core/canvas") {
    return executeTool({
      toolName: "canvas",
      args,
      action: typeof body.action === "string" ? body.action : undefined,
      req,
      res,
      auth: opts.auth,
      rateLimiter: opts.rateLimiter,
    });
  }

  if (url.pathname === "/core/channels/status") {
    const payload = await buildChannelsStatus();
    sendJson(res, 200, { ok: true, result: payload });
    return true;
  }

  sendInvalidRequest(res, "unknown core endpoint");
  return true;
}
