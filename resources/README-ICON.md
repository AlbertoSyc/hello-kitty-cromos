# Icono de la aplicación

El icono fuente de Android es `resources/icon.png`.

No es necesario copiar manualmente el PNG a `android/app/src/main/res/mipmap-*`.
El script `npm run android:prepare` instala `@capacitor/assets` y genera automáticamente los recursos Android necesarios antes de ejecutar `npx cap sync android`.

Para regenerarlos manualmente:

```bash
npx @capacitor/assets generate --android --assetPath resources
```
