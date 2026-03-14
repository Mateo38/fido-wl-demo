package com.wlbank.app.domain.model

data class User(
    val id: Int,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: String,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class Account(
    val id: Int,
    val userId: Int,
    val type: String,
    val label: String,
    val iban: String,
    val balance: Double,
    val currency: String
)

data class Transaction(
    val id: Int,
    val accountId: Int,
    val type: String,
    val category: String,
    val counterparty: String,
    val description: String?,
    val amount: Double,
    val currency: String,
    val date: String
)

data class Card(
    val id: Int,
    val userId: Int,
    val accountId: Int,
    val cardNumber: String,
    val cardHolder: String,
    val expiryDate: String,
    val network: String,
    val tier: String,
    val status: String,
    val contactless: Boolean,
    val nfc: Boolean,
    val onlinePayments: Boolean,
    val dailyLimit: Double,
    val monthlyLimit: Double
)

data class Beneficiary(
    val id: Int,
    val userId: Int,
    val name: String,
    val iban: String,
    val bic: String? = null
)

data class Passkey(
    val id: Int,
    val credentialId: String,
    val deviceType: String?,
    val backedUp: Boolean?,
    val transports: List<String>?,
    val friendlyName: String?,
    val createdAt: String?,
    val lastUsedAt: String?
)
