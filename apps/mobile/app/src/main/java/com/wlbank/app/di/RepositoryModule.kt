package com.wlbank.app.di

import com.wlbank.app.data.remote.ApiService
import com.wlbank.app.data.local.TokenDataStore
import com.wlbank.app.data.repository.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideAuthRepository(apiService: ApiService, tokenDataStore: TokenDataStore): AuthRepository {
        return AuthRepository(apiService, tokenDataStore)
    }

    @Provides
    @Singleton
    fun provideAccountRepository(apiService: ApiService): AccountRepository {
        return AccountRepository(apiService)
    }

    @Provides
    @Singleton
    fun provideTransactionRepository(apiService: ApiService): TransactionRepository {
        return TransactionRepository(apiService)
    }

    @Provides
    @Singleton
    fun provideCardRepository(apiService: ApiService): CardRepository {
        return CardRepository(apiService)
    }

    @Provides
    @Singleton
    fun provideBeneficiaryRepository(apiService: ApiService): BeneficiaryRepository {
        return BeneficiaryRepository(apiService)
    }

    @Provides
    @Singleton
    fun provideTransferRepository(apiService: ApiService): TransferRepository {
        return TransferRepository(apiService)
    }

    @Provides
    @Singleton
    fun providePasskeyRepository(apiService: ApiService): PasskeyRepository {
        return PasskeyRepository(apiService)
    }
}
