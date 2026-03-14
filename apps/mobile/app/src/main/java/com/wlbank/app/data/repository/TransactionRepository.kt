package com.wlbank.app.data.repository

import com.wlbank.app.data.remote.ApiService
import com.wlbank.app.data.remote.dto.PaginationDto
import com.wlbank.app.domain.model.Transaction
import javax.inject.Inject

data class TransactionPage(
    val transactions: List<Transaction>,
    val pagination: PaginationDto?
)

class TransactionRepository @Inject constructor(private val api: ApiService) {
    suspend fun getTransactions(
        limit: Int? = null,
        page: Int? = null,
        category: String? = null
    ): Result<TransactionPage> {
        return try {
            val response = api.getTransactions(limit, page, category)
            if (response.isSuccessful && response.body()?.success == true) {
                val body = response.body()!!
                val transactions = body.data.map {
                    Transaction(it.id, it.accountId, it.type, it.category, it.counterparty, it.description, it.amount, it.currency, it.date)
                }
                Result.success(TransactionPage(transactions, body.pagination))
            } else {
                Result.failure(Exception("Failed to load transactions"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
