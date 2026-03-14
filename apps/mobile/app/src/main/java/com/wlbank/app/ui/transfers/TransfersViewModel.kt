package com.wlbank.app.ui.transfers

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wlbank.app.data.repository.AccountRepository
import com.wlbank.app.data.repository.BeneficiaryRepository
import com.wlbank.app.data.repository.TransferRepository
import com.wlbank.app.domain.model.Account
import com.wlbank.app.domain.model.Beneficiary
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TransfersUiState(
    val accounts: List<Account> = emptyList(),
    val beneficiaries: List<Beneficiary> = emptyList(),
    val selectedAccountId: Int? = null,
    val selectedBeneficiaryId: Int? = null,
    val amount: String = "",
    val description: String = "",
    val isSending: Boolean = false,
    val transferSuccess: Boolean = false,
    val isLoading: Boolean = true,
    val error: String? = null,
    // Add beneficiary form
    val newBeneficiaryName: String = "",
    val newBeneficiaryIban: String = "",
    val isAddingBeneficiary: Boolean = false
)

@HiltViewModel
class TransfersViewModel @Inject constructor(
    private val accountRepository: AccountRepository,
    private val beneficiaryRepository: BeneficiaryRepository,
    private val transferRepository: TransferRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(TransfersUiState())
    val uiState: StateFlow<TransfersUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    fun loadData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val accounts = accountRepository.getAccounts().getOrDefault(emptyList())
            val beneficiaries = beneficiaryRepository.getBeneficiaries().getOrDefault(emptyList())
            _uiState.value = _uiState.value.copy(
                accounts = accounts,
                beneficiaries = beneficiaries,
                selectedAccountId = accounts.firstOrNull()?.id,
                isLoading = false
            )
        }
    }

    fun updateSelectedAccount(id: Int) {
        _uiState.value = _uiState.value.copy(selectedAccountId = id)
    }

    fun updateSelectedBeneficiary(id: Int) {
        _uiState.value = _uiState.value.copy(selectedBeneficiaryId = id)
    }

    fun updateAmount(value: String) {
        _uiState.value = _uiState.value.copy(amount = value, error = null, transferSuccess = false)
    }

    fun updateDescription(value: String) {
        _uiState.value = _uiState.value.copy(description = value)
    }

    fun sendTransfer() {
        val state = _uiState.value
        val accountId = state.selectedAccountId ?: return
        val beneficiaryId = state.selectedBeneficiaryId ?: return
        val amount = state.amount.toDoubleOrNull() ?: return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSending = true, error = null)
            transferRepository.createTransfer(accountId, beneficiaryId, amount, state.description.ifBlank { null }).fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isSending = false,
                        transferSuccess = true,
                        amount = "",
                        description = ""
                    )
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(isSending = false, error = e.message)
                }
            )
        }
    }

    // Beneficiary management
    fun updateNewBeneficiaryName(value: String) {
        _uiState.value = _uiState.value.copy(newBeneficiaryName = value)
    }

    fun updateNewBeneficiaryIban(value: String) {
        _uiState.value = _uiState.value.copy(newBeneficiaryIban = value)
    }

    fun addBeneficiary() {
        val state = _uiState.value
        if (state.newBeneficiaryName.isBlank() || state.newBeneficiaryIban.isBlank()) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isAddingBeneficiary = true)
            beneficiaryRepository.createBeneficiary(state.newBeneficiaryName, state.newBeneficiaryIban).fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        newBeneficiaryName = "",
                        newBeneficiaryIban = "",
                        isAddingBeneficiary = false
                    )
                    loadBeneficiaries()
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(isAddingBeneficiary = false, error = e.message)
                }
            )
        }
    }

    fun deleteBeneficiary(id: Int) {
        viewModelScope.launch {
            beneficiaryRepository.deleteBeneficiary(id).onSuccess {
                loadBeneficiaries()
            }
        }
    }

    private fun loadBeneficiaries() {
        viewModelScope.launch {
            beneficiaryRepository.getBeneficiaries().onSuccess {
                _uiState.value = _uiState.value.copy(beneficiaries = it)
            }
        }
    }
}
