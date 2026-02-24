import Foundation

public enum OpenNexusRemindersCommand: String, Codable, Sendable {
    case list = "reminders.list"
    case add = "reminders.add"
}

public enum OpenNexusReminderStatusFilter: String, Codable, Sendable {
    case incomplete
    case completed
    case all
}

public struct OpenNexusRemindersListParams: Codable, Sendable, Equatable {
    public var status: OpenNexusReminderStatusFilter?
    public var limit: Int?

    public init(status: OpenNexusReminderStatusFilter? = nil, limit: Int? = nil) {
        self.status = status
        self.limit = limit
    }
}

public struct OpenNexusRemindersAddParams: Codable, Sendable, Equatable {
    public var title: String
    public var dueISO: String?
    public var notes: String?
    public var listId: String?
    public var listName: String?

    public init(
        title: String,
        dueISO: String? = nil,
        notes: String? = nil,
        listId: String? = nil,
        listName: String? = nil)
    {
        self.title = title
        self.dueISO = dueISO
        self.notes = notes
        self.listId = listId
        self.listName = listName
    }
}

public struct OpenNexusReminderPayload: Codable, Sendable, Equatable {
    public var identifier: String
    public var title: String
    public var dueISO: String?
    public var completed: Bool
    public var listName: String?

    public init(
        identifier: String,
        title: String,
        dueISO: String? = nil,
        completed: Bool,
        listName: String? = nil)
    {
        self.identifier = identifier
        self.title = title
        self.dueISO = dueISO
        self.completed = completed
        self.listName = listName
    }
}

public struct OpenNexusRemindersListPayload: Codable, Sendable, Equatable {
    public var reminders: [OpenNexusReminderPayload]

    public init(reminders: [OpenNexusReminderPayload]) {
        self.reminders = reminders
    }
}

public struct OpenNexusRemindersAddPayload: Codable, Sendable, Equatable {
    public var reminder: OpenNexusReminderPayload

    public init(reminder: OpenNexusReminderPayload) {
        self.reminder = reminder
    }
}
