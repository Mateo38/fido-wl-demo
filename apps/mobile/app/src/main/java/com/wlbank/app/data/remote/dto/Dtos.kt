package com.wlbank.app.data.remote.dto

import com.google.gson.annotations.SerializedName

// Auth
data class LoginRequest(val email: String, val password: String)

data class LoginResponse(
    val success: Boolean,
    val data: LoginData?
)

data class LoginData(
    val token: String,
    val user: UserDto,
    @SerializedName("must_change_password") val mustChangePassword: Boolean? = false
)

data class UserDto(
    val id: Int,
    val email: String,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val role: String,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("updated_at") val updatedAt: String? = null
)

data class ChangePasswordRequest(@SerializedName("new_password") val newPassword: String)

// Onboarding
data class OnboardingRequest(
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val email: String
)

// Accounts
data class AccountsResponse(val success: Boolean, val data: List<AccountDto>)

data class AccountDto(
    val id: Int,
    @SerializedName("user_id") val userId: Int,
    val type: String,
    val label: String,
    val iban: String,
    val balance: Double,
    val currency: String
)

// Transactions
data class TransactionsResponse(
    val success: Boolean,
    val data: List<TransactionDto>,
    val pagination: PaginationDto? = null
)

data class TransactionDto(
    val id: Int,
    @SerializedName("account_id") val accountId: Int,
    val type: String,
    val category: String,
    val counterparty: String,
    val description: String?,
    val amount: Double,
    val currency: String,
    val date: String
)

data class PaginationDto(
    val page: Int,
    val limit: Int,
    val total: Int,
    @SerializedName("total_pages") val totalPages: Int
)

// Cards
data class CardsResponse(val success: Boolean, val data: List<CardDto>)

data class CardDto(
    val id: Int,
    @SerializedName("user_id") val userId: Int,
    @SerializedName("account_id") val accountId: Int,
    @SerializedName("card_number") val cardNumber: String,
    @SerializedName("card_holder") val cardHolder: String,
    @SerializedName("expiry_date") val expiryDate: String,
    val network: String,
    val tier: String,
    val status: String,
    val contactless: Boolean,
    val nfc: Boolean,
    @SerializedName("online_payments") val onlinePayments: Boolean,
    @SerializedName("daily_limit") val dailyLimit: Double,
    @SerializedName("monthly_limit") val monthlyLimit: Double
)

data class UpdateCardRequest(
    val contactless: Boolean? = null,
    val nfc: Boolean? = null,
    @SerializedName("online_payments") val onlinePayments: Boolean? = null,
    val status: String? = null
)

// Beneficiaries
data class BeneficiariesResponse(val success: Boolean, val data: List<BeneficiaryDto>)

data class BeneficiaryDto(
    val id: Int,
    @SerializedName("user_id") val userId: Int,
    val name: String,
    val iban: String,
    val bic: String? = null
)

data class CreateBeneficiaryRequest(val name: String, val iban: String, val bic: String? = null)

// Transfers
data class TransferRequest(
    @SerializedName("from_account_id") val fromAccountId: Int,
    @SerializedName("beneficiary_id") val beneficiaryId: Int,
    val amount: Double,
    val description: String? = null
)

// FIDO
data class FidoOptionsResponse(val success: Boolean, val data: Any?)

data class FidoVerifyRequest(val credential: Any?, val challenge: String? = null, val friendlyName: String? = null)

data class PasskeysResponse(val success: Boolean, val data: List<PasskeyDto>)

data class PasskeyDto(
    val id: Int,
    @SerializedName("credential_id") val credentialId: String,
    @SerializedName("device_type") val deviceType: String?,
    @SerializedName("backed_up") val backedUp: Boolean?,
    val transports: List<String>?,
    @SerializedName("friendly_name") val friendlyName: String?,
    @SerializedName("created_at") val createdAt: String?,
    @SerializedName("last_used_at") val lastUsedAt: String?
)

// Generic
data class ApiResponse(val success: Boolean, val message: String? = null, val error: String? = null)
data class ApiDataResponse<T>(val success: Boolean, val data: T?, val message: String? = null)
