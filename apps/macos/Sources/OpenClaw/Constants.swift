import Foundation

// Stable identifier used for both the macOS LaunchAgent label and Nix-managed defaults suite.
// nix-opennexus writes app defaults into this suite to survive app bundle identifier churn.
let launchdLabel = "ai.opennexus.mac"
let gatewayLaunchdLabel = "ai.opennexus.gateway"
let onboardingVersionKey = "opennexus.onboardingVersion"
let onboardingSeenKey = "opennexus.onboardingSeen"
let currentOnboardingVersion = 7
let pauseDefaultsKey = "opennexus.pauseEnabled"
let iconAnimationsEnabledKey = "opennexus.iconAnimationsEnabled"
let swabbleEnabledKey = "opennexus.swabbleEnabled"
let swabbleTriggersKey = "opennexus.swabbleTriggers"
let voiceWakeTriggerChimeKey = "opennexus.voiceWakeTriggerChime"
let voiceWakeSendChimeKey = "opennexus.voiceWakeSendChime"
let showDockIconKey = "opennexus.showDockIcon"
let defaultVoiceWakeTriggers = ["opennexus"]
let voiceWakeMaxWords = 32
let voiceWakeMaxWordLength = 64
let voiceWakeMicKey = "opennexus.voiceWakeMicID"
let voiceWakeMicNameKey = "opennexus.voiceWakeMicName"
let voiceWakeLocaleKey = "opennexus.voiceWakeLocaleID"
let voiceWakeAdditionalLocalesKey = "opennexus.voiceWakeAdditionalLocaleIDs"
let voicePushToTalkEnabledKey = "opennexus.voicePushToTalkEnabled"
let talkEnabledKey = "opennexus.talkEnabled"
let iconOverrideKey = "opennexus.iconOverride"
let connectionModeKey = "opennexus.connectionMode"
let remoteTargetKey = "opennexus.remoteTarget"
let remoteIdentityKey = "opennexus.remoteIdentity"
let remoteProjectRootKey = "opennexus.remoteProjectRoot"
let remoteCliPathKey = "opennexus.remoteCliPath"
let canvasEnabledKey = "opennexus.canvasEnabled"
let cameraEnabledKey = "opennexus.cameraEnabled"
let systemRunPolicyKey = "opennexus.systemRunPolicy"
let systemRunAllowlistKey = "opennexus.systemRunAllowlist"
let systemRunEnabledKey = "opennexus.systemRunEnabled"
let locationModeKey = "opennexus.locationMode"
let locationPreciseKey = "opennexus.locationPreciseEnabled"
let peekabooBridgeEnabledKey = "opennexus.peekabooBridgeEnabled"
let deepLinkKeyKey = "opennexus.deepLinkKey"
let modelCatalogPathKey = "opennexus.modelCatalogPath"
let modelCatalogReloadKey = "opennexus.modelCatalogReload"
let cliInstallPromptedVersionKey = "opennexus.cliInstallPromptedVersion"
let heartbeatsEnabledKey = "opennexus.heartbeatsEnabled"
let debugPaneEnabledKey = "opennexus.debugPaneEnabled"
let debugFileLogEnabledKey = "opennexus.debug.fileLogEnabled"
let appLogLevelKey = "opennexus.debug.appLogLevel"
let voiceWakeSupported: Bool = ProcessInfo.processInfo.operatingSystemVersion.majorVersion >= 26
