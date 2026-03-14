package com.wlbank.app.ui.cards

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wlbank.app.data.remote.dto.UpdateCardRequest
import com.wlbank.app.data.repository.CardRepository
import com.wlbank.app.domain.model.Card
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CardsUiState(
    val cards: List<Card> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null
)

@HiltViewModel
class CardsViewModel @Inject constructor(
    private val cardRepository: CardRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CardsUiState())
    val uiState: StateFlow<CardsUiState> = _uiState.asStateFlow()

    init {
        loadCards()
    }

    fun loadCards() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            cardRepository.getCards().fold(
                onSuccess = { _uiState.value = _uiState.value.copy(cards = it, isLoading = false) },
                onFailure = { _uiState.value = _uiState.value.copy(isLoading = false, error = it.message) }
            )
        }
    }

    fun toggleContactless(card: Card) {
        updateCard(card.id, UpdateCardRequest(contactless = !card.contactless))
    }

    fun toggleNfc(card: Card) {
        updateCard(card.id, UpdateCardRequest(nfc = !card.nfc))
    }

    fun toggleOnlinePayments(card: Card) {
        updateCard(card.id, UpdateCardRequest(onlinePayments = !card.onlinePayments))
    }

    fun toggleLock(card: Card) {
        val newStatus = if (card.status == "active") "locked" else "active"
        updateCard(card.id, UpdateCardRequest(status = newStatus))
    }

    private fun updateCard(id: Int, request: UpdateCardRequest) {
        viewModelScope.launch {
            cardRepository.updateCard(id, request).onSuccess {
                loadCards()
            }
        }
    }
}
