package com.wlbank.app.data.repository

import com.wlbank.app.data.remote.ApiService
import com.wlbank.app.data.remote.dto.CreateBeneficiaryRequest
import com.wlbank.app.domain.model.Beneficiary
import javax.inject.Inject

class BeneficiaryRepository @Inject constructor(private val api: ApiService) {
    suspend fun getBeneficiaries(): Result<List<Beneficiary>> {
        return try {
            val response = api.getBeneficiaries()
            if (response.isSuccessful && response.body()?.success == true) {
                val list = response.body()!!.data.map {
                    Beneficiary(it.id, it.userId, it.name, it.iban, it.bic)
                }
                Result.success(list)
            } else {
                Result.failure(Exception("Failed to load beneficiaries"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createBeneficiary(name: String, iban: String, bic: String? = null): Result<Unit> {
        return try {
            val response = api.createBeneficiary(CreateBeneficiaryRequest(name, iban, bic))
            if (response.isSuccessful) Result.success(Unit)
            else Result.failure(Exception("Failed to create beneficiary"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteBeneficiary(id: Int): Result<Unit> {
        return try {
            val response = api.deleteBeneficiary(id)
            if (response.isSuccessful) Result.success(Unit)
            else Result.failure(Exception("Failed to delete beneficiary"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
