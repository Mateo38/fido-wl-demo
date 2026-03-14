package com.wlbank.app.fido

import android.app.Activity
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetPublicKeyCredentialOption
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.wlbank.app.data.repository.PasskeyRepository
import javax.inject.Inject

class CredentialManagerHelper @Inject constructor(
    private val passkeyRepository: PasskeyRepository
) {
    private val gson = Gson()

    /**
     * Register a new passkey.
     * 1. POST /api/fido/registration/options → get options JSON
     * 2. Create credential via CredentialManager
     * 3. POST /api/fido/registration/verify → send credential response
     */
    suspend fun registerPasskey(activity: Activity, friendlyName: String = "Mon appareil"): Result<Unit> {
        return try {
            // Step 1: Get registration options from server
            val optionsResult = passkeyRepository.getRegistrationOptions()
            val optionsJson = optionsResult.getOrThrow()
            val optionsData = optionsJson.getAsJsonObject("data")
            val challenge = optionsData?.get("challenge")?.asString

            // Step 2: Create credential via Credential Manager
            val credentialManager = CredentialManager.create(activity)
            val createRequest = CreatePublicKeyCredentialRequest(
                requestJson = gson.toJson(optionsData)
            )
            val createResponse = credentialManager.createCredential(activity, createRequest)

            // Step 3: Send credential response to server
            val responseJson = JsonObject().apply {
                add("credential", gson.fromJson(
                    (createResponse as androidx.credentials.CreatePublicKeyCredentialResponse)
                        .registrationResponseJson,
                    JsonObject::class.java
                ))
                addProperty("challenge", challenge)
                addProperty("friendlyName", friendlyName)
            }
            passkeyRepository.verifyRegistration(responseJson)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Authenticate with a passkey.
     * 1. POST /api/fido/authentication/options → get options JSON
     * 2. Get credential via CredentialManager
     * 3. POST /api/fido/authentication/verify → send credential response, get token
     */
    suspend fun authenticateWithPasskey(activity: Activity): Result<com.wlbank.app.data.remote.dto.LoginResponse> {
        return try {
            // Step 1: Get authentication options from server
            val optionsResult = passkeyRepository.getAuthenticationOptions()
            val optionsJson = optionsResult.getOrThrow()
            val optionsData = optionsJson.getAsJsonObject("data")
            val challenge = optionsData?.get("challenge")?.asString

            // Step 2: Get credential via Credential Manager
            val credentialManager = CredentialManager.create(activity)
            val getRequest = GetCredentialRequest(
                listOf(GetPublicKeyCredentialOption(requestJson = gson.toJson(optionsData)))
            )
            val getResponse = credentialManager.getCredential(activity, getRequest)

            // Step 3: Send credential response to server
            val credential = getResponse.credential
            val responseJson = JsonObject().apply {
                add("credential", gson.fromJson(
                    (credential as androidx.credentials.PublicKeyCredential)
                        .authenticationResponseJson,
                    JsonObject::class.java
                ))
                addProperty("challenge", challenge)
            }
            passkeyRepository.verifyAuthentication(responseJson)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
