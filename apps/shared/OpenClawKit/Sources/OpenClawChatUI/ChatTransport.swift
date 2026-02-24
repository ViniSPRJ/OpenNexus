import Foundation

public enum OpenNexusChatTransportEvent: Sendable {
    case health(ok: Bool)
    case tick
    case chat(OpenNexusChatEventPayload)
    case agent(OpenNexusAgentEventPayload)
    case seqGap
}

public protocol OpenNexusChatTransport: Sendable {
    func requestHistory(sessionKey: String) async throws -> OpenNexusChatHistoryPayload
    func sendMessage(
        sessionKey: String,
        message: String,
        thinking: String,
        idempotencyKey: String,
        attachments: [OpenNexusChatAttachmentPayload]) async throws -> OpenNexusChatSendResponse

    func abortRun(sessionKey: String, runId: String) async throws
    func listSessions(limit: Int?) async throws -> OpenNexusChatSessionsListResponse

    func requestHealth(timeoutMs: Int) async throws -> Bool
    func events() -> AsyncStream<OpenNexusChatTransportEvent>

    func setActiveSessionKey(_ sessionKey: String) async throws
}

extension OpenNexusChatTransport {
    public func setActiveSessionKey(_: String) async throws {}

    public func abortRun(sessionKey _: String, runId _: String) async throws {
        throw NSError(
            domain: "OpenNexusChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "chat.abort not supported by this transport"])
    }

    public func listSessions(limit _: Int?) async throws -> OpenNexusChatSessionsListResponse {
        throw NSError(
            domain: "OpenNexusChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "sessions.list not supported by this transport"])
    }
}
