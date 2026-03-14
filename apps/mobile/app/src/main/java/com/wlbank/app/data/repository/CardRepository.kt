package com.wlbank.app.data.repository

import com.wlbank.app.data.remote.ApiService
import com.wlbank.app.data.remote.dto.UpdateCardRequest
import com.wlbank.app.domain.model.Card
import javax.inject.Inject

class CardRepository @Inject constructor(private val api: ApiService) {
    suspend fun getCards(): Result<List<Card>> {
        return try {
            val response = api.getCards()
            if (response.isSuccessful && response.body()?.success == true) {
                val cards = response.body()!!.data.map {
                    Card(it.id, it.userId, it.accountId, it.cardNumber, it.cardHolder, it.expiryDate, it.network, it.tier, it.status, it.contactless, it.nfc, it.onlinePayments, it.dailyLimit, it.monthlyLimit)
                }
                Result.success(cards)
            } else {
                Result.failure(Exception("Failed to load cards"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateCard(id: Int, request: UpdateCardRequest): Result<Unit> {
        return try {
            val response = api.updateCard(id, request)
            if (response.isSuccessful) Result.success(Unit)
            else Result.failure(Exception("Failed to update card"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
