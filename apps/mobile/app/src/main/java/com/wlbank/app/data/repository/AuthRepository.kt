package com.wlbank.app.data.repository

import com.google.gson.Gson
import com.wlbank.app.data.local.TokenDataStore
import com.wlbank.app.data.remote.ApiService
import com.wlbank.app.data.remote.dto.*
import com.wlbank.app.domain.model.User
import kotlinx.coroutines.flow.first
import javax.inject.Inject

class AuthRepository @Inject constructor(
    private val api: ApiService,
    private val tokenDataStore: TokenDataStore
) {
    private val gson = Gson()

    suspend fun login(email: String, password: String): Result<LoginData> {
        return try {
            val response = api.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()!!.data!!
                tokenDataStore.saveToken(data.token)
                tokenDataStore.saveUser(gson.toJson(data.user))
                Result.success(data)
            } else {
                val error = response.errorBody()?.string() ?: "Login failed"
                Result.failure(Exception(error))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun changePassword(newPassword: String): Result<Unit> {
        return try {
            val response = api.changePassword(ChangePasswordRequest(newPassword))
            if (response.isSuccessful) Result.success(Unit)
            else Result.failure(Exception("Failed to change password"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(firstName: String, lastName: String, email: String): Result<Unit> {
        return try {
            val response = api.register(OnboardingRequest(firstName, lastName, email))
            if (response.isSuccessful) Result.success(Unit)
            else Result.failure(Exception("Registration failed"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getUser(): User? {
        val json = tokenDataStore.userJson.first() ?: return null
        return try {
            val dto = gson.fromJson(json, UserDto::class.java)
            User(dto.id, dto.email, dto.firstName, dto.lastName, dto.role, dto.createdAt, dto.updatedAt)
        } catch (e: Exception) {
            null
        }
    }

    suspend fun isLoggedIn(): Boolean = tokenDataStore.token.first() != null

    suspend fun logout() {
        tokenDataStore.clear()
    }

    suspend fun saveAuthData(token: String, user: UserDto) {
        tokenDataStore.saveToken(token)
        tokenDataStore.saveUser(gson.toJson(user))
    }
}
