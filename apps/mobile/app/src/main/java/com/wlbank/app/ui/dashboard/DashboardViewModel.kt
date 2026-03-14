package com.wlbank.app.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wlbank.app.data.repository.AccountRepository
import com.wlbank.app.data.repository.CardRepository
import com.wlbank.app.data.repository.AuthRepository
import com.wlbank.app.data.repository.TransactionRepository
import com.wlbank.app.domain.model.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DashboardUiState(
    val user: User? = null,
    val accounts: List<Account> = emptyList(),
    val transactions: List<Transaction> = emptyList(),
    val cards: List<Card> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val accountRepository: AccountRepository,
    private val transactionRepository: TransactionRepository,
    private val cardRepository: CardRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadDashboard()
    }

    fun loadDashboard() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val user = authRepository.getUser()
            _uiState.value = _uiState.value.copy(user = user)

            val accountsResult = accountRepository.getAccounts()
            val transactionsResult = transactionRepository.getTransactions(limit = 5)
            val cardsResult = cardRepository.getCards()

            _uiState.value = _uiState.value.copy(
                accounts = accountsResult.getOrDefault(emptyList()),
                transactions = transactionsResult.getOrNull()?.transactions ?: emptyList(),
                cards = cardsResult.getOrDefault(emptyList()),
                isLoading = false,
                error = if (accountsResult.isFailure) accountsResult.exceptionOrNull()?.message else null
            )
        }
    }
}
