package com.wlbank.app.ui.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.wlbank.app.R
import com.wlbank.app.domain.model.*
import com.wlbank.app.ui.common.*
import com.wlbank.app.ui.theme.*

@Composable
fun DashboardScreen(viewModel: DashboardViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    if (uiState.isLoading) {
        LoadingIndicator()
        return
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Greeting
        item {
            Text(
                text = stringResource(R.string.dashboard_greeting, uiState.user?.firstName ?: ""),
                style = MaterialTheme.typography.headlineMedium
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = stringResource(R.string.dashboard_overview),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Total balance card
        item {
            val totalBalance = uiState.accounts.sumOf { it.balance }
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Violet700)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(listOf(Violet600, Violet700))
                        )
                        .padding(20.dp)
                ) {
                    Column {
                        Text(
                            text = stringResource(R.string.dashboard_total_balance),
                            style = MaterialTheme.typography.bodyMedium,
                            color = White.copy(alpha = 0.8f)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = formatCurrency(totalBalance),
                            style = MaterialTheme.typography.headlineLarge,
                            color = White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // Accounts
        items(uiState.accounts) { account ->
            AccountCard(account)
        }

        // Cards section
        if (uiState.cards.isNotEmpty()) {
            item {
                Text(
                    text = stringResource(R.string.dashboard_your_cards),
                    style = MaterialTheme.typography.titleLarge
                )
            }
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(uiState.cards) { card ->
                        DashboardCardItem(card)
                    }
                }
            }
        }

        // Recent transactions
        item {
            Text(
                text = stringResource(R.string.dashboard_recent_transactions),
                style = MaterialTheme.typography.titleLarge
            )
        }

        if (uiState.transactions.isEmpty()) {
            item {
                Text(
                    text = stringResource(R.string.dashboard_no_transactions),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            items(uiState.transactions) { transaction ->
                TransactionItem(transaction)
            }
        }
    }
}

@Composable
fun AccountCard(account: Account) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = if (account.type == "checking")
                        stringResource(R.string.dashboard_checking)
                    else stringResource(R.string.dashboard_savings),
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = "···· ${account.iban.takeLast(4)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Text(
                text = formatCurrency(account.balance),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

@Composable
fun DashboardCardItem(card: Card) {
    Card(
        modifier = Modifier.width(280.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Slate800)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = card.network.uppercase(),
                    style = MaterialTheme.typography.labelLarge,
                    color = White
                )
                Text(
                    text = card.tier,
                    style = MaterialTheme.typography.labelMedium,
                    color = Slate400
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "•••• •••• •••• ${card.cardNumber.takeLast(4)}",
                style = MaterialTheme.typography.titleMedium,
                color = White
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = stringResource(R.string.dashboard_card_expires, card.expiryDate),
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate400
                )
                Text(
                    text = if (card.status == "active") stringResource(R.string.dashboard_card_active)
                           else stringResource(R.string.cards_locked),
                    style = MaterialTheme.typography.labelSmall,
                    color = if (card.status == "active") Emerald400 else Red400
                )
            }
        }
    }
}

@Composable
fun TransactionItem(transaction: Transaction) {
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
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = if (transaction.type == "credit") Icons.Default.ArrowUpward
                                  else Icons.Default.ArrowForward,
                    contentDescription = null,
                    tint = if (transaction.type == "credit") Emerald400 else Red400,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = transaction.counterparty,
                        style = MaterialTheme.typography.bodyMedium,
                        color = White
                    )
                    Text(
                        text = transaction.description ?: transaction.category,
                        style = MaterialTheme.typography.bodySmall,
                        color = Slate400
                    )
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = formatCurrency(transaction.amount),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = if (transaction.type == "credit") Emerald400 else White
                )
                Text(
                    text = transaction.date.take(10),
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate400
                )
            }
        }
    }
}
