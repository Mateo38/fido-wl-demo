package com.wlbank.app.data.repository

import com.google.gson.JsonObject
import com.wlbank.app.data.remote.ApiService
import com.wlbank.app.domain.model.Passkey
import javax.inject.Inject

class PasskeyRepository @Inject constructor(private val api: ApiService) {
    suspend fun getPasskeys(): Result<List<Passkey>> {
        return try {
            val response = api.getPasskeys()
            if (response.isSuccessful && response.body()?.success == true) {
                val list = response.body()!!.data.map {
                    Passkey(it.id, it.credentialId, it.deviceType, it.backedUp, it.transports, it.friendlyName, it.createdAt, it.lastUsedAt)
                }
                Result.success(list)
            } else {
                Result.failure(Exception("Failed to load passkeys"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deletePasskey(id: Int): Result<Unit> {
        return try {
            val response = api.deletePasskey(id)
            if (response.isSuccessful) Result.success(Unit)
            else Result.failure(Exception("Failed to delete passkey"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getRegistrationOptions(): Result<JsonObject> {
        return try {
            val response = api.fidoRegistrationOptions()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get registration options"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyRegistration(body: JsonObject): Result<Unit> {
        return try {
            val response = api.fidoRegistrationVerify(body)
            if (response.isSuccessful) Result.success(Unit)
            else Result.failure(Exception("Failed to verify registration"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAuthenticationOptions(): Result<JsonObject> {
        return try {
            val response = api.fidoAuthenticationOptions()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get authentication options"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyAuthentication(body: JsonObject): Result<com.wlbank.app.data.remote.dto.LoginResponse> {
        return try {
            val response = api.fidoAuthenticationVerify(body)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to verify authentication"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
