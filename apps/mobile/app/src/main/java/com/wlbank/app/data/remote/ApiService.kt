package com.wlbank.app.data.remote

import com.google.gson.JsonObject
import com.wlbank.app.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Auth
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("auth/change-password")
    suspend fun changePassword(@Body request: ChangePasswordRequest): Response<ApiResponse>

    // Onboarding
    @POST("onboarding")
    suspend fun register(@Body request: OnboardingRequest): Response<ApiResponse>

    // Accounts
    @GET("accounts")
    suspend fun getAccounts(): Response<AccountsResponse>

    // Transactions
    @GET("transactions")
    suspend fun getTransactions(
        @Query("limit") limit: Int? = null,
        @Query("page") page: Int? = null,
        @Query("category") category: String? = null
    ): Response<TransactionsResponse>

    // Cards
    @GET("cards")
    suspend fun getCards(): Response<CardsResponse>

    @PATCH("cards/{id}")
    suspend fun updateCard(@Path("id") id: Int, @Body request: UpdateCardRequest): Response<ApiResponse>

    // Beneficiaries
    @GET("beneficiaries")
    suspend fun getBeneficiaries(): Response<BeneficiariesResponse>

    @POST("beneficiaries")
    suspend fun createBeneficiary(@Body request: CreateBeneficiaryRequest): Response<ApiResponse>

    @DELETE("beneficiaries/{id}")
    suspend fun deleteBeneficiary(@Path("id") id: Int): Response<ApiResponse>

    // Transfers
    @POST("transfers")
    suspend fun createTransfer(@Body request: TransferRequest): Response<ApiResponse>

    // FIDO
    @POST("fido/registration/options")
    suspend fun fidoRegistrationOptions(): Response<JsonObject>

    @POST("fido/registration/verify")
    suspend fun fidoRegistrationVerify(@Body body: JsonObject): Response<ApiResponse>

    @POST("fido/authentication/options")
    suspend fun fidoAuthenticationOptions(): Response<JsonObject>

    @POST("fido/authentication/verify")
    suspend fun fidoAuthenticationVerify(@Body body: JsonObject): Response<LoginResponse>

    @GET("fido/passkeys")
    suspend fun getPasskeys(): Response<PasskeysResponse>

    @DELETE("fido/passkeys/{id}")
    suspend fun deletePasskey(@Path("id") id: Int): Response<ApiResponse>
}
