package com.wlbank.app.ui.navigation

sealed class Screen(val route: String) {
    data object Login : Screen("login")
    data object Onboarding : Screen("onboarding")
    data object ChangePassword : Screen("change_password")
    data object PasskeyPrompt : Screen("passkey_prompt")
    data object Dashboard : Screen("dashboard")
    data object Transactions : Screen("transactions")
    data object Cards : Screen("cards")
    data object Transfers : Screen("transfers")
    data object Settings : Screen("settings")
}
