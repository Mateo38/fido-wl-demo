package com.wlbank.app.ui.transfers

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.wlbank.app.R
import com.wlbank.app.ui.common.*
import com.wlbank.app.ui.theme.*

@Composable
fun TransfersScreen(viewModel: TransfersViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var selectedTab by remember { mutableIntStateOf(0) }

    if (uiState.isLoading) {
        LoadingIndicator()
        return
    }

    Column(modifier = Modifier.fillMaxSize()) {
        Text(
            text = stringResource(R.string.transfers_title),
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(16.dp)
        )

        // Tabs
        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.primary
        ) {
            Tab(
                selected = selectedTab == 0,
                onClick = { selectedTab = 0 },
                text = { Text(stringResource(R.string.transfers_new_transfer)) }
            )
            Tab(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                text = { Text(stringResource(R.string.transfers_beneficiaries)) }
            )
        }

        when (selectedTab) {
            0 -> NewTransferTab(uiState, viewModel)
            1 -> BeneficiariesTab(uiState, viewModel)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewTransferTab(uiState: TransfersUiState, viewModel: TransfersViewModel) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        if (uiState.error != null) {
            ErrorBanner(uiState.error)
        }

        if (uiState.transferSuccess) {
            Card(
                colors = CardDefaults.cardColors(containerColor = Emerald400.copy(alpha = 0.15f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = stringResource(R.string.transfers_transfer_success),
                    color = Emerald400,
                    modifier = Modifier.padding(12.dp)
                )
            }
        }

        // Account selector
        Text(stringResource(R.string.transfers_from_account), style = MaterialTheme.typography.labelLarge)
        var accountExpanded by remember { mutableStateOf(false) }
        ExposedDropdownMenuBox(
            expanded = accountExpanded,
            onExpandedChange = { accountExpanded = it }
        ) {
            OutlinedTextField(
                value = uiState.accounts.find { it.id == uiState.selectedAccountId }?.let {
                    "${it.label} - ${formatCurrency(it.balance)}"
                } ?: "",
                onValueChange = {},
                readOnly = true,
                modifier = Modifier.menuAnchor().fillMaxWidth(),
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = accountExpanded) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            )
            ExposedDropdownMenu(expanded = accountExpanded, onDismissRequest = { accountExpanded = false }) {
                uiState.accounts.forEach { account ->
                    DropdownMenuItem(
                        text = { Text("${account.label} - ${formatCurrency(account.balance)}") },
                        onClick = {
                            viewModel.updateSelectedAccount(account.id)
                            accountExpanded = false
                        }
                    )
                }
            }
        }

        // Beneficiary selector
        Text(stringResource(R.string.transfers_beneficiary), style = MaterialTheme.typography.labelLarge)
        var benExpanded by remember { mutableStateOf(false) }
        ExposedDropdownMenuBox(
            expanded = benExpanded,
            onExpandedChange = { benExpanded = it }
        ) {
            OutlinedTextField(
                value = uiState.beneficiaries.find { it.id == uiState.selectedBeneficiaryId }?.name
                    ?: stringResource(R.string.transfers_select_beneficiary),
                onValueChange = {},
                readOnly = true,
                modifier = Modifier.menuAnchor().fillMaxWidth(),
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = benExpanded) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            )
            ExposedDropdownMenu(expanded = benExpanded, onDismissRequest = { benExpanded = false }) {
                uiState.beneficiaries.forEach { ben ->
                    DropdownMenuItem(
                        text = { Text("${ben.name} - ${ben.iban}") },
                        onClick = {
                            viewModel.updateSelectedBeneficiary(ben.id)
                            benExpanded = false
                        }
                    )
                }
            }
        }

        // Amount
        WlTextField(
            value = uiState.amount,
            onValueChange = viewModel::updateAmount,
            label = stringResource(R.string.transfers_amount)
        )

        // Description
        WlTextField(
            value = uiState.description,
            onValueChange = viewModel::updateDescription,
            label = stringResource(R.string.transfers_reason)
        )

        Spacer(modifier = Modifier.height(8.dp))

        WlButton(
            text = if (uiState.isSending) stringResource(R.string.transfers_sending)
                   else stringResource(R.string.transfers_send_transfer),
            onClick = viewModel::sendTransfer,
            loading = uiState.isSending,
            enabled = uiState.selectedAccountId != null &&
                      uiState.selectedBeneficiaryId != null &&
                      uiState.amount.toDoubleOrNull() != null &&
                      (uiState.amount.toDoubleOrNull() ?: 0.0) > 0
        )
    }
}

@Composable
fun BeneficiariesTab(uiState: TransfersUiState, viewModel: TransfersViewModel) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Add beneficiary form
        Text(
            text = stringResource(R.string.transfers_saved_beneficiaries),
            style = MaterialTheme.typography.titleMedium
        )
        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            WlTextField(
                value = uiState.newBeneficiaryName,
                onValueChange = viewModel::updateNewBeneficiaryName,
                label = stringResource(R.string.transfers_name),
                modifier = Modifier.weight(1f)
            )
            WlTextField(
                value = uiState.newBeneficiaryIban,
                onValueChange = viewModel::updateNewBeneficiaryIban,
                label = stringResource(R.string.transfers_iban),
                modifier = Modifier.weight(1f)
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Button(
            onClick = viewModel::addBeneficiary,
            enabled = uiState.newBeneficiaryName.isNotBlank() && uiState.newBeneficiaryIban.isNotBlank() && !uiState.isAddingBeneficiary,
            colors = ButtonDefaults.buttonColors(containerColor = Violet600)
        ) {
            Text(stringResource(R.string.transfers_add))
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (uiState.beneficiaries.isEmpty()) {
            Text(
                text = stringResource(R.string.transfers_no_beneficiaries),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(uiState.beneficiaries) { ben ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(ben.name, style = MaterialTheme.typography.bodyMedium)
                                Text(ben.iban, style = MaterialTheme.typography.bodySmall, color = Slate400)
                            }
                            IconButton(onClick = { viewModel.deleteBeneficiary(ben.id) }) {
                                Icon(Icons.Default.Delete, contentDescription = null, tint = Red400)
                            }
                        }
                    }
                }
            }
        }
    }
}
