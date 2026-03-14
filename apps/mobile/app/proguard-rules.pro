# Retrofit
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.wlbank.app.data.remote.dto.** { *; }
-keep class com.wlbank.app.domain.model.** { *; }
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
