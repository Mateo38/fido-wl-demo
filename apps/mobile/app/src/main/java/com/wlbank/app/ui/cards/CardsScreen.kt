package com.wlbank.app.ui.cards

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
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
import com.wlbank.app.domain.model.Card
import com.wlbank.app.ui.common.*
import com.wlbank.app.ui.theme.*

@Composable
fun CardsScreen(viewModel: CardsViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    if (uiState.isLoading) {
        LoadingIndicator()
        return
    }

    if (uiState.cards.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(stringResource(R.string.cards_title), color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        return
    }

    val pagerState = rememberPagerState(pageCount = { uiState.cards.size })
    val currentCard = uiState.cards.getOrNull(pagerState.currentPage)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = stringResource(R.string.cards_title),
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(16.dp)
        )

        // Card carousel
        HorizontalPager(
            state = pagerState,
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp),
            contentPadding = PaddingValues(horizontal = 32.dp),
            pageSpacing = 16.dp
        ) { page ->
            CardVisual(uiState.cards[page])
        }

        // Page indicator
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 12.dp),
            horizontalArrangement = Arrangement.Center
        ) {
            repeat(uiState.cards.size) { index ->
                Box(
                    modifier = Modifier
                        .padding(horizontal = 4.dp)
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(
                            if (pagerState.currentPage == index) Violet600
                            else Slate700
                        )
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Card settings
        currentCard?.let { card ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = stringResource(R.string.cards_settings),
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    SettingToggle(
                        label = stringResource(R.string.cards_contactless),
                        checked = card.contactless,
                        onToggle = { viewModel.toggleContactless(card) }
                    )
                    SettingToggle(
                        label = stringResource(R.string.cards_nfc_payments),
                        checked = card.nfc,
                        onToggle = { viewModel.toggleNfc(card) }
                    )
                    SettingToggle(
                        label = stringResource(R.string.cards_online_payments),
                        checked = card.onlinePayments,
                        onToggle = { viewModel.toggleOnlinePayments(card) }
                    )

                    HorizontalDivider(
                        modifier = Modifier.padding(vertical = 8.dp),
                        color = MaterialTheme.colorScheme.outline
                    )

                    SettingToggle(
                        label = stringResource(R.string.cards_lock_card),
                        checked = card.status == "locked",
                        onToggle = { viewModel.toggleLock(card) },
                        isDestructive = true
                    )

                    HorizontalDivider(
                        modifier = Modifier.padding(vertical = 8.dp),
                        color = MaterialTheme.colorScheme.outline
                    )

                    // Limits
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = stringResource(R.string.cards_daily_limit),
                                style = MaterialTheme.typography.bodySmall,
                                color = Slate400
                            )
                            Text(
                                text = formatCurrency(card.dailyLimit),
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = stringResource(R.string.cards_monthly_limit),
                                style = MaterialTheme.typography.bodySmall,
                                color = Slate400
                            )
                            Text(
                                text = formatCurrency(card.monthlyLimit),
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
    }
}

@Composable
fun CardVisual(card: Card) {
    Card(
        modifier = Modifier.fillMaxSize(),
        shape = RoundedCornerShape(16.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.linearGradient(listOf(Slate800, Slate900))
                )
                .padding(20.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(card.network.uppercase(), style = MaterialTheme.typography.titleMedium, color = White)
                    if (card.status == "locked") {
                        Icon(Icons.Default.Lock, contentDescription = null, tint = Red400, modifier = Modifier.size(20.dp))
                    }
                }
                Text(
                    text = "•••• •••• •••• ${card.cardNumber.takeLast(4)}",
                    style = MaterialTheme.typography.titleLarge,
                    color = White,
                    fontWeight = FontWeight.Medium
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(card.cardHolder, style = MaterialTheme.typography.bodySmall, color = Slate400)
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(card.expiryDate, style = MaterialTheme.typography.bodySmall, color = Slate400)
                        Text(
                            text = if (card.status == "active") stringResource(R.string.cards_active)
                                   else stringResource(R.string.cards_locked),
                            style = MaterialTheme.typography.labelSmall,
                            color = if (card.status == "active") Emerald400 else Red400
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SettingToggle(
    label: String,
    checked: Boolean,
    onToggle: () -> Unit,
    isDestructive: Boolean = false
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = if (isDestructive) Red400 else MaterialTheme.colorScheme.onSurface
        )
        Switch(
            checked = checked,
            onCheckedChange = { onToggle() },
            colors = SwitchDefaults.colors(
                checkedThumbColor = White,
                checkedTrackColor = if (isDestructive) Red400 else Violet600
            )
        )
    }
}
