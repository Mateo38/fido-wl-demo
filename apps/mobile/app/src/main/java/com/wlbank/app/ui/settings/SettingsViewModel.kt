package com.wlbank.app.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wlbank.app.data.local.TokenDataStore
import com.wlbank.app.data.repository.AuthRepository
import com.wlbank.app.data.repository.PasskeyRepository
import com.wlbank.app.domain.model.Passkey
import com.wlbank.app.domain.model.User
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SettingsUiState(
    val user: User? = null,
    val passkeys: List<Passkey> = emptyList(),
    val isLoading: Boolean = true,
    val isRegistering: Boolean = false,
    val registrationSuccess: Boolean = false,
    val selectedLocale: String = "fr",
    val error: String? = null
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val passkeyRepository: PasskeyRepository,
    private val tokenDataStore: TokenDataStore
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    init {
        loadSettings()
    }

    fun loadSettings() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val user = authRepository.getUser()
            val passkeys = passkeyRepository.getPasskeys().getOrDefault(emptyList())
            val locale = tokenDataStore.locale.first() ?: "fr"
            _uiState.value = _uiState.value.copy(
                user = user,
                passkeys = passkeys,
                selectedLocale = locale,
                isLoading = false
            )
        }
    }

    fun deletePasskey(id: Int) {
        viewModelScope.launch {
            passkeyRepository.deletePasskey(id).onSuccess {
                loadPasskeys()
            }
        }
    }

    fun setRegistering(value: Boolean) {
        _uiState.value = _uiState.value.copy(isRegistering = value)
    }

    fun setRegistrationSuccess() {
        _uiState.value = _uiState.value.copy(isRegistering = false, registrationSuccess = true)
        loadPasskeys()
    }

    fun changeLocale(locale: String) {
        viewModelScope.launch {
            tokenDataStore.saveLocale(locale)
            _uiState.value = _uiState.value.copy(selectedLocale = locale)
        }
    }

    fun logout(onLogout: () -> Unit) {
        viewModelScope.launch {
            authRepository.logout()
            onLogout()
        }
    }

    private fun loadPasskeys() {
        viewModelScope.launch {
            passkeyRepository.getPasskeys().onSuccess {
                _uiState.value = _uiState.value.copy(passkeys = it)
            }
        }
    }
}
