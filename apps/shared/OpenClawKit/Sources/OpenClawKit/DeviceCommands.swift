import Foundation

public enum OpenNexusDeviceCommand: String, Codable, Sendable {
    case status = "device.status"
    case info = "device.info"
}

public enum OpenNexusBatteryState: String, Codable, Sendable {
    case unknown
    case unplugged
    case charging
    case full
}

public enum OpenNexusThermalState: String, Codable, Sendable {
    case nominal
    case fair
    case serious
    case critical
}

public enum OpenNexusNetworkPathStatus: String, Codable, Sendable {
    case satisfied
    case unsatisfied
    case requiresConnection
}

public enum OpenNexusNetworkInterfaceType: String, Codable, Sendable {
    case wifi
    case cellular
    case wired
    case other
}

public struct OpenNexusBatteryStatusPayload: Codable, Sendable, Equatable {
    public var level: Double?
    public var state: OpenNexusBatteryState
    public var lowPowerModeEnabled: Bool

    public init(level: Double?, state: OpenNexusBatteryState, lowPowerModeEnabled: Bool) {
        self.level = level
        self.state = state
        self.lowPowerModeEnabled = lowPowerModeEnabled
    }
}

public struct OpenNexusThermalStatusPayload: Codable, Sendable, Equatable {
    public var state: OpenNexusThermalState

    public init(state: OpenNexusThermalState) {
        self.state = state
    }
}

public struct OpenNexusStorageStatusPayload: Codable, Sendable, Equatable {
    public var totalBytes: Int64
    public var freeBytes: Int64
    public var usedBytes: Int64

    public init(totalBytes: Int64, freeBytes: Int64, usedBytes: Int64) {
        self.totalBytes = totalBytes
        self.freeBytes = freeBytes
        self.usedBytes = usedBytes
    }
}

public struct OpenNexusNetworkStatusPayload: Codable, Sendable, Equatable {
    public var status: OpenNexusNetworkPathStatus
    public var isExpensive: Bool
    public var isConstrained: Bool
    public var interfaces: [OpenNexusNetworkInterfaceType]

    public init(
        status: OpenNexusNetworkPathStatus,
        isExpensive: Bool,
        isConstrained: Bool,
        interfaces: [OpenNexusNetworkInterfaceType])
    {
        self.status = status
        self.isExpensive = isExpensive
        self.isConstrained = isConstrained
        self.interfaces = interfaces
    }
}

public struct OpenNexusDeviceStatusPayload: Codable, Sendable, Equatable {
    public var battery: OpenNexusBatteryStatusPayload
    public var thermal: OpenNexusThermalStatusPayload
    public var storage: OpenNexusStorageStatusPayload
    public var network: OpenNexusNetworkStatusPayload
    public var uptimeSeconds: Double

    public init(
        battery: OpenNexusBatteryStatusPayload,
        thermal: OpenNexusThermalStatusPayload,
        storage: OpenNexusStorageStatusPayload,
        network: OpenNexusNetworkStatusPayload,
        uptimeSeconds: Double)
    {
        self.battery = battery
        self.thermal = thermal
        self.storage = storage
        self.network = network
        self.uptimeSeconds = uptimeSeconds
    }
}

public struct OpenNexusDeviceInfoPayload: Codable, Sendable, Equatable {
    public var deviceName: String
    public var modelIdentifier: String
    public var systemName: String
    public var systemVersion: String
    public var appVersion: String
    public var appBuild: String
    public var locale: String

    public init(
        deviceName: String,
        modelIdentifier: String,
        systemName: String,
        systemVersion: String,
        appVersion: String,
        appBuild: String,
        locale: String)
    {
        self.deviceName = deviceName
        self.modelIdentifier = modelIdentifier
        self.systemName = systemName
        self.systemVersion = systemVersion
        self.appVersion = appVersion
        self.appBuild = appBuild
        self.locale = locale
    }
}
