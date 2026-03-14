package com.wlbank.app.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "wlbank_prefs")

@Singleton
class TokenDataStore @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("jwt_token")
        private val USER_JSON_KEY = stringPreferencesKey("user_json")
        private val LOCALE_KEY = stringPreferencesKey("locale")
    }

    val token: Flow<String?> = context.dataStore.data.map { it[TOKEN_KEY] }

    val userJson: Flow<String?> = context.dataStore.data.map { it[USER_JSON_KEY] }

    val locale: Flow<String?> = context.dataStore.data.map { it[LOCALE_KEY] }

    suspend fun saveToken(token: String) {
        context.dataStore.edit { it[TOKEN_KEY] = token }
    }

    suspend fun saveUser(userJson: String) {
        context.dataStore.edit { it[USER_JSON_KEY] = userJson }
    }

    suspend fun saveLocale(locale: String) {
        context.dataStore.edit { it[LOCALE_KEY] = locale }
    }

    suspend fun clear() {
        context.dataStore.edit {
            it.remove(TOKEN_KEY)
            it.remove(USER_JSON_KEY)
        }
    }
}
