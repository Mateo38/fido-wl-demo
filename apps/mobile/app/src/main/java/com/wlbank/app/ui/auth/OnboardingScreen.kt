package com.wlbank.app.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
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
import com.wlbank.app.ui.theme.Emerald400

@Composable
fun OnboardingScreen(
    onBackToLogin: () -> Unit,
    viewModel: OnboardingViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        if (uiState.isSuccess) {
            // Success state
            Icon(
                Icons.Default.CheckCircle,
                contentDescription = null,
                tint = Emerald400,
                modifier = Modifier.size(64.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = stringResource(R.string.onboarding_success_title),
                style = MaterialTheme.typography.headlineMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = stringResource(R.string.onboarding_success_message),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = stringResource(R.string.onboarding_download_app),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(24.dp))
            WlButton(
                text = stringResource(R.string.onboarding_back_to_login),
                onClick = onBackToLogin
            )
        } else {
            // Form
            Text(
                text = stringResource(R.string.onboarding_title),
                style = MaterialTheme.typography.headlineMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = stringResource(R.string.onboarding_subtitle),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(24.dp))

            if (uiState.error != null) {
                ErrorBanner(uiState.error!!)
                Spacer(modifier = Modifier.height(16.dp))
            }

            WlTextField(
                value = uiState.firstName,
                onValueChange = viewModel::updateFirstName,
                label = stringResource(R.string.onboarding_first_name)
            )
            Spacer(modifier = Modifier.height(12.dp))
            WlTextField(
                value = uiState.lastName,
                onValueChange = viewModel::updateLastName,
                label = stringResource(R.string.onboarding_last_name)
            )
            Spacer(modifier = Modifier.height(12.dp))
            WlTextField(
                value = uiState.email,
                onValueChange = viewModel::updateEmail,
                label = stringResource(R.string.onboarding_email)
            )
            Spacer(modifier = Modifier.height(20.dp))
            WlButton(
                text = stringResource(R.string.onboarding_continue),
                onClick = viewModel::register,
                loading = uiState.isLoading,
                enabled = uiState.firstName.isNotBlank() && uiState.lastName.isNotBlank() && uiState.email.isNotBlank()
            )
            Spacer(modifier = Modifier.height(16.dp))
            TextButton(onClick = onBackToLogin) {
                Text(stringResource(R.string.onboarding_back_to_login))
            }
        }
    }
}
