package com.wlbank.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wlbank.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ChangePasswordUiState(
    val newPassword: String = "",
    val confirmPassword: String = "",
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class ChangePasswordViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChangePasswordUiState())
    val uiState: StateFlow<ChangePasswordUiState> = _uiState.asStateFlow()

    fun updateNewPassword(value: String) { _uiState.value = _uiState.value.copy(newPassword = value, error = null) }
    fun updateConfirmPassword(value: String) { _uiState.value = _uiState.value.copy(confirmPassword = value, error = null) }

    fun changePassword(onSuccess: () -> Unit) {
        val state = _uiState.value
        if (state.newPassword.length < 8) {
            _uiState.value = state.copy(error = "MIN_LENGTH")
            return
        }
        if (state.newPassword != state.confirmPassword) {
            _uiState.value = state.copy(error = "MISMATCH")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = authRepository.changePassword(state.newPassword)
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                    onSuccess()
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
                }
            )
        }
    }
}
