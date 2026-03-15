# Firebase App Distribution - Setup

## 1. Créer le projet Firebase

1. Va sur https://console.firebase.google.com
2. Crée un projet (ex: "WL Bank")
3. Ajoute une app Android avec le package `com.wlbank.app`
4. Télécharge `google-services.json` et place-le dans `apps/mobile/app/`

## 2. Créer un keystore de signature

```bash
cd apps/mobile
keytool -genkey -v -keystore wlbank-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias wlbank
```

Note le mot de passe choisi.

## 3. Configurer les variables d'environnement

```bash
export KEYSTORE_PATH="../wlbank-release.jks"
export KEYSTORE_PASSWORD="ton_mot_de_passe"
export KEY_ALIAS="wlbank"
export KEY_PASSWORD="ton_mot_de_passe"
```

## 4. Créer un groupe de testeurs

```bash
firebase login
firebase appdistribution:testers:add --project <PROJECT_ID> \
  --emails "testeur1@email.com,testeur2@email.com" \
  --group-alias "testers"
```

## 5. Builder et distribuer

```bash
cd apps/mobile

# Build + upload en une commande
./gradlew assembleRelease appDistributionUploadRelease

# Ou manuellement
./gradlew assembleRelease
firebase appdistribution:distribute \
  app/build/outputs/apk/release/app-release.apk \
  --app <FIREBASE_APP_ID> \
  --groups "testers" \
  --release-notes "v1.0 - WL Bank Android"
```

## 6. Côté testeurs

Chaque testeur recevra un email avec un lien pour :
1. Installer **Firebase App Tester** (1ère fois)
2. Télécharger et installer l'APK

> Les testeurs doivent activer "Sources inconnues" sur leur device.
