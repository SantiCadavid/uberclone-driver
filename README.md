# UberClone — Versión Conductor

Aplicación móvil multiplataforma (React Native + Expo) para **conductores**: registro con validaciones y documentos, disponibilidad con ubicación en tiempo real, recepción de solicitudes con tiempo límite, navegación a la recogida y al destino, cobro con **Mercado Pago (modo de prueba)** o en efectivo, cálculo de tarifa, comisión y ganancia neta, historial con filtros y resumen de ganancias. Interfaz **bilingüe (español / inglés)**.

## Integrantes

| Nombre | Rama |
|---|---|
| Santiago Cadavid Arboleda | `Santiago` |

## Estado — Entrega final

| # | Funcionalidad de la guía | Estado |
|---|---|---|
| 1 | Registro del conductor (datos personales, vehículo y documentos) con validaciones | ✅ |
| 2 | Disponible / No disponible y envío de la ubicación en tiempo real | ✅ |
| 3 | Solicitudes con 15 s para aceptar o rechazar | ✅ |
| 4 | Navegación a la recogida y al destino | ✅ (OSRM, ver decisiones) |
| 5 | Cobro con Mercado Pago en modo de prueba y pago en efectivo | ✅ |
| 6 | Tarifa, comisión de la plataforma y ganancia neta | ✅ |
| 7 | Historial con filtros y ganancias por día, semana y mes | ✅ |
| 8 | Navegación combinada: Stack, Tabs y Drawer | ✅ |

**Funcionalidades adicionales (no exigidas por la guía):** app completa en español e inglés con selector en Login, registro y Perfil; simulador de pasajero; perfil editable con foto; resumen final del viaje cobrado; sugerencia de reconexión con el último estado de disponibilidad; reglas de seguridad de Firestore; identidad visual propia con animaciones accesibles (respetan "Reducir movimiento"), esqueletos de carga y estados vacíos con acción.

## Tecnologías

| Herramienta | Versión | Uso |
|---|---|---|
| Expo SDK | 58 | Framework de la app (pruebas en Expo Go, iPhone) |
| React Native / React | 0.88 / 19 | Interfaz |
| React Navigation | 7 | Stack (viaje), Bottom Tabs (registro) y Drawer (menú) |
| Firebase JS SDK | 13 | Auth (sesión) y Firestore (datos en tiempo real) |
| react-native-maps | — | Mapas (Apple Maps en iOS) con rutas `Polyline` |
| expo-location | — | Ubicación y seguimiento continuo |
| expo-image-picker / expo-file-system | — | Fotos desde cámara o galería y lectura en base64 para la subida |
| expo-web-browser | — | Checkout de Mercado Pago dentro de la app |
| AsyncStorage | 2 | **Solo** preferencias: idioma y último estado de disponibilidad |
| expo-font + Barlow | — | Tipografía de la identidad visual |
| Node.js + Express | — | Backend de pagos |
| Mercado Pago SDK v2 | — | Checkout Pro (Preferences) con credenciales de prueba |
| firebase-admin | — | El backend actualiza viajes y saldo de forma segura |
| Cloudinary | Plan gratuito | Fotos de perfil, vehículo y documentos |
| OSRM + Nominatim | Servicios gratuitos | Rutas, distancia, duración y direcciones |
| ngrok | — | URL pública del backend durante el desarrollo |
| Jest + jest-expo | 30 / 58 | Pruebas unitarias |

## Instalación

### Requisitos
Node.js LTS, Git, **Expo Go** (compatible con SDK 58) en el celular, una cuenta de **ngrok** y los proyectos de **Firebase**, **Mercado Pago (cuentas de prueba)** y **Cloudinary**.

### 1. Clonar
```bash
git clone https://github.com/SantiCadavid/uberclone-driver.git
cd uberclone-driver
```

### 2. Backend de pagos
```bash
cd backend
npm install
```
1. Crea `backend/.env` a partir de `backend/.env.example` (ver variables abajo).
2. En Firebase → Configuración del proyecto → Cuentas de servicio → **Generar nueva clave privada**; guarda el archivo como `backend/serviceAccountKey.json` (está excluido de Git).
3. Inicia el servidor:
```bash
npm run dev
```
4. En otra terminal, expón el backend (con tu dominio de ngrok):
```bash
ngrok http --url=<tu-dominio>.ngrok-free.dev 3000
```
Comprueba `https://<tu-dominio>.ngrok-free.dev/health` → `{"status":"ok"}`.

### 3. App
```bash
cd mobile
npm install
```
Crea `mobile/.env` a partir de `mobile/.env.example` y luego:
```bash
npx expo start --clear
```
Escanea el QR con el celular (misma red Wi-Fi). Si no conecta: `npx expo start --tunnel`.

### 4. Firebase
- **Authentication:** habilitar correo y contraseña.
- **Firestore → Reglas:** publicar el contenido de `firestore.rules`.
- **Firestore → Índices:** la primera vez que abras Ganancias e Historial, la terminal de Expo muestra el enlace para crear cada índice compuesto de `trips`: (`driverId`, `status`, `completedAt` ↓) y el mismo con `paymentMethod`. Tras quedar *Habilitado*, recarga la app.

### 5. Cloudinary
Configuración → Carga → **Ajustes preestablecidos de carga** → nuevo preset **Sin firmar**, carpeta `uberclone-driver`, "No permitir identificación pública" activado e ID aleatorio.

### 6. Mercado Pago (pruebas)
En el panel de desarrolladores crea las cuentas de prueba (vendedor y comprador). El Access Token de prueba del vendedor va en `backend/.env`. Para pagar, inicia sesión en el checkout con el usuario de prueba del **comprador** y usa una tarjeta de prueba; el **nombre del titular** define el resultado: `APRO` aprobado, `CONT` pendiente, `OTHE` rechazado.

## Variables de entorno

Los archivos `.env` están excluidos de Git; los `.env.example` contienen solo los nombres.

**App (`mobile/.env`)** — valores públicos por diseño (quedan dentro de la app):

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | API key web de Firebase |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de Auth |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | App ID |
| `EXPO_PUBLIC_BACKEND_URL` | URL pública del backend (ngrok) |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Nombre de la nube de Cloudinary |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Preset sin firma |

**Backend (`backend/.env`)** — secretos, nunca en la app:

| Variable | Descripción |
|---|---|
| `PORT` | Puerto local (3000) |
| `PUBLIC_URL` | URL pública de ngrok (back_urls y webhook) |
| `MP_ACCESS_TOKEN` | Access Token **de prueba** de Mercado Pago |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Ruta a `serviceAccountKey.json` |

La configuración web de Firebase no es secreta: la seguridad depende de las **reglas de Firestore**. Las llaves secretas (Mercado Pago y cuenta de servicio) solo existen en el backend.

## Cómo probar el flujo completo
1. Regístrate (3 pestañas). La cuenta queda **Pendiente de aprobación**; para probar, cambia `approvalStatus` a `approved` en la consola de Firestore.
2. En Inicio ponte **Disponible** (comparte la ubicación).
3. Menú → **Simulador de pasajero** → crea una solicitud con tarjeta o efectivo.
4. En Inicio acepta la solicitud antes de 15 s → **Pasajero a bordo** → **Finalizar viaje**.
5. Cobra con **Mercado Pago** (tarjeta de prueba) o **Efectivo recibido**; revisa el resumen.
6. Revisa **Historial** (filtros y detalle con la ruta) y **Ganancias** (hoy, semana, mes y saldo).

## Pruebas
```bash
cd mobile
npm test
```
**17 suites, 135 pruebas:** validadores de las 3 pestañas y del perfil (fechas fijas para que no dependan del día), `calculateFare` con el ejemplo de la guía, construcción del documento del conductor (nunca guarda contraseñas ni rutas locales), estados de pago y acciones de cobro, fechas y periodos, ganancias, subida de fotos y diccionarios de idioma (ambos idiomas con exactamente las mismas claves).

## Arquitectura

```
uberclone-driver/
├── firestore.rules              # Reglas de seguridad (versionadas y publicadas en la consola)
├── docs/AI_LOG.md               # Bitácora de uso de IA
├── backend/
│   ├── .env.example
│   ├── scripts/                 # testPreference.js y testVerify.js (pruebas por consola)
│   └── src/
│       ├── config.js            # Lee y valida las variables de entorno
│       ├── firebaseAdmin.js     # Admin SDK (solo en el servidor)
│       ├── auth.js              # requireAuth: verifica el ID token de Firebase
│       ├── errors.js            # HttpError con códigos cortos para la app
│       ├── mercadoPago.js       # Preferencias y consulta de pagos
│       ├── payments.js          # applyPaymentResult y applyCashPayment (transacciones idempotentes)
│       └── server.js            # /health, /payments/preference, /verify, /cash, /webhook, /return
└── mobile/
    ├── App.js
    └── src/
        ├── config/              # pricing, trip, registration, history, payment, location, cloudinary
        ├── i18n/                # Diccionarios es/en por área + translate, defaultT, translateOptions
        ├── context/             # Auth, Driver (sesión y viaje activo), Registration, Language
        ├── hooks/               # useDriverLocation, useTripRequests, useEarnings, useTripHistory,
        │                        # useTripPayment, useTripSummary, useActiveTrip, useDriverProfile, useReducedMotion
        ├── navigation/          # RootNavigator (Stack), RegisterTabs (Tabs), DriverDrawer (Drawer)
        ├── screens/             # auth, register (3 pestañas), home, trip, history, earnings, profile, simulator
        ├── components/          # common (Button, SegmentedControl, Skeleton, EmptyState, LanguageSelector),
        │                        # form (campos con error debajo), trip (solicitud, fila e historial, detalle)
        ├── services/            # firebase, auth, driver, trip, payment, history, upload, routing, preferences, imagePicker
        ├── utils/               # Funciones puras: calculateFare, validators, dates, earnings, format, paymentStatus…
        └── theme/               # colors, typography (Barlow) y layout (espacios, radios, toque mínimo)
```

**Regla de capas:** la red, la base de datos y los pagos viven en `services`, `hooks` y el backend, nunca en el JSX. Los cálculos son funciones puras probadas con Jest. Los hooks guardan **claves de traducción** y la pantalla las traduce, así todo sigue el idioma actual.

## Mapa de requisitos

| Requisito de la guía | Dónde se cumple |
|---|---|
| Registro en 3 pestañas, errores debajo del campo, Enviar solo con todo válido | `navigation/RegisterTabs.js`, `screens/register/*`, `context/RegistrationContext.js`, `utils/validators.js`, `utils/documentValidators.js` |
| Cuenta Pendiente; no puede ponerse Disponible hasta Aprobado | `utils/driverDocument.js`, `screens/home/HomeScreen.js` y regla de `drivers` en `firestore.rules` |
| Ubicación en tiempo real y limpieza al pasar a No disponible | `hooks/useDriverLocation.js` |
| Solicitud con 15 s y rechazo automático | `hooks/useTripRequests.js`, `components/trip/TripRequestCard.js` |
| Estados del viaje en el campo `status` | `config/trip.js`, `services/tripService.js` (transacciones), `firestore.rules` (transiciones permitidas) |
| Flujo de pago de 6 pasos | `services/paymentService.js`, `hooks/useTripPayment.js`, `backend/src/server.js`, `backend/src/payments.js` |
| Llaves secretas solo en el backend; `.env.example` sin valores | `backend/.env.example`, `mobile/.env.example`, `.gitignore` |
| Pago en efectivo con comisión descontada del saldo | `backend/src/payments.js` (`applyCashPayment`) |
| Tarifa, comisión 20 % y ganancia con una sola función pura | `utils/calculateFare.js`, `config/pricing.js` |
| Cada viaje guarda su `commissionRate` | `services/tripService.js` (`createSimulatedTrip`, `finishTrip`) |
| Ganancias de hoy, semana y mes con `useMemo` y saldo | `hooks/useEarnings.js`, `utils/earnings.js`, `screens/earnings/EarningsScreen.js` |
| Historial con FlatList, filtros, paginación y mensaje vacío | `screens/history/HistoryScreen.js`, `hooks/useTripHistory.js`, `services/historyService.js` |
| Detalle con la ruta guardada en `Polyline` (sin Static Maps) | `components/trip/TripDetailModal.js` |
| Tiempo real con Firestore `onSnapshot` | `services/*Service.js` (`subscribe…`) y sus hooks |
| AsyncStorage solo para preferencias | `services/preferencesService.js` |
| Fotos con Cloudinary | `services/uploadService.js`, `config/cloudinary.js` |
| Idioma español / inglés | `context/LanguageContext.js`, `i18n/*`, `components/common/LanguageSelector.js` |

## Mapa de hooks

| Hook | Dónde se cumple |
|---|---|
| `useState` | Formularios del registro y perfil, `HomeScreen`, `ActiveTripScreen`, `HistoryScreen`, hooks de pago e historial |
| `useEffect` con limpieza | `useDriverLocation` (detiene el GPS), `useTripRequests` (cierra `onSnapshot` y el temporizador), `useActiveTrip`, `useTripSummary`, `useEarnings`, `useDriverProfile`, `AuthContext`, `LanguageContext` (bandera `cancelled`), `useReducedMotion` y cada animación (`animation.stop()`) |
| `useContext` | `AuthContext`, `DriverContext` (sesión y viaje activo), `RegistrationContext`, `LanguageContext` |
| `useMemo` | `useEarnings` (totales), errores de formularios, valores de los contextos, rangos de fechas del historial |
| `useCallback` | Aceptar y rechazar en `useTripRequests`, acciones del viaje y del cobro, manejadores de los contextos |
| `useRef` | Mapas, temporizador, cursor de paginación, bloqueo de doble toque y valores animados |
| Personalizados obligatorios | **`useDriverLocation`**, **`useTripRequests`**, **`useEarnings`** |
| Otros personalizados | `useTripHistory`, `useTripPayment`, `useTripSummary`, `useActiveTrip`, `useDriverProfile`, `useReducedMotion` |

## Estados del viaje
`requested` → `accepted` (o `rejected` si se rechaza o vence el tiempo) → `driver_arriving` → `in_progress` → `completed` → `paid`. `cancelled` solo antes de `in_progress`. La app aplica las transiciones con transacciones y las **reglas de Firestore** solo permiten las válidas; **solo el backend** puede pasar un viaje a `paid`.

## Tarifa y ganancias
`Tarifa = max(Mínima, (Base + km·Vkm + min·Vmin) · Mcategoría)`, redondeada a 100 COP; `Comisión = Tarifa · 0,20`; `Ganancia neta = Tarifa − Comisión + Propina`. Valores en `src/config/pricing.js` y en pesos enteros. Ejemplo de la guía (8,5 km, 22 min), verificado con pruebas: **Económico** 19.200 / 3.840 / 15.360 y **XL** 26.900 / 5.380 / 21.520.

**Saldo:** pagos por pasarela suman la ganancia neta; los pagos en efectivo restan la comisión (puede quedar negativo).

## Pagos y seguridad
1. Al finalizar, la app calcula la tarifa con `calculateFare`.
2. La app envía `tripId` y monto al backend con el **ID token** de Firebase.
3. El backend toma el monto real de Firestore y crea la **preferencia** con la llave secreta.
4. La app abre el checkout; el pasajero paga con tarjeta de prueba.
5. El **webhook** (o la verificación al volver) aplica el resultado en una transacción **idempotente**.
6. La app escucha el cambio en tiempo real y muestra el resumen.

**Efectivo:** `POST /payments/cash` marca el viaje como pagado y descuenta la comisión del saldo (idempotente). **Todo lo que mueve dinero pasa por el servidor**; las reglas impiden que el cliente toque `balance`, `paymentStatus` o pase un viaje a `paid`.

## Decisiones técnicas y propias
- **Firebase JS SDK** (no `@react-native-firebase`): funciona en Expo Go.
- **OSRM + Nominatim** en lugar de Google Directions/Distance Matrix: las APIs Legacy no se pueden habilitar en proyectos nuevos y Routes exige facturación; misma función, gratis, una consulta al crear la solicitud y otra al aceptarla.
- **Backend Node/Express + ngrok** en lugar de Cloud Functions (requieren el plan Blaze).
- **Simulador de pasajero** dentro de la app: no existe la app del pasajero.
- **Opción A del resumen:** al pasar a `paid` el viaje se mantiene en pantalla hasta *Continuar* (estado local, sin campos extra ni lecturas adicionales).
- **Revisión técnico-mecánica** obligatoria con 6 años o más (regla configurable); el año del vehículo admite el año siguiente (modelos que se venden por adelantado).
- **Idioma:** un diccionario por idioma dividido por áreas; las funciones puras reciben `t` opcional (español por defecto) para no romper sus pruebas; gana la última elección y se copia al perfil.
- **Cloudinary:** orden *cuenta → fotos → perfil* con borrado de la cuenta si algo falla; fotos enviadas en **base64 dentro de JSON** porque el `fetch` de esta versión de Expo no admite archivos en `FormData` (`Unsupported FormDataPart implementation`).
- **Identidad visual "Asfalto y señal":** asfalto, blanco de carril y amarillo de señal usado solo en lo más importante; tipografía Barlow (inspirada en señalización vial); animaciones solo en la solicitud entrante, el cambio a Disponible y el cobro confirmado.

## Alternativas descartadas

| Alternativa | Motivo |
|---|---|
| `@react-native-firebase` y FCM | Requieren development build; no funcionan en Expo Go para iPhone |
| Firebase Cloud Functions / Storage | Requieren el plan de pago Blaze |
| Google Directions / Distance Matrix | Legacy no habilitable en proyectos nuevos; Routes exige facturación |
| Static Maps en el historial | Gasta cupo por cada elemento; se dibuja la ruta guardada |
| Efectivo en una transacción del cliente | Obligaba a permitir que el cliente cambiara su saldo; se movió al backend |
| `FormData` para las fotos | No compatible con el `fetch` de este SDK |
| Librerías de i18n | Un diccionario propio basta y se prueba con Jest |
| Reanimated para las animaciones | La API `Animated` con driver nativo es suficiente y evita cambiar versiones |

## Robustez (pruebas como docente)

| # | Prueba | Resultado |
|---|---|---|
| 1–2 | Formularios vacíos y con formato inválido | ✓ Errores debajo de cada campo |
| 3–4 | Sin internet en el Login y durante el viaje | ✓ Mensajes claros y tiempo límite |
| 5 | Backend caído | ✓ "El servidor de pagos no está disponible" |
| 6–7 | Permisos de ubicación y cámara denegados | ✓ Avisos sin cerrarse |
| 8 | Notificaciones push | N/A — ver limitaciones |
| 9–10 | Temporizador en cero y aceptar dos veces | ✓ Rechazo automático y una sola aceptación |
| 11 | Solicitud cancelada por el pasajero | ✓ Aviso de cancelación |
| 12–14 | Pago aprobado, pendiente y rechazado | ✓ Estados y acciones correctas |
| 15–16 | Saldo negativo y efectivo dos veces | ✓ Saldo negativo visible; comisión descontada una vez |
| 17 | Cuenta pendiente intenta Disponible | ✓ Bloqueado (app y reglas) |
| 18 | Cerrar la app durante el cobro | ✓ Vuelve a la etapa de cobro |
| 19 | Cambiar la comisión a 25 % | ✓ El historial conserva el 20 % de los viajes anteriores |
| 20 | Paginación con 2 por página | ✓ Carga por páginas y "No hay más viajes" |
| 21 | Quitar la limpieza de `useDriverLocation` | ✓ El GPS seguía escribiendo; demuestra por qué existe la limpieza |

## Limitaciones conocidas
- **Sin notificaciones push:** FCM no funciona en Expo Go para iPhone; la app escucha en tiempo real mientras está abierta.
- Si la app se cierra de golpe estando Disponible, `isAvailable` queda en `true` (se mitiga con la sugerencia de reconexión y al cerrar sesión).
- El resumen final no se repite si la app se cierra justo después del pago (el viaje queda en el historial).
- Si se cobra en efectivo y luego se paga un checkout viejo, el saldo **no** se duplica, pero en la vida real el pasajero requeriría un reembolso.
- La tarifa final se calcula en el cliente (las reglas exigen montos coherentes); moverla al servidor es la mejora siguiente.
- Fotos públicas por URL no adivinable y posibles fotos huérfanas en Cloudinary; en producción: subida firmada desde el backend y entrega autenticada.
- `rating` siempre vacío: no existe la app del pasajero.
- No se traducen la página de Mercado Pago, las direcciones (datos) ni los nombres de pasajeros simulados.
- ngrok gratuito puede cortar la conexión de forma momentánea; la app informa y permite reintentar.
- Aviso de Reanimated en la terminal: proviene de la librería del menú lateral; es inofensivo.

## Uso de IA
Se usó **Claude** (Anthropic) durante todo el proyecto. Cada uso está registrado en la **[bitácora de IA](docs/AI_LOG.md)** (prompt, resumen, qué se usó, modificó o descartó, archivos, commit, verificación y aprendizaje). Los bloques asistidos están marcados en el código con `// AI-assisted: see docs/AI_LOG.md #N`. La bitácora también se entrega exportada a PDF.