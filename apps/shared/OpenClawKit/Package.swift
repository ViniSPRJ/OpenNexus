// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "OpenNexusKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
    ],
    products: [
        .library(name: "OpenNexusProtocol", targets: ["OpenNexusProtocol"]),
        .library(name: "OpenNexusKit", targets: ["OpenNexusKit"]),
        .library(name: "OpenNexusChatUI", targets: ["OpenNexusChatUI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.0"),
        .package(url: "https://github.com/gonzalezreal/textual", exact: "0.3.1"),
    ],
    targets: [
        .target(
            name: "OpenNexusProtocol",
            path: "Sources/OpenNexusProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "OpenNexusKit",
            dependencies: [
                "OpenNexusProtocol",
                .product(name: "ElevenLabsKit", package: "ElevenLabsKit"),
            ],
            path: "Sources/OpenNexusKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "OpenNexusChatUI",
            dependencies: [
                "OpenNexusKit",
                .product(
                    name: "Textual",
                    package: "textual",
                    condition: .when(platforms: [.macOS, .iOS])),
            ],
            path: "Sources/OpenNexusChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "OpenNexusKitTests",
            dependencies: ["OpenNexusKit", "OpenNexusChatUI"],
            path: "Tests/OpenNexusKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
