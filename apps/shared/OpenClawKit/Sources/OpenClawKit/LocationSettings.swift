import Foundation

public enum OpenNexusLocationMode: String, Codable, Sendable, CaseIterable {
    case off
    case whileUsing
    case always
}
