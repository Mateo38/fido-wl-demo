package com.wlbank.app.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.wlbank.app.ui.auth.*
import com.wlbank.app.ui.cards.CardsScreen
import com.wlbank.app.ui.dashboard.DashboardScreen
import com.wlbank.app.ui.settings.SettingsScreen
import com.wlbank.app.ui.transactions.TransactionsScreen
import com.wlbank.app.ui.transfers.TransfersScreen

@Composable
fun AppNavGraph() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val authRoutes = listOf(
        Screen.Login.route,
        Screen.Onboarding.route,
        Screen.ChangePassword.route,
        Screen.PasskeyPrompt.route
    )
    val showBottomBar = currentRoute !in authRoutes

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                BottomNavBar(navController)
            }
        },
        containerColor = androidx.compose.material3.MaterialTheme.colorScheme.background
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = Screen.Login.route,
            modifier = Modifier.padding(paddingValues)
        ) {
            composable(Screen.Login.route) {
                LoginScreen(
                    onLoginSuccess = { mustChangePassword ->
                        if (mustChangePassword) {
                            navController.navigate(Screen.ChangePassword.route) {
                                popUpTo(Screen.Login.route) { inclusive = true }
                            }
                        } else {
                            navController.navigate(Screen.PasskeyPrompt.route) {
                                popUpTo(Screen.Login.route) { inclusive = true }
                            }
                        }
                    },
                    onNavigateToOnboarding = {
                        navController.navigate(Screen.Onboarding.route)
                    },
                    onPasskeyLoginSuccess = {
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    }
                )
            }
            composable(Screen.Onboarding.route) {
                OnboardingScreen(
                    onBackToLogin = {
                        navController.popBackStack()
                    }
                )
            }
            composable(Screen.ChangePassword.route) {
                ChangePasswordScreen(
                    onPasswordChanged = {
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.ChangePassword.route) { inclusive = true }
                        }
                    }
                )
            }
            composable(Screen.PasskeyPrompt.route) {
                PasskeyPromptScreen(
                    onComplete = {
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.PasskeyPrompt.route) { inclusive = true }
                        }
                    }
                )
            }
            composable(Screen.Dashboard.route) {
                DashboardScreen()
            }
            composable(Screen.Transactions.route) {
                TransactionsScreen()
            }
            composable(Screen.Cards.route) {
                CardsScreen()
            }
            composable(Screen.Transfers.route) {
                TransfersScreen()
            }
            composable(Screen.Settings.route) {
                SettingsScreen(
                    onLogout = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}
