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
import com.wlbank.app.R
import com.wlbank.app.ui.common.WlButton
import com.wlbank.app.ui.theme.Violet600

@Composable
fun PasskeyPromptScreen(
    onComplete: () -> Unit
) {
    var isRegistering by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            Icons.Default.Fingerprint,
            contentDescription = null,
            tint = Violet600,
            modifier = Modifier.size(64.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = stringResource(R.string.login_passkey_title),
            style = MaterialTheme.typography.headlineMedium,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = stringResource(R.string.login_passkey_description),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(32.dp))

        WlButton(
            text = if (isRegistering) stringResource(R.string.login_registering)
                   else stringResource(R.string.login_register_passkey),
            onClick = {
                // Passkey registration will be handled via CredentialManager
                // For now, skip to dashboard
                onComplete()
            },
            loading = isRegistering
        )

        Spacer(modifier = Modifier.height(12.dp))

        TextButton(onClick = onComplete) {
            Text(stringResource(R.string.login_later))
        }
    }
}
