package com.wlbank.app.ui.transactions

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.wlbank.app.R
import com.wlbank.app.ui.common.*
import com.wlbank.app.ui.dashboard.TransactionItem
import com.wlbank.app.ui.theme.*

data class CategoryChip(val key: String?, val labelRes: Int)

val categories = listOf(
    CategoryChip(null, R.string.transactions_all),
    CategoryChip("salary", R.string.transactions_salary),
    CategoryChip("rent", R.string.transactions_rent),
    CategoryChip("groceries", R.string.transactions_groceries),
    CategoryChip("utilities", R.string.transactions_utilities),
    CategoryChip("transport", R.string.transactions_transport),
    CategoryChip("entertainment", R.string.transactions_entertainment),
    CategoryChip("restaurant", R.string.transactions_restaurant),
    CategoryChip("shopping", R.string.transactions_shopping),
    CategoryChip("health", R.string.transactions_health),
    CategoryChip("insurance", R.string.transactions_insurance),
    CategoryChip("subscription", R.string.transactions_subscription),
    CategoryChip("transfer", R.string.transactions_transfer)
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransactionsScreen(viewModel: TransactionsViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize()) {
        // Title
        Text(
            text = stringResource(R.string.transactions_title),
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(16.dp)
        )

        // Category filter chips
        Row(
            modifier = Modifier
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            categories.forEach { cat ->
                FilterChip(
                    selected = uiState.selectedCategory == cat.key,
                    onClick = { viewModel.selectCategory(cat.key) },
                    label = { Text(stringResource(cat.labelRes)) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Violet600,
                        selectedLabelColor = White
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Transaction count
        uiState.pagination?.let { pagination ->
            Text(
                text = if (pagination.total == 1) stringResource(R.string.transactions_count, pagination.total)
                       else stringResource(R.string.transactions_count_plural, pagination.total),
                style = MaterialTheme.typography.bodySmall,
                color = Slate400,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }

        if (uiState.isLoading) {
            LoadingIndicator()
        } else if (uiState.transactions.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = stringResource(R.string.transactions_no_transactions),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(uiState.transactions) { transaction ->
                    TransactionItem(transaction)
                }
            }

            // Pagination controls
            uiState.pagination?.let { pagination ->
                if (pagination.totalPages > 1) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(
                            onClick = { viewModel.previousPage() },
                            enabled = uiState.currentPage > 1
                        ) {
                            Icon(Icons.Default.ChevronLeft, contentDescription = null)
                            Text(stringResource(R.string.transactions_previous))
                        }
                        Text(
                            text = "${uiState.currentPage} / ${pagination.totalPages}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Slate400
                        )
                        TextButton(
                            onClick = { viewModel.nextPage() },
                            enabled = uiState.currentPage < pagination.totalPages
                        ) {
                            Text(stringResource(R.string.transactions_next))
                            Icon(Icons.Default.ChevronRight, contentDescription = null)
                        }
                    }
                }
            }
        }
    }
}
