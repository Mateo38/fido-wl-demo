package com.wlbank.app.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.wlbank.app.R
import com.wlbank.app.ui.common.*
import com.wlbank.app.ui.theme.Violet600

@Composable
fun LoginScreen(
    onLoginSuccess: (mustChangePassword: Boolean) -> Unit,
    onNavigateToOnboarding: () -> Unit,
    onPasskeyLoginSuccess: () -> Unit,
    viewModel: LoginViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Logo
        Text(
            text = "WL Bank",
            style = MaterialTheme.typography.headlineLarge,
            color = Violet600
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = stringResource(R.string.login_connect_to_space),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Error
        if (uiState.error != null) {
            ErrorBanner(uiState.error!!)
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Email
        WlTextField(
            value = uiState.email,
            onValueChange = viewModel::updateEmail,
            label = stringResource(R.string.login_email)
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Password
        WlTextField(
            value = uiState.password,
            onValueChange = viewModel::updatePassword,
            label = stringResource(R.string.login_password),
            isPassword = true
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Login button
        WlButton(
            text = if (uiState.isLoading) stringResource(R.string.login_logging_in)
                   else stringResource(R.string.login_submit),
            onClick = { viewModel.login(onLoginSuccess) },
            loading = uiState.isLoading,
            enabled = uiState.email.isNotBlank() && uiState.password.isNotBlank()
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Divider
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            HorizontalDivider(modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.outline)
            Text(
                text = stringResource(R.string.login_or),
                modifier = Modifier.padding(horizontal = 16.dp),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                style = MaterialTheme.typography.bodySmall
            )
            HorizontalDivider(modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.outline)
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Passkey login
        OutlinedButton(
            onClick = { /* Passkey login handled via CredentialManager */ },
            modifier = Modifier.fillMaxWidth().height(50.dp),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = MaterialTheme.colorScheme.primary
            )
        ) {
            Icon(Icons.Default.Fingerprint, contentDescription = null, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                if (uiState.isPasskeyLoading) stringResource(R.string.login_verifying)
                else stringResource(R.string.login_passkey_login)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Open account
        Text(
            text = stringResource(R.string.login_no_account),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            style = MaterialTheme.typography.bodySmall
        )

        Spacer(modifier = Modifier.height(4.dp))

        TextButton(onClick = onNavigateToOnboarding) {
            Text(stringResource(R.string.login_open_account))
        }
    }
}
