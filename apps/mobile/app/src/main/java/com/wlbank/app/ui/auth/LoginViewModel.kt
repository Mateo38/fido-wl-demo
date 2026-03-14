package com.wlbank.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wlbank.app.data.repository.AuthRepository
import com.wlbank.app.data.repository.PasskeyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LoginUiState(
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val isPasskeyLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val passkeyRepository: PasskeyRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun updateEmail(email: String) {
        _uiState.value = _uiState.value.copy(email = email, error = null)
    }

    fun updatePassword(password: String) {
        _uiState.value = _uiState.value.copy(password = password, error = null)
    }

    fun login(onSuccess: (mustChangePassword: Boolean) -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = authRepository.login(_uiState.value.email, _uiState.value.password)
            result.fold(
                onSuccess = { data ->
                    _uiState.value = _uiState.value.copy(isLoading = false)
                    onSuccess(data.mustChangePassword == true)
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = e.message ?: "Login failed"
                    )
                }
            )
        }
    }

    fun getAuthenticationOptions(): kotlinx.coroutines.Deferred<Result<com.google.gson.JsonObject>> {
        return viewModelScope.async {
            passkeyRepository.getAuthenticationOptions()
        }
    }

    private fun <T> kotlinx.coroutines.CoroutineScope.async(
        block: suspend () -> T
    ): kotlinx.coroutines.Deferred<T> {
        return kotlinx.coroutines.async { block() }
    }

    fun verifyPasskeyAuthentication(
        body: com.google.gson.JsonObject,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isPasskeyLoading = true, error = null)
            val result = passkeyRepository.verifyAuthentication(body)
            result.fold(
                onSuccess = { response ->
                    if (response.success && response.data != null) {
                        authRepository.saveAuthData(response.data.token, response.data.user)
                        _uiState.value = _uiState.value.copy(isPasskeyLoading = false)
                        onSuccess()
                    } else {
                        _uiState.value = _uiState.value.copy(
                            isPasskeyLoading = false,
                            error = "Passkey authentication failed"
                        )
                    }
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(
                        isPasskeyLoading = false,
                        error = e.message ?: "Passkey authentication failed"
                    )
                }
            )
        }
    }
}
