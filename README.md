# UberClone — Versión Conductor

Aplicación móvil multiplataforma (React Native + Expo) para conductores: registro con validaciones, inicio de sesión, recepción de solicitudes en tiempo real, navegación, cobro con pasarela de prueba e historial de ganancias.

## Integrantes
| Nombre | Rama |
|---|---|
| Santiago Cadavid Arboleda | `Santiago` |

## Estado — Primera entrega
- [x] Inicio de sesión con correo y contraseña (sesión persistente)
- [x] Registro del conductor: Pestaña 1 (datos personales) y Pestaña 2 (vehículo)
- [x] Validaciones por campo con errores debajo de cada campo
- [x] Botón **Enviar registro** habilitado solo con ambas pestañas válidas
- [x] Conductor guardado en Firestore (`drivers/{uid}`) con estado **Pendiente de aprobación**
- [x] Estado de aprobación en tiempo real en Inicio
- [ ] Subida de fotos a Cloudinary (en curso)
- [ ] Pestaña 3 — Documentos (siguiente entrega)

## Tecnologías
| Herramienta | Versión | Uso |
|---|---|---|
| Expo SDK | 58 | Framework de la app (pruebas en Expo Go) |
| React Native | 0.88 | Interfaz |
| React Navigation | 7 | Stack (flujo) y Bottom Tabs (registro) |
| Firebase JS SDK | 13 | Auth (inicio de sesión) y Firestore (base de datos) |
| Jest + jest-expo | 30 / 58 | Pruebas unitarias |

## Instalación

Requisitos: Node.js LTS, Git y la app **Expo Go** (compatible con SDK 58) en el celular.

```bash
git clone https://github.com/SantiCadavid/uberclone-driver.git
cd uberclone-driver/mobile
npm install
```

Crea `mobile/.env` a partir de `mobile/.env.example` y llena los valores de tu proyecto Firebase (Configuración del proyecto → Tus apps → App web).

```bash
npx expo start --clear
```

Escanea el QR con la cámara del celular (misma red Wi-Fi). Si no conecta: `npx expo start --tunnel`.

## Variables de entorno
Ver `mobile/.env.example`. El archivo `.env` está excluido de Git.

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | API key web de Firebase |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de Auth |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | App ID |

Las variables `EXPO_PUBLIC_` quedan dentro de la app compilada: solo se usan para la configuración web de Firebase, que no es secreta (la seguridad depende de las reglas de Firestore). Las llaves secretas (Mercado Pago) irán únicamente en el backend.

## Pruebas
```bash
cd mobile
npm test
```
30 pruebas: validaciones de ambas pestañas (incluida la mayoría de edad con fecha fija) y construcción del documento del conductor (verifica que nunca se guarda la contraseña).

## Arquitectura
```
mobile/
├── App.js                          # AuthProvider + NavigationContainer
└── src/
    ├── config/registration.js      # Límites y listas de opciones (un solo lugar)
    ├── context/
    │   ├── AuthContext.js          # Sesión (onAuthStateChanged) y bandera de registro
    │   └── RegistrationContext.js  # Datos, errores y campos tocados de las dos pestañas
    ├── hooks/useDriverProfile.js   # Perfil del conductor en tiempo real (onSnapshot)
    ├── navigation/
    │   ├── RootNavigator.js        # Stack: pantallas según haya sesión
    │   └── RegisterTabs.js         # Tabs: Datos personales | Vehículo
    ├── screens/
    │   ├── auth/LoginScreen.js
    │   ├── register/PersonalDataScreen.js
    │   ├── register/VehicleScreen.js
    │   └── home/HomeScreen.js
    ├── components/form/            # TextField, SelectField, DateField, PhotoField, FormField
    ├── services/
    │   ├── firebase.js             # Conexión única (Auth con persistencia + Firestore)
    │   ├── authService.js          # Login, registro, logout y mensajes de error
    │   ├── driverService.js        # Registro del conductor y suscripción a su perfil
    │   └── imagePicker.js          # Cámara y galería con manejo de permisos
    ├── utils/
    │   ├── validators.js           # Validaciones puras
    │   └── driverDocument.js       # Arma el documento de Firestore (función pura)
    └── theme/colors.js
```
La lógica de red y base de datos vive en `services` y `hooks`, nunca en el JSX.

## Mapa de hooks
| Hook | Dónde se cumple |
|---|---|
| `useState` | `LoginScreen`, `PersonalDataScreen`, `VehicleScreen`, campos de formulario |
| `useEffect` con limpieza | `AuthContext` (suscripción de Auth) y `useDriverProfile` (listener de Firestore) |
| `useContext` | `AuthContext` (sesión) y `RegistrationContext` (formulario) |
| `useMemo` | `RegistrationContext` (errores por pestaña) y `AuthContext` |
| `useCallback` | `RegistrationContext` (actualizar y marcar campos) |
| Hook personalizado | `useDriverProfile` (los de ubicación, solicitudes y ganancias llegan en entregas siguientes) |

## Decisiones técnicas
- **Firebase JS SDK** en lugar de `@react-native-firebase`: funciona en Expo Go sin development build (pruebas en iPhone).
- **React Navigation 7**, igual que en clase.
- El perfil se guarda con el **mismo id que la cuenta** (`drivers/{uid}`); si el guardado falla, la cuenta se elimina para no dejar cuentas sin perfil.
- Una bandera `registrationInProgress` evita que la app cambie a Inicio antes de guardar el perfil.
- Contraseña mínima de 8 caracteres con letras y números (Firebase exige 6). La contraseña nunca se guarda en Firestore ni en AsyncStorage.
- La placa se acepta con espacios o guion y se guarda normalizada (`ABC123`).

## Alternativas descartadas
| Alternativa | Motivo |
|---|---|
| `@react-native-firebase` | Requiere development build; no funciona en Expo Go |
| Firebase Cloud Functions / Storage | Requieren el plan de pago Blaze |
| `@react-native-picker/picker` | Rueda grande en iPhone; se hizo una lista propia con `Modal` |
| Validar el correo repetido antes de enviar | Firebase Auth lo bloquea (protección contra enumeración) y consultar Firestore sin sesión expondría datos; queda como mejora |

## Limitaciones conocidas
- Fotos validadas pero aún no subidas (pendiente Cloudinary).
- Firestore en modo de prueba; las reglas definitivas se configuran antes de la entrega final.
- La traducción de la interfaz según el idioma elegido llega en una entrega siguiente.

## Uso de IA
Todo uso de herramientas de IA está registrado en la [bitácora de IA](docs/AI_LOG.md).