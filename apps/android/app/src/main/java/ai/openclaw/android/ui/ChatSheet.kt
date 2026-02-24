package ai.opennexus.android.ui

import androidx.compose.runtime.Composable
import ai.opennexus.android.MainViewModel
import ai.opennexus.android.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
