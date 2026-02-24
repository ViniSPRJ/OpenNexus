import CoreLocation
import Foundation
import OpenNexusKit
import UIKit

protocol CameraServicing: Sendable {
    func listDevices() async -> [CameraController.CameraDeviceInfo]
    func snap(params: OpenNexusCameraSnapParams) async throws -> (format: String, base64: String, width: Int, height: Int)
    func clip(params: OpenNexusCameraClipParams) async throws -> (format: String, base64: String, durationMs: Int, hasAudio: Bool)
}

protocol ScreenRecordingServicing: Sendable {
    func record(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> String
}

@MainActor
protocol LocationServicing: Sendable {
    func authorizationStatus() -> CLAuthorizationStatus
    func accuracyAuthorization() -> CLAccuracyAuthorization
    func ensureAuthorization(mode: OpenNexusLocationMode) async -> CLAuthorizationStatus
    func currentLocation(
        params: OpenNexusLocationGetParams,
        desiredAccuracy: OpenNexusLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
    func startLocationUpdates(
        desiredAccuracy: OpenNexusLocationAccuracy,
        significantChangesOnly: Bool) -> AsyncStream<CLLocation>
    func stopLocationUpdates()
    func startMonitoringSignificantLocationChanges(onUpdate: @escaping @Sendable (CLLocation) -> Void)
    func stopMonitoringSignificantLocationChanges()
}

protocol DeviceStatusServicing: Sendable {
    func status() async throws -> OpenNexusDeviceStatusPayload
    func info() -> OpenNexusDeviceInfoPayload
}

protocol PhotosServicing: Sendable {
    func latest(params: OpenNexusPhotosLatestParams) async throws -> OpenNexusPhotosLatestPayload
}

protocol ContactsServicing: Sendable {
    func search(params: OpenNexusContactsSearchParams) async throws -> OpenNexusContactsSearchPayload
    func add(params: OpenNexusContactsAddParams) async throws -> OpenNexusContactsAddPayload
}

protocol CalendarServicing: Sendable {
    func events(params: OpenNexusCalendarEventsParams) async throws -> OpenNexusCalendarEventsPayload
    func add(params: OpenNexusCalendarAddParams) async throws -> OpenNexusCalendarAddPayload
}

protocol RemindersServicing: Sendable {
    func list(params: OpenNexusRemindersListParams) async throws -> OpenNexusRemindersListPayload
    func add(params: OpenNexusRemindersAddParams) async throws -> OpenNexusRemindersAddPayload
}

protocol MotionServicing: Sendable {
    func activities(params: OpenNexusMotionActivityParams) async throws -> OpenNexusMotionActivityPayload
    func pedometer(params: OpenNexusPedometerParams) async throws -> OpenNexusPedometerPayload
}

struct WatchMessagingStatus: Sendable, Equatable {
    var supported: Bool
    var paired: Bool
    var appInstalled: Bool
    var reachable: Bool
    var activationState: String
}

struct WatchQuickReplyEvent: Sendable, Equatable {
    var replyId: String
    var promptId: String
    var actionId: String
    var actionLabel: String?
    var sessionKey: String?
    var note: String?
    var sentAtMs: Int?
    var transport: String
}

struct WatchNotificationSendResult: Sendable, Equatable {
    var deliveredImmediately: Bool
    var queuedForDelivery: Bool
    var transport: String
}

protocol WatchMessagingServicing: AnyObject, Sendable {
    func status() async -> WatchMessagingStatus
    func setReplyHandler(_ handler: (@Sendable (WatchQuickReplyEvent) -> Void)?)
    func sendNotification(
        id: String,
        params: OpenNexusWatchNotifyParams) async throws -> WatchNotificationSendResult
}

extension CameraController: CameraServicing {}
extension ScreenRecordService: ScreenRecordingServicing {}
extension LocationService: LocationServicing {}
