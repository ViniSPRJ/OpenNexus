package ai.opennexus.android.node

import android.os.Build
import ai.opennexus.android.BuildConfig
import ai.opennexus.android.SecurePrefs
import ai.opennexus.android.gateway.GatewayClientInfo
import ai.opennexus.android.gateway.GatewayConnectOptions
import ai.opennexus.android.gateway.GatewayEndpoint
import ai.opennexus.android.gateway.GatewayTlsParams
import ai.opennexus.android.protocol.OpenNexusCanvasA2UICommand
import ai.opennexus.android.protocol.OpenNexusCanvasCommand
import ai.opennexus.android.protocol.OpenNexusCameraCommand
import ai.opennexus.android.protocol.OpenNexusLocationCommand
import ai.opennexus.android.protocol.OpenNexusScreenCommand
import ai.opennexus.android.protocol.OpenNexusSmsCommand
import ai.opennexus.android.protocol.OpenNexusCapability
import ai.opennexus.android.LocationMode
import ai.opennexus.android.VoiceWakeMode

class ConnectionManager(
  private val prefs: SecurePrefs,
  private val cameraEnabled: () -> Boolean,
  private val locationMode: () -> LocationMode,
  private val voiceWakeMode: () -> VoiceWakeMode,
  private val smsAvailable: () -> Boolean,
  private val hasRecordAudioPermission: () -> Boolean,
  private val manualTls: () -> Boolean,
) {
  companion object {
    internal fun resolveTlsParamsForEndpoint(
      endpoint: GatewayEndpoint,
      storedFingerprint: String?,
      manualTlsEnabled: Boolean,
    ): GatewayTlsParams? {
      val stableId = endpoint.stableId
      val stored = storedFingerprint?.trim().takeIf { !it.isNullOrEmpty() }
      val isManual = stableId.startsWith("manual|")

      if (isManual) {
        if (!manualTlsEnabled) return null
        if (!stored.isNullOrBlank()) {
          return GatewayTlsParams(
            required = true,
            expectedFingerprint = stored,
            allowTOFU = false,
            stableId = stableId,
          )
        }
        return GatewayTlsParams(
          required = true,
          expectedFingerprint = null,
          allowTOFU = false,
          stableId = stableId,
        )
      }

      // Prefer stored pins. Never let discovery-provided TXT override a stored fingerprint.
      if (!stored.isNullOrBlank()) {
        return GatewayTlsParams(
          required = true,
          expectedFingerprint = stored,
          allowTOFU = false,
          stableId = stableId,
        )
      }

      val hinted = endpoint.tlsEnabled || !endpoint.tlsFingerprintSha256.isNullOrBlank()
      if (hinted) {
        // TXT is unauthenticated. Do not treat the advertised fingerprint as authoritative.
        return GatewayTlsParams(
          required = true,
          expectedFingerprint = null,
          allowTOFU = false,
          stableId = stableId,
        )
      }

      return null
    }
  }

  fun buildInvokeCommands(): List<String> =
    buildList {
      add(OpenNexusCanvasCommand.Present.rawValue)
      add(OpenNexusCanvasCommand.Hide.rawValue)
      add(OpenNexusCanvasCommand.Navigate.rawValue)
      add(OpenNexusCanvasCommand.Eval.rawValue)
      add(OpenNexusCanvasCommand.Snapshot.rawValue)
      add(OpenNexusCanvasA2UICommand.Push.rawValue)
      add(OpenNexusCanvasA2UICommand.PushJSONL.rawValue)
      add(OpenNexusCanvasA2UICommand.Reset.rawValue)
      add(OpenNexusScreenCommand.Record.rawValue)
      if (cameraEnabled()) {
        add(OpenNexusCameraCommand.Snap.rawValue)
        add(OpenNexusCameraCommand.Clip.rawValue)
      }
      if (locationMode() != LocationMode.Off) {
        add(OpenNexusLocationCommand.Get.rawValue)
      }
      if (smsAvailable()) {
        add(OpenNexusSmsCommand.Send.rawValue)
      }
      if (BuildConfig.DEBUG) {
        add("debug.logs")
        add("debug.ed25519")
      }
      add("app.update")
    }

  fun buildCapabilities(): List<String> =
    buildList {
      add(OpenNexusCapability.Canvas.rawValue)
      add(OpenNexusCapability.Screen.rawValue)
      if (cameraEnabled()) add(OpenNexusCapability.Camera.rawValue)
      if (smsAvailable()) add(OpenNexusCapability.Sms.rawValue)
      if (voiceWakeMode() != VoiceWakeMode.Off && hasRecordAudioPermission()) {
        add(OpenNexusCapability.VoiceWake.rawValue)
      }
      if (locationMode() != LocationMode.Off) {
        add(OpenNexusCapability.Location.rawValue)
      }
    }

  fun resolvedVersionName(): String {
    val versionName = BuildConfig.VERSION_NAME.trim().ifEmpty { "dev" }
    return if (BuildConfig.DEBUG && !versionName.contains("dev", ignoreCase = true)) {
      "$versionName-dev"
    } else {
      versionName
    }
  }

  fun resolveModelIdentifier(): String? {
    return listOfNotNull(Build.MANUFACTURER, Build.MODEL)
      .joinToString(" ")
      .trim()
      .ifEmpty { null }
  }

  fun buildUserAgent(): String {
    val version = resolvedVersionName()
    val release = Build.VERSION.RELEASE?.trim().orEmpty()
    val releaseLabel = if (release.isEmpty()) "unknown" else release
    return "OpenNexusAndroid/$version (Android $releaseLabel; SDK ${Build.VERSION.SDK_INT})"
  }

  fun buildClientInfo(clientId: String, clientMode: String): GatewayClientInfo {
    return GatewayClientInfo(
      id = clientId,
      displayName = prefs.displayName.value,
      version = resolvedVersionName(),
      platform = "android",
      mode = clientMode,
      instanceId = prefs.instanceId.value,
      deviceFamily = "Android",
      modelIdentifier = resolveModelIdentifier(),
    )
  }

  fun buildNodeConnectOptions(): GatewayConnectOptions {
    return GatewayConnectOptions(
      role = "node",
      scopes = emptyList(),
      caps = buildCapabilities(),
      commands = buildInvokeCommands(),
      permissions = emptyMap(),
      client = buildClientInfo(clientId = "opennexus-android", clientMode = "node"),
      userAgent = buildUserAgent(),
    )
  }

  fun buildOperatorConnectOptions(): GatewayConnectOptions {
    return GatewayConnectOptions(
      role = "operator",
      scopes = listOf("operator.read", "operator.write", "operator.talk.secrets"),
      caps = emptyList(),
      commands = emptyList(),
      permissions = emptyMap(),
      client = buildClientInfo(clientId = "opennexus-control-ui", clientMode = "ui"),
      userAgent = buildUserAgent(),
    )
  }

  fun resolveTlsParams(endpoint: GatewayEndpoint): GatewayTlsParams? {
    val stored = prefs.loadGatewayTlsFingerprint(endpoint.stableId)
    return resolveTlsParamsForEndpoint(endpoint, storedFingerprint = stored, manualTlsEnabled = manualTls())
  }
}
