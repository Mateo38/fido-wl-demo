package com.wlbank.app.ui.transactions

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wlbank.app.data.remote.dto.PaginationDto
import com.wlbank.app.data.repository.TransactionRepository
import com.wlbank.app.domain.model.Transaction
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TransactionsUiState(
    val transactions: List<Transaction> = emptyList(),
    val pagination: PaginationDto? = null,
    val selectedCategory: String? = null,
    val currentPage: Int = 1,
    val isLoading: Boolean = true,
    val error: String? = null
)

@HiltViewModel
class TransactionsViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(TransactionsUiState())
    val uiState: StateFlow<TransactionsUiState> = _uiState.asStateFlow()

    init {
        loadTransactions()
    }

    fun selectCategory(category: String?) {
        _uiState.value = _uiState.value.copy(selectedCategory = category, currentPage = 1)
        loadTransactions()
    }

    fun nextPage() {
        val pagination = _uiState.value.pagination ?: return
        if (_uiState.value.currentPage < pagination.totalPages) {
            _uiState.value = _uiState.value.copy(currentPage = _uiState.value.currentPage + 1)
            loadTransactions()
        }
    }

    fun previousPage() {
        if (_uiState.value.currentPage > 1) {
            _uiState.value = _uiState.value.copy(currentPage = _uiState.value.currentPage - 1)
            loadTransactions()
        }
    }

    private fun loadTransactions() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = transactionRepository.getTransactions(
                limit = 20,
                page = _uiState.value.currentPage,
                category = _uiState.value.selectedCategory
            )
            result.fold(
                onSuccess = { page ->
                    _uiState.value = _uiState.value.copy(
                        transactions = page.transactions,
                        pagination = page.pagination,
                        isLoading = false
                    )
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
                }
            )
        }
    }
}
