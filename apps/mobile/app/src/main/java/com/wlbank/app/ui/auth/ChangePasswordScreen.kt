package com.wlbank.app.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
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

@Composable
fun ChangePasswordScreen(
    onPasswordChanged: () -> Unit,
    viewModel: ChangePasswordViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            Icons.Default.Lock,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(48.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = stringResource(R.string.change_password_title),
            style = MaterialTheme.typography.headlineMedium,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = stringResource(R.string.change_password_description),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(24.dp))

        if (uiState.error != null) {
            val errorMessage = when (uiState.error) {
                "MIN_LENGTH" -> stringResource(R.string.change_password_min_length)
                "MISMATCH" -> stringResource(R.string.change_password_mismatch)
                else -> uiState.error!!
            }
            ErrorBanner(errorMessage)
            Spacer(modifier = Modifier.height(16.dp))
        }

        WlTextField(
            value = uiState.newPassword,
            onValueChange = viewModel::updateNewPassword,
            label = stringResource(R.string.change_password_new_password),
            isPassword = true
        )
        Spacer(modifier = Modifier.height(12.dp))
        WlTextField(
            value = uiState.confirmPassword,
            onValueChange = viewModel::updateConfirmPassword,
            label = stringResource(R.string.change_password_confirm_password),
            isPassword = true
        )
        Spacer(modifier = Modifier.height(20.dp))
        WlButton(
            text = if (uiState.isLoading) stringResource(R.string.change_password_saving)
                   else stringResource(R.string.change_password_submit),
            onClick = { viewModel.changePassword(onPasswordChanged) },
            loading = uiState.isLoading,
            enabled = uiState.newPassword.isNotBlank() && uiState.confirmPassword.isNotBlank()
        )
    }
}
