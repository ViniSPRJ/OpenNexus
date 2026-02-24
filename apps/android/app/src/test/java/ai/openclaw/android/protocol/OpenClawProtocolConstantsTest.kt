package ai.opennexus.android.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class OpenNexusProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", OpenNexusCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", OpenNexusCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", OpenNexusCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", OpenNexusCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", OpenNexusCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", OpenNexusCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", OpenNexusCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", OpenNexusCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", OpenNexusCapability.Canvas.rawValue)
    assertEquals("camera", OpenNexusCapability.Camera.rawValue)
    assertEquals("screen", OpenNexusCapability.Screen.rawValue)
    assertEquals("voiceWake", OpenNexusCapability.VoiceWake.rawValue)
  }

  @Test
  fun screenCommandsUseStableStrings() {
    assertEquals("screen.record", OpenNexusScreenCommand.Record.rawValue)
  }
}
