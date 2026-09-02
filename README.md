# Gatita Blanca & Friends — APK Android

Aplicación React + Vite + Tailwind empaquetada como aplicación Android con **Capacitor 8**.

## Arquitectura nueva

- **APK Android:** Capacitor + Android nativo.
- **Datos de perfiles:** exclusivamente en el almacenamiento privado del dispositivo.
- **Fotos de cromos:** exclusivamente en el almacenamiento privado del dispositivo.
- **Catálogo:** incluido en la aplicación (`src/data/cards.json` + imágenes).
- **Perfil nuevo:** se crea una copia local del catálogo de datos `src/data/DEMO.json` con el nombre del Perfil, por ejemplo `profiles/ANA.json` dentro del sandbox privado de la aplicación.
- **Perfil existente:** se abre ese mismo fichero local y conserva cantidades y fotos.
- **Vercel:** solo sirve configuración pública de publicidad. No recibe perfiles, cantidades ni fotos.
- **GitHub:** ya no se utiliza para guardar los datos de usuarios.

### Importante sobre privacidad

La aplicación no hace peticiones a una API para guardar el perfil ni las fotos. El único endpoint remoto añadido para producción es `/api/ads`, que devuelve únicamente configuración de publicidad.

Las fotos se guardan como archivos JPEG dentro del sandbox privado de Android y el fichero JSON del perfil guarda la referencia a cada foto.

## Cámara

Al pulsar directamente sobre la imagen de un cromo:

1. Android solicita permiso de cámara cuando corresponde.
2. Se abre la cámara.
3. La foto se convierte a JPEG y se guarda localmente.
4. El perfil guarda la referencia a esa foto.
5. La siguiente vez se muestra la foto del usuario en lugar de la imagen de catálogo.
6. Pulsar de nuevo permite sustituirla.

La aplicación no usa `saveToGallery`, por lo que las fotos de cromos no se copian automáticamente a la galería del usuario.

## Perfil local

`src/data/DEMO.json` es la plantilla inicial.

Al introducir `ANA` por primera vez se crea conceptualmente:

```text
Android App sandbox/
└── profiles/
    └── ANA.json
└── photos/
    └── ANA/
        ├── 001.jpg
        └── 002.jpg
```

El fichero JSON tiene esta estructura:

```json
{
  "profile": "ANA",
  "cards": {
    "001": 1,
    "002": 2,
    "003": 0
  },
  "photos": {
    "001": "photos/ANA/001.jpg"
  }
}
```

El nombre de la ruta es ilustrativo: Android mantiene estos datos dentro del almacenamiento privado de la aplicación y otra aplicación no puede acceder a ellos sin permisos/condiciones especiales.

## Publicidad — arquitectura recomendada

Se ha preparado **AdMob nativo para Android** mediante `@capacitor-community/admob`.

La aplicación consulta `VITE_AD_CONFIG_URL` y recibe únicamente:

```json
{
  "enabled": true,
  "bannerAdUnitId": "...",
  "isTesting": false,
  "npa": false
}
```

En Vercel configura:

```text
ADMOB_ENABLED=true
ADMOB_BANNER_AD_UNIT_ID=ca-app-pub-XXXX/YYYY
ADMOB_IS_TESTING=false
ADMOB_NPA=false
```

### Qué debe estar y qué no debe estar en el APK

- **NO** guardar claves privadas, tokens, contraseñas o credenciales en el APK.
- El **AdMob App ID y los Ad Unit IDs no son secretos**. Google los considera identificadores públicos de la aplicación/anuncio. Por eso ocultarlos no proporciona seguridad real.
- Aun así, los **Ad Unit IDs** se cargan desde Vercel para poder cambiarlos o desactivar la publicidad sin recompilar el APK.
- El **AdMob App ID nativo** debe estar configurado en Android porque el SDK lo requiere en el `AndroidManifest.xml`. El script `android:prepare` lo configura.
- Para desarrollo, si no se proporciona `ADMOB_APP_ID`, se usa automáticamente el App ID de prueba de Google.

Durante desarrollo usa anuncios de prueba; no hagas clic en anuncios reales de tu propia aplicación. El plugin recomienda usar unidades de prueba para evitar tráfico inválido. documentación de pruebas de AdMob del plugin: https://github.com/capacitor-community/admob/blob/main/docs/testing.md

## Instalar dependencias

Requiere Node.js 22+ y Java 21 para la configuración actual de Capacitor/Android.

```bash
npm install
```

## Generar/preparar el proyecto Android

El proyecto incluye `@capacitor/assets` y `resources/icon.png`. El script de preparación hace automáticamente, en este orden:

1. `npm run build`
2. `npx cap add android` si la carpeta `android/` todavía no existe
3. `npx @capacitor/assets generate --android` para crear los iconos Android
4. `npx cap sync android`
5. Configuración del App ID de AdMob

No es necesario ejecutar estos comandos manualmente por separado.

```bash
npm run android:prepare
```

El icono fuente de la aplicación está en `resources/icon.png`.

Capacitor permite añadir Android a una aplicación web existente con `npx cap add android`. documentación oficial de Capacitor: https://capacitorjs.com/docs

## Abrir en Android Studio

```bash
npm run android
```

Después, desde Android Studio puedes ejecutar la aplicación en un móvil físico o emulador.

## Generar el APK automáticamente desde GitHub Actions

El repositorio incluye `.github/workflows/build-android.yml`. Al hacer `push` a `main`, GitHub Actions instala las dependencias, prepara Capacitor/Android, genera automáticamente los iconos desde `resources/icon.png` y genera un APK debug como artefacto. También puedes lanzarlo manualmente desde **Actions → Build Android APK → Run workflow**.

Para la configuración de publicidad, crea en GitHub una variable de repositorio `VITE_AD_CONFIG_URL` con la URL de Vercel. Para producción puedes crear además el secret `ADMOB_APP_ID`; si no existe, el workflow usa el App ID de prueba de Google.

El artefacto se llama `hello-kitty-cromos-debug-apk`.

## Generar APK de pruebas

```bash
npm run android:build
```

El APK debug quedará en:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## APK de producción

Configura primero el `ADMOB_APP_ID` real en el entorno de compilación y prepara la firma de Android.

```bash
set ADMOB_APP_ID=ca-app-pub-XXXXXXXX~YYYYYYYY
npm run android:release
```

En Windows PowerShell:

```powershell
$env:ADMOB_APP_ID="ca-app-pub-XXXXXXXX~YYYYYYYY"
npm run android:release
```

**La firma de producción no debe hacerse con una clave privada almacenada en GitHub.** Usa Android Studio/Gradle con un keystore protegido o un sistema CI con secretos.

## Vercel para publicidad

Despliega este repositorio en Vercel y configura las variables de entorno de `.env.example`.

En el build del APK configura:

```text
VITE_AD_CONFIG_URL=https://TU-PROYECTO.vercel.app/api/ads
```

El endpoint no recibe información del usuario.

## Qué cambia respecto a la versión anterior

Se elimina el guardado en GitHub/Vercel de:

- perfiles;
- cantidades de cromos;
- fotos.

`api/profile.ts` ya no forma parte de la aplicación. Vercel queda únicamente para la configuración de publicidad.

## Fuentes técnicas

- Capacitor 8: runtime nativo para aplicaciones web y acceso a APIs nativas. urlCapacitorhttps://capacitorjs.com/
- AdMob para Capacitor: plugin comunitario mantenido y documentación de configuración. https://github.com/capacitor-community/admob
