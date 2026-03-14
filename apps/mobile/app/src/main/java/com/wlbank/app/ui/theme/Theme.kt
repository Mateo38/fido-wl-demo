package com.wlbank.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = Violet600,
    onPrimary = White,
    primaryContainer = Violet700,
    onPrimaryContainer = White,
    secondary = Violet500,
    onSecondary = White,
    background = Slate950,
    onBackground = Slate200,
    surface = Slate900,
    onSurface = Slate200,
    surfaceVariant = Slate800,
    onSurfaceVariant = Slate400,
    outline = Slate700,
    error = Red400,
    onError = White,
    tertiary = Emerald400,
    onTertiary = Slate950
)

@Composable
fun WlBankTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
