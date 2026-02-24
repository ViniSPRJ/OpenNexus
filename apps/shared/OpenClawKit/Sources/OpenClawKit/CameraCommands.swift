import Foundation

public enum OpenNexusCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum OpenNexusCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum OpenNexusCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum OpenNexusCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct OpenNexusCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: OpenNexusCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: OpenNexusCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: OpenNexusCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: OpenNexusCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct OpenNexusCameraClipParams: Codable, Sendable, Equatable {
    public var facing: OpenNexusCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: OpenNexusCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: OpenNexusCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: OpenNexusCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
