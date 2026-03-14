package com.wlbank.app.data.repository

import com.wlbank.app.data.remote.ApiService
import com.wlbank.app.domain.model.Account
import javax.inject.Inject

class AccountRepository @Inject constructor(private val api: ApiService) {
    suspend fun getAccounts(): Result<List<Account>> {
        return try {
            val response = api.getAccounts()
            if (response.isSuccessful && response.body()?.success == true) {
                val accounts = response.body()!!.data.map {
                    Account(it.id, it.userId, it.type, it.label, it.iban, it.balance, it.currency)
                }
                Result.success(accounts)
            } else {
                Result.failure(Exception("Failed to load accounts"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
