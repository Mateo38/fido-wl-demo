package com.wlbank.app.data.repository

import com.wlbank.app.data.remote.ApiService
import com.wlbank.app.data.remote.dto.TransferRequest
import javax.inject.Inject

class TransferRepository @Inject constructor(private val api: ApiService) {
    suspend fun createTransfer(
        fromAccountId: Int,
        beneficiaryId: Int,
        amount: Double,
        description: String?
    ): Result<Unit> {
        return try {
            val response = api.createTransfer(
                TransferRequest(fromAccountId, beneficiaryId, amount, description)
            )
            if (response.isSuccessful) Result.success(Unit)
            else Result.failure(Exception("Failed to create transfer"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
