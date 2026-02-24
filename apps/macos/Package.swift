// swift-tools-version: 6.2
// Package manifest for the OpenNexus macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "OpenNexus",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "OpenNexusIPC", targets: ["OpenNexusIPC"]),
        .library(name: "OpenNexusDiscovery", targets: ["OpenNexusDiscovery"]),
        .executable(name: "OpenNexus", targets: ["OpenNexus"]),
        .executable(name: "opennexus-mac", targets: ["OpenNexusMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.1.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.8.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.8.1"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/OpenNexusKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "OpenNexusIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "OpenNexusDiscovery",
            dependencies: [
                .product(name: "OpenNexusKit", package: "OpenNexusKit"),
            ],
            path: "Sources/OpenNexusDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "OpenNexus",
            dependencies: [
                "OpenNexusIPC",
                "OpenNexusDiscovery",
                .product(name: "OpenNexusKit", package: "OpenNexusKit"),
                .product(name: "OpenNexusChatUI", package: "OpenNexusKit"),
                .product(name: "OpenNexusProtocol", package: "OpenNexusKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/OpenNexus.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "OpenNexusMacCLI",
            dependencies: [
                "OpenNexusDiscovery",
                .product(name: "OpenNexusKit", package: "OpenNexusKit"),
                .product(name: "OpenNexusProtocol", package: "OpenNexusKit"),
            ],
            path: "Sources/OpenNexusMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "OpenNexusIPCTests",
            dependencies: [
                "OpenNexusIPC",
                "OpenNexus",
                "OpenNexusDiscovery",
                .product(name: "OpenNexusProtocol", package: "OpenNexusKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
