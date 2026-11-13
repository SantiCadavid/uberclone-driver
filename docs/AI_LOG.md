# Bitácora de uso de IA — UberClone Conductor

Cada entrada registra el prompt, la respuesta resumida, qué se usó, modificó o descartó, y cómo se verificó. Los bloques de código asistidos se marcan con `// AI-assisted: see docs/AI_LOG.md #N`.

---

### Entrada #1
- Fecha: 2026-11-04
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Analizar el enunciado del proyecto y generar un plan de trabajo
- Prompt: "Analiza el documento del proyecto final (UberClone versión conductor) y genera un plan de trabajo. Contexto: un solo integrante (rama Santiago), Windows con PowerShell, VS Code, pruebas en iPhone con Expo Go 58.0.5, sin app del pasajero (las solicitudes se simulan). Entrega: resumen de alcance, lista de requisitos, compatibilidad de librerías con Expo Go, contradicciones del enunciado, arquitectura y plan por fases priorizando riesgos técnicos."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se resumieron los cuatro bloques principales (registro, ciclo del viaje en tiempo real, pagos con backend, ganancias e historial). Se identificaron riesgos: librerías que exigen development build, Firebase Cloud Functions requiere plan Blaze y no existe app del pasajero. Se propuso un plan en 8 fases.
- Qué se usó / modificó / descartó: Se adoptó el plan por fases como guía. Se propuso backend Node.js + Express en lugar de Cloud Functions y un simulador de pasajero.
- Archivos y commit: N/A (sin código)
- Verificación: Se recalculó el ejemplo de la sección 5 (8,5 km y 22 min): Económico 19.200 / 3.840 / 15.360 y XL 26.900 / 5.380 / 21.520; coincide con la guía.
- Aprendizaje: Se definió el alcance real del proyecto y el orden de trabajo. Se entendió que el entorno de pruebas (Expo Go en iPhone) condiciona qué librerías se pueden usar, por eso los riesgos técnicos se prueban primero.

### Entrada #2
- Fecha: 2026-11-04
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Configurar el repositorio base (estructura, .gitignore, README, bitácora y ramas)
- Prompt: "Configura el entorno del proyecto en el repositorio de GitHub y en local: estructura de carpetas para app y backend, .gitignore que excluya .env y secretos, README inicial con sección Uso de IA, bitácora docs/AI_LOG.md, rama de trabajo Santiago y protección de main. Verifica la versión del SDK de Expo compatible con Expo Go 58.0.5."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se confirmó que Expo Go 58.0.5 solo soporta SDK 58. Se listaron las librerías de la guía incompatibles con Expo Go en iPhone y sus alternativas (expo-location, SDK web de Firebase, expo-notifications). Se clonó el repo en C:\Repos y se crearon .gitignore, README.md y docs/AI_LOG.md.
- Qué se usó / modificó / descartó: Se usaron los archivos tal cual. Se clonó el repo existente en C:\Repos en lugar de usar git init en otra ruta.
- Archivos y commit: .gitignore, README.md, docs/AI_LOG.md — [HASH: se completa en el siguiente commit]
- Verificación: git check-ignore -v .env confirmó que .env queda excluido; push a main y creación de la rama Santiago en GitHub.
- Aprendizaje: Quedó listo el repositorio con la estructura base, la protección de secretos y el flujo de ramas. Se entendió que el .gitignore debe existir antes del primer commit, porque un archivo ya subido sigue en el historial aunque luego se ignore, y que clonar un repo vacío lo deja conectado al remoto sin configurar origin a mano.

### Entrada #3
- Fecha: 2026-11-04
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Definir el alcance de la primera entrega y crear la app Expo base
- Prompt: "Primera entrega para mañana: registro del conductor con Pestaña 1 (datos personales) y Pestaña 2 (vehículo), validaciones por campo y registro del usuario en la base de datos. Planificar el trabajo y crear el proyecto Expo compatible con Expo Go 58.0.5."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se definió el alcance de la entrega (pestañas 1 y 2, validaciones, guardado en Firestore con estado pending) y un plan de 9 pasos. Se creó la app con create-expo-app (plantilla blank, SDK 58) en la carpeta mobile/.
- Qué se usó / modificó / descartó: Se usó la plantilla blank en lugar de la de Expo Router. La Pestaña 3 queda para la siguiente entrega.
- Archivos y commit: mobile/ (proyecto generado) — [db99547]
- Verificación: La app abrió en el iPhone con Expo Go mostrando la pantalla inicial; package.json confirma SDK 58.
- Aprendizaje: Quedó la app base corriendo en el dispositivo. Se entendió que la versión de Expo Go debe coincidir con el SDK del proyecto y que create-expo-app no debe crear un segundo repositorio dentro del principal.

### Entrada #5
- Fecha: 2026-11-04
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Crear la navegación base de la app (Stack para Login → Registro y Tabs para las pestañas del registro)
- Prompt: "Crear la navegación con React Navigation 7, igual a la usada en clase (native-stack y bottom-tabs): pantalla de Login que lleve al registro del conductor con dos pestañas (Datos personales y Vehículo). Se confirma que el profesor exige inicio de sesión."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se instaló React Navigation 7 y sus dependencias nativas, se creó RootNavigator (native-stack) con Login y Registro, y RegisterTabs (bottom-tabs) anidado con las dos pestañas como pantallas vacías. Se agregó theme/colors.js para colores explícitos.
- Qué se usó / modificó / descartó: Se usó tal cual. Se decidió usar Firebase Auth con correo y contraseña para el inicio de sesión; la contraseña no se guarda en Firestore.
- Archivos y commit: mobile/App.js, mobile/src/navigation/*, mobile/src/screens/*, mobile/src/theme/colors.js — [017811e]
- Verificación: En el iPhone se navegó de Login a Registro, se cambió entre las dos pestañas y se volvió con la flecha atrás.
- Aprendizaje: Quedó la estructura de navegación de la app. Se entendió la navegación anidada (un Tab dentro de una pantalla del Stack) y por qué las pestañas convienen para un formulario dividido: las pantallas no se destruyen al cambiar de pestaña.

### Entrada #6
- Fecha: 2026-11-04
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Implementar el inicio de sesión con correo y contraseña y la sesión persistente
- Prompt: "Implementar inicio de sesión exigido por el profesor con Firebase Auth (correo y contraseña) compatible con Expo Go: sesión persistente, contexto de autenticación con useContext, useEffect con limpieza para la suscripción, validaciones debajo de cada campo y navegación que cambie según haya sesión."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se agregó Firebase Auth con persistencia en AsyncStorage, un servicio de autenticación con mensajes de error en español, AuthContext con onAuthStateChanged y limpieza, LoginScreen con validaciones por campo, HomeScreen con cierre de sesión y un RootNavigator que muestra pantallas según la sesión.
- Qué se usó / modificó / descartó: [COMPLETAR si cambiaste algo]
- Archivos y commit: mobile/src/services/firebase.js, authService.js, context/AuthContext.js, utils/validators.js, screens/auth/LoginScreen.js, screens/home/HomeScreen.js, navigation/RootNavigator.js, App.js — [HASc56d76e]
- Verificación: Se probaron campos vacíos, correo inválido, contraseña incorrecta, inicio correcto, persistencia al cerrar y reabrir Expo Go, cierre de sesión y modo avión, con los mensajes esperados.
- Aprendizaje: Quedó funcionando el inicio de sesión. Se entendió cómo una suscripción (onAuthStateChanged) se abre en useEffect y se cierra en su función de limpieza, cómo useContext comparte la sesión con toda la app y por qué el navegador cambia de pantallas según el estado en vez de usar navigate.

### Entrada #7
- Fecha: 2026-11-04
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Implementar y probar las validaciones de las pestañas 1 (datos personales) y 2 (vehículo) del registro
- Prompt: "Crear las validaciones del registro del conductor según la sección 2 de la guía (nombre, documento, celular, mayoría de edad, género, correo, idioma, contraseña; categoría, placa colombiana, marca, modelo, año, color, capacidad con XL mínimo 6, fotos) como funciones puras con reglas configurables, y probarlas con casos automáticos antes de construir los formularios."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se creó config/registration.js con límites y listas de opciones, se ampliaron los validadores en utils/validators.js con funciones puras por campo y por pestaña, y se agregaron pruebas con Jest (jest-expo) usando una fecha fija para que los resultados no dependan del día.
- Qué se usó / modificó / descartó: Se usó tal cual. Decisiones propias: contraseña mínima de 8 caracteres con letra y número (Firebase exige 6); la placa acepta espacios y guiones y se normaliza a ABC123.
- Archivos y commit: mobile/src/config/registration.js, mobile/src/utils/validators.js, mobile/src/utils/__tests__/validators.test.js, mobile/package.json — [a44b405]
- Verificación: npm test pasó todos los casos; al cambiar xlMinCapacity a 5 falló la prueba de capacidad XL, y al restaurarlo volvió a pasar.
- Aprendizaje: Quedaron listas y probadas todas las reglas del registro. Se entendió la ventaja de las funciones puras (se prueban sin abrir la app) y por qué pasar la fecha de hoy como parámetro hace las pruebas reproducibles.

### Entrada #8
- Fecha: 2026-11-04
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Construir la Pestaña 1 del registro (datos personales) con estado compartido entre pestañas
- Prompt: "Construir la pantalla de la Pestaña 1 del registro del conductor con todos los campos de la guía más contraseña: foto con cámara o galería, fecha de nacimiento, listas desplegables, errores debajo de cada campo usando los validadores ya probados, manejo de permisos denegados y un estado compartido entre las dos pestañas."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se creó RegistrationContext (useContext, useCallback, useMemo) con datos, errores y campos tocados de ambas pestañas; componentes de formulario reutilizables (TextField, SelectField con Modal, DateField, PhotoField); un servicio para cámara y galería con manejo de permisos; y la pantalla PersonalDataScreen.
- Qué se usó / modificó / descartó: Se descartó @react-native-picker/picker y se hizo una lista desplegable propia con Modal para no agregar dependencias y verse mejor en iPhone.
- Archivos y commit: mobile/src/context/RegistrationContext.js, mobile/src/services/imagePicker.js, mobile/src/components/form/*, mobile/src/screens/register/PersonalDataScreen.js, mobile/src/navigation/RegisterTabs.js — [f3dd30c]
- Verificación: En el iPhone se probaron campos vacíos, nombre con números, documento corto, menor de edad, contraseñas distintas, foto con cámara, permiso de cámara denegado (mensaje sin cerrar la app) y que los datos se conservan al cambiar de pestaña.
- Aprendizaje: Quedó lista la Pestaña 1. Se entendió cómo un contexto comparte el estado del formulario entre pestañas, para qué sirven useMemo (no recalcular la validación en cada render) y useCallback (no recrear funciones), y por qué los errores solo aparecen en campos ya tocados.

### Entrada #9
- Fecha: 2026-11-04
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Construir la Pestaña 2 del registro (vehículo) y habilitar Enviar solo con ambas pestañas válidas
- Prompt: "Construir la pantalla de la Pestaña 2 del registro con los campos del vehículo de la guía (categoría, placa colombiana en mayúsculas, marca, modelo, año, color, capacidad con XL mínimo 6 y foto donde se vea la placa), reutilizando los componentes y el contexto de la Pestaña 1, y habilitar el botón Enviar registro solo cuando las dos pestañas estén completas y válidas."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se reemplazó VehicleScreen con el formulario completo reutilizando TextField, SelectField, PhotoField y RegistrationContext. Se agregó un resumen del estado de cada pestaña con accesos para corregir y un botón Enviar deshabilitado hasta que todo sea válido, con una acción temporal que se reemplaza en el paso 9.
- Qué se usó / modificó / descartó: [COMPLETAR si cambiaste algo]
- Archivos y commit: mobile/src/screens/register/VehicleScreen.js — [3c2e7af]
- Verificación: En el iPhone se probaron placa inválida y con guion, año futuro, capacidad 4 al cambiar a XL, foto del vehículo y que el botón solo se habilita con ambas pestañas completas.
- Aprendizaje: Quedó lista la Pestaña 2. Se entendió el valor de los componentes reutilizables (este paso no necesitó archivos nuevos) y cómo una validación que depende de otro campo (capacidad según categoría) se recalcula sola con useMemo.

### Entrada #10
- Fecha: 2026-11-04
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Registrar al conductor: crear la cuenta en Firebase Auth y guardar su perfil en Firestore con estado pendiente
- Prompt: "Conectar el botón Enviar registro: crear el usuario con correo y contraseña en Firebase Auth y guardar el perfil del conductor en Firestore (drivers/{uid}) con estado pending, sin guardar la contraseña, evitando que la navegación cambie antes de terminar, revirtiendo la cuenta si falla el guardado e impidiendo el doble envío."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se creó buildDriverDocument (función pura y probada que arma el documento sin contraseña y normaliza los datos), driverService.registerDriver (Auth + setDoc con reversión por deleteUser) y una bandera registrationInProgress en AuthContext para que el navegador no cambie a Inicio antes de guardar el perfil.
- Qué se usó / modificó / descartó: Las fotos quedan temporalmente en null; se suben con Cloudinary en el paso 9b.
- Archivos y commit: mobile/src/utils/driverDocument.js, mobile/src/utils/__tests__/driverDocument.test.js, mobile/src/services/driverService.js, mobile/src/context/AuthContext.js, mobile/src/navigation/RootNavigator.js, mobile/src/screens/register/VehicleScreen.js — [a64f131]
- Verificación: npm test con 30 pruebas en verde. En el iPhone se registró un conductor nuevo; el usuario apareció en Authentication y el documento drivers/{uid} en Firestore con approvalStatus pending y sin contraseña. Se probó correo ya registrado y modo avión con sus mensajes.
- Aprendizaje: Quedó el registro guardado en la base de datos, que es el requisito central de la entrega. Se entendió por qué el perfil usa el mismo id que la cuenta, por qué hay que revertir la cuenta si falla el guardado, y cómo una bandera en el contexto controla cuándo cambia la navegación.

### Entrada #11
- Fecha: 2026-11-04
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Mostrar en Inicio el perfil del conductor y su estado de aprobación en tiempo real
- Prompt: "Después del registro, mostrar en la pantalla de Inicio el nombre, el vehículo y el estado de aprobación del conductor leídos de Firestore en tiempo real con onSnapshot, mediante un hook personalizado con useEffect y función de limpieza, manejando carga, error y perfil inexistente."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se agregó subscribeToDriver (onSnapshot sobre drivers/{uid}) en driverService, el hook useDriverProfile que abre y cierra la suscripción, y una HomeScreen que muestra la insignia Pendiente o Aprobado, los datos del vehículo y estados de carga, error y sin perfil.
- Qué se usó / modificó / descartó: [COMPLETAR si cambiaste algo]
- Archivos y commit: mobile/src/services/driverService.js, mobile/src/hooks/useDriverProfile.js, mobile/src/screens/home/HomeScreen.js — [84f6972]
- Verificación: Al cambiar approvalStatus a approved en la consola de Firebase, la insignia cambió sola en el iPhone sin recargar; se probó también la cuenta sin perfil y el cierre de sesión.
- Aprendizaje: Quedó visible el resultado del registro y la simulación de aprobación que pide la guía. Se entendió la diferencia entre leer un documento una vez y suscribirse con onSnapshot, y por qué la función de limpieza del useEffect es obligatoria para cerrar la suscripción.

### Entrada #12
- Fecha: 2026-11-10
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Corregir reglas lógicas del registro detectadas después de la primera entrega y planear el resto del proyecto
- Prompt: "Permitir vehículos del año siguiente (modelos 2027 que ya se venden en 2026) y revisar qué otras reglas lógicas faltan en la validación del registro; planear el desarrollo completo del proyecto para la entrega final del 12 de noviembre."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se agregaron al archivo de configuración el año máximo actual + 1, los rangos de capacidad por categoría (Económico y Premium 1–4, XL 6–8), el prefijo 3 del celular, la edad máxima de 80 años y la exigencia de nombre y apellido; también se rechaza el documento que empieza por 0. Se actualizaron y ampliaron las pruebas. Se identificó que Directions y Distance Matrix están en estado Legacy y no se pueden activar en proyectos nuevos, por lo que se usará OSRM.
- Qué se usó / modificó / descartó: Decisión propia: el año máximo se aparta de la frase literal de la guía ("no mayor al año actual") por la realidad del mercado y es configurable. Quedan para después la antigüedad mínima del vehículo (consultar al profesor) y la unicidad de placa y documento.
- Archivos y commit: mobile/src/config/registration.js, mobile/src/utils/validators.js, mobile/src/utils/__tests__/validators.test.js, mobile/src/screens/register/VehicleScreen.js — [e3514fe]
- Verificación: npm test con 35 pruebas en verde; en el iPhone se probaron año 2027 y 2028, capacidad 5 en Económico, celular que no empieza por 3 y nombre sin apellido.
- Aprendizaje: Las validaciones deben reflejar la realidad del negocio, no solo el formato. Tener los límites en configuración y probados permite ajustar una regla cambiando un número.

### Entrada #13
- Fecha: 2026-11-10
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Crear la base de la app del conductor: menú lateral, mapa, interruptor Disponible y seguimiento de ubicación
- Prompt: "Crear la navegación con Drawer (Inicio, Historial, Ganancias, Perfil) y la pantalla de Inicio con mapa y un interruptor Disponible / No disponible, bloqueado si la cuenta no está aprobada, con un hook useDriverLocation que envíe la ubicación a Firestore cada pocos segundos mientras está Disponible y la detenga con la función de limpieza del useEffect."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se agregó DriverDrawer con cierre de sesión, DriverContext para compartir el perfil con una sola suscripción, el hook useDriverLocation (permiso, posición inicial y watchPositionAsync con escritura limitada a una cada 5 s y limpieza), y una HomeScreen con mapa, insignia de aprobación e interruptor con manejo de permisos, desconexión y aprobación revocada.
- Qué se usó / modificó / descartó: Se usó expo-location en lugar de @react-native-community/geolocation porque es el equivalente que funciona en Expo Go. [COMPLETAR si cambiaste algo]
- Archivos y commit: mobile/App.js, mobile/src/config/location.js, mobile/src/utils/withTimeout.js, mobile/src/services/driverService.js, mobile/src/hooks/useDriverLocation.js, mobile/src/context/DriverContext.js, mobile/src/navigation/DriverDrawer.js, mobile/src/navigation/RootNavigator.js, mobile/src/screens/home/HomeScreen.js, mobile/src/screens/common/ComingSoonScreen.js — [f8312ef]
- Verificación: En el iPhone: interruptor bloqueado en Pendiente, habilitado al aprobar desde la consola, ubicación escrita en Firestore al estar Disponible y detenida al apagarlo, apagado automático al revocar la aprobación, cierre de sesión que deja isAvailable en false y permiso de ubicación denegado sin cierre de la app.
- Aprendizaje: Se entendió cómo limpiar una suscripción asíncrona (bandera cancelled), por qué limitar las escrituras a Firestore con useRef, y cómo un contexto evita suscripciones duplicadas al mismo documento.

### Entrada #14
- Fecha: 2026-11-10
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Implementar el cálculo de tarifa y comisión, y un simulador de pasajero que cree solicitudes de viaje reales
- Prompt: "Crear la función pura calculateFare con los valores de la guía en src/config/pricing.js (pesos enteros, redondeo a 100, comisión 20 %, propina completa al conductor) probada con el ejemplo de 8,5 km y 22 min, y un simulador de pasajero que cree viajes 'requested' en Firestore cerca del conductor, calculando ruta, distancia y duración una sola vez con un servicio gratuito."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se crearon config/pricing.js, calculateFare (pura, con pricing como parámetro) y utilidades geográficas con 10 pruebas. Se agregó routingService (OSRM para rutas y Nominatim para direcciones), tripService.createSimulatedTrip (documento trips con el modelo de la guía, commissionRate y routePath) y una pantalla de simulador en el menú lateral.
- Qué se usó / modificó / descartó: Se descartó Google Distance Matrix/Directions porque están en estado Legacy y no se pueden habilitar en proyectos nuevos; se usó OSRM, que la guía acepta como alternativa.
- Archivos y commit: mobile/src/config/pricing.js, mobile/src/config/trip.js, mobile/src/utils/calculateFare.js, mobile/src/utils/geo.js, mobile/src/utils/__tests__/calculateFare.test.js, mobile/src/utils/__tests__/geo.test.js, mobile/src/services/routingService.js, mobile/src/services/tripService.js, mobile/src/screens/simulator/PassengerSimulatorScreen.js, mobile/src/navigation/DriverDrawer.js — [a122e79]
- Verificación: npm test con 45 pruebas en verde, incluido el ejemplo de la guía (Económico 19.200 / 3.840 / 15.360 y XL 26.900 / 5.380 / 21.520). En el iPhone se crearon solicitudes con tarjeta y efectivo que aparecieron en Firestore con todos los campos; en modo avión se mostró el mensaje de error sin cerrar la app.
- Aprendizaje: Se entendió por qué el cálculo debe ser una sola función pura reutilizada, por qué manejar dinero en enteros, y por qué cada viaje guarda su commissionRate.

### Entrada #15
- Fecha: 2026-11-10
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Recibir solicitudes de viaje en tiempo real con temporizador de 15 segundos y aceptar o rechazar
- Prompt: "Crear el hook useTripRequests que escuche en tiempo real las solicitudes del conductor mientras está Disponible, mostrar en Inicio una tarjeta con origen, destino, distancia, duración, categoría, método de pago, tarifa y ganancia estimada, con un temporizador de 15 s que rechace automáticamente al llegar a cero, y manejadores de aceptar y rechazar con useCallback que impidan aceptar dos veces."
- Resumen de la respuesta: Se agregaron a tripService la suscripción a solicitudes (onSnapshot con filtro por conductor y estado) y aceptar/rechazar con runTransaction. El hook useTripRequests maneja la suscripción, la cuenta regresiva desde createdAt con setInterval y su limpieza, el bloqueo de doble toque y la detección de cancelaciones. Se creó TripRequestCard y el mapa muestra la ruta con marcadores y Polyline.
- Qué se usó / modificó / descartó: [COMPLETAR si cambiaste algo]
- Archivos y commit: mobile/src/utils/format.js, mobile/src/utils/__tests__/format.test.js, mobile/src/services/tripService.js, mobile/src/hooks/useTripRequests.js, mobile/src/components/trip/TripRequestCard.js, mobile/src/screens/home/HomeScreen.js — [6e4f1d4]
- Verificación: npm test con 46 pruebas en verde. En el iPhone se probaron la expiración a los 15 s (rejected/expired), el rechazo manual, la aceptación (accepted con acceptedAt), la cancelación desde la consola, el cambio a No disponible y el modo avión.
- Aprendizaje: Se entendió por qué un temporizador y una suscripción deben cerrarse en la limpieza del useEffect, cómo una transacción evita condiciones de carrera al aceptar, y por qué medir el tiempo desde la creación del viaje y no desde que se muestra.

### Entrada #16
- Fecha: 2026-11-11
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Implementar el viaje en curso: ruta a la recogida, pasajero a bordo, ruta al destino y finalización con tarifa final
- Prompt: "Al aceptar una solicitud, mostrar la pantalla del viaje en curso en el Stack con la ruta hacia el punto de recogida (driver_arriving); al tocar Pasajero a bordo cambiar la ruta hacia el destino (in_progress); al finalizar calcular tarifa, comisión y ganancia con la misma calculateFare y el commissionRate del viaje (completed); permitir cancelar antes de in_progress y retomar el viaje si la app se cierra."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se agregó el viaje activo al DriverContext mediante useActiveTrip (onSnapshot sobre los estados activos); transiciones de estado con transacción (startPickup, startTrip, finishTrip, cancelTripByDriver); ActiveTripScreen con mapa, marcadores, Polyline por etapa y resumen; y un RootNavigator que muestra la pantalla del viaje mientras exista un viaje activo.
- Qué se usó / modificó / descartó: [COMPLETAR si cambiaste algo]
- Archivos y commit: mobile/src/config/trip.js, mobile/src/services/tripService.js, mobile/src/hooks/useActiveTrip.js, mobile/src/context/DriverContext.js, mobile/src/screens/trip/ActiveTripScreen.js, mobile/src/navigation/RootNavigator.js — [05eefc1]
- Verificación: En el iPhone se completó un viaje (driver_arriving → in_progress → completed) con fare igual a estimatedFare y comisión del 20 %; se retomó el viaje al reabrir la app; se probó la cancelación por el conductor y desde la consola, y el modo avión.
- Aprendizaje: Se entendió cómo una máquina de estados guardada en la base de datos controla la navegación, por qué cada transición se valida con una transacción, y por qué la tarifa final reutiliza la misma función pura que la estimación.

### Entrada #17
- Fecha: 2026-11-11
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Implementar el backend de pagos con Mercado Pago Checkout Pro (paso 17A): crear la preferencia de pago de un viaje, recibir la notificación de la pasarela y actualizar el viaje y el saldo del conductor de forma segura.
- Prompt: "Implementar un backend Node.js/Express (ESM) que use el SDK v2 de Mercado Pago (API de Preferences) con credenciales de prueba guardadas solo en backend/.env. Endpoints: GET /health; POST /payments/preference (protegido con el ID token de Firebase) que cree la preferencia tomando el monto desde Firestore y no desde la app; POST /payments/webhook que reciba la notificación de la pasarela; POST /payments/verify para consultar el pago manualmente; GET /payments/return como URL de retorno. Al aprobarse el pago, actualizar el viaje (paymentStatus, paymentId, paidAt, status: paid) y sumar driverEarnings al balance del conductor de forma idempotente. Exponer el backend con ngrok usando un dominio estático y agregar scripts de prueba por consola."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se creó el backend en backend/ con Express, firebase-admin y el SDK de Mercado Pago. La preferencia se crea con el monto leído del viaje en Firestore, el webhook y el endpoint de verificación consultan el pago real en Mercado Pago y aplican el resultado con una transacción idempotente. Se agregaron los scripts pay:preference y pay:verify para probar sin la app.
- Qué se usó / modificó / descartó:
  - Usado: estructura por módulos (config, firebaseAdmin, errors, auth, mercadoPago, payments, server), verificación del ID token con requireAuth, applyPaymentResult idempotente y ngrok con dominio estático.
  - Modificado: se dejó mobile/.env solo con las 6 variables EXPO_PUBLIC_FIREBASE_*, porque inicialmente quedaron variables del backend allí. Se agregó el encabezado ngrok-skip-browser-warning por la página de aviso de ngrok gratuito.
  - Descartado: Firebase Cloud Functions (exigen plan Blaze) y confiar en el monto enviado por la app (riesgo de manipulación). Queda como mejora futura migrar de la API de Preferences a la API Orders, porque Mercado Pago avisa que Preferences será descontinuada.
- Archivos y commit: backend/package.json, backend/.env.example, backend/src/config.js, backend/src/firebaseAdmin.js, backend/src/errors.js, backend/src/auth.js, backend/src/mercadoPago.js, backend/src/payments.js, backend/src/server.js, backend/scripts/testPreference.js, backend/scripts/testVerify.js, .gitignore — [751ff5c]
- Verificación:
  - /health respondió {"status":"ok"} por la URL pública de ngrok.
  - Con npm run pay:preference se generó el link de pago, y se pagó en incógnito con la cuenta "Comprador - UberClone" y la tarjeta de prueba con titular APRO: pago aprobado.
  - El webhook llegó (visible en http://127.0.0.1:4040), el viaje quedó en status paid con paymentId y paidAt, y el balance del conductor quedó en 13040.
  - Ejecutar pay:verify de nuevo no volvió a sumar el saldo, lo que comprueba la idempotencia.
  - Error resuelto: "Una de las partes es de prueba" aparecía al pagar sin sesión o con la cuenta real. Se resolvió iniciando sesión primero con el comprador de prueba.
  - Se confirmó con git status que backend/.env y serviceAccountKey.json no entran al commit.
- Aprendizaje: Entendí por qué la llave secreta y el cálculo del monto deben vivir en el backend: la app no es un entorno confiable. También entendí que un webhook puede llegar varias veces, así que la actualización del pago debe ser idempotente para no duplicar el saldo. Haría distinto: usar desde el inicio la API Orders y no mostrar el Access Token en capturas (queda pendiente renovar las credenciales de prueba).

### Entrada #18
- Fecha: 2026-11-11
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Implementar el cobro del viaje en la app del conductor (paso 17B): checkout de Mercado Pago, verificación del pago, cobro en efectivo con descuento de comisión del saldo y resumen final del viaje pagado.
- Prompt: "Con el backend de pagos ya funcionando, implementar en la app Expo el cobro del viaje: un servicio que llame POST /payments/preference y /payments/verify con el ID token de Firebase y timeout; abrir el checkout de Mercado Pago con expo-web-browser y verificar el pago al cerrar el navegador; registrar el pago en efectivo con una transacción de Firestore que pase el viaje a paid con paymentStatus cash y descuente la comisión del balance del conductor (puede quedar negativo); mostrar el estado Aprobado/Pendiente/Rechazado/Efectivo con funciones puras probadas en Jest; y resolver que, al pasar a paid, la app muestre el resumen final en lugar de saltar a Inicio (opción A: estado local en DriverContext)."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se crearon paymentService (backend y efectivo), los hooks useTripPayment y useTripSummary, y las funciones puras de estado del pago con 12 pruebas. ActiveTripScreen muestra el cobro en la etapa completed y el resumen en paid. useActiveTrip detecta el paso completed → paid para mantener el resumen hasta que el conductor toca Continuar.
- Qué se usó / modificó / descartó:
  - Usado: expo-web-browser (la promesa se resuelve al cerrar el navegador y permite verificar el pago automáticamente), AbortController para el timeout de fetch y una transacción para el efectivo validada con la misma regla de los botones.
  - Modificado: paymentStatus.js pasó de textos fijos a TRIP_STATUS y PAYMENT_METHODS; colors.js incorpora success y warning; si se cobra en efectivo tras un rechazo, el viaje guarda paymentMethod cash y paymentMethodChangedFrom.
  - Descartado: Linking.openURL (no avisa cuando el usuario vuelve), un campo driverAcknowledgedAt en Firestore (relee todo el historial pagado) y una pantalla TripSummary separada (frágil al cambiar de navegador).
- Archivos y commit: mobile/src/config/payment.js, mobile/src/utils/paymentStatus.js, mobile/src/utils/__tests__/paymentStatus.test.js, mobile/src/services/paymentService.js, mobile/src/services/tripService.js, mobile/src/hooks/useTripPayment.js, mobile/src/hooks/useTripSummary.js, mobile/src/hooks/useActiveTrip.js, mobile/src/context/DriverContext.js, mobile/src/navigation/RootNavigator.js, mobile/src/screens/trip/ActiveTripScreen.js, mobile/src/theme/colors.js, mobile/.env.example, mobile/package.json — [e43bab0]
- Verificación: [COMPLETAR TRAS LAS PRUEBAS] npm test con 6 suites y 58 pruebas en verde; efectivo con saldo descontado y prueba con saldo negativo; tarjeta APRO aprobada con resumen; OTHE rechazado con opción de reintentar o efectivo; CONT pendiente con Verificar pago; ngrok apagado y modo avión con mensajes claros sin cierre de la app.
- Aprendizaje: Entendí que el estado del pago tiene una sola fuente de verdad (Firestore) y que la app solo pide acciones: no decide si un pago se aprobó. También entendí que una misma regla de negocio (cuándo se permite el efectivo) debe vivir en una función pura, reutilizada por la interfaz y por la transacción, para que no se contradigan. Haría distinto: mover el cobro en efectivo al backend para que el cliente no pueda modificar el saldo; queda para las reglas de seguridad del paso 22.

### Entrada #19
- Fecha: 2026-11-11
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Implementar las pantallas de Ganancias e Historial de carreras (paso 18) con el hook useEarnings, filtros, paginación y detalle con la ruta.
- Prompt: "Implementar la pantalla de Ganancias con un hook personalizado useEarnings que escuche en tiempo real los viajes pagados y calcule con useMemo, para hoy, la semana y el mes, el número de viajes, total facturado, comisiones, propinas, ganancia neta, promedio por viaje y el movimiento del saldo (pagos por pasarela menos comisiones de efectivo), mostrando también el saldo acumulado. Implementar el Historial con FlatList ordenado del más reciente al más antiguo, filtros Hoy/Semana/Mes/Rango de fechas y por método de pago, paginación de 20 con limit y startAfter, mensaje vacío y un detalle que dibuje la ruta guardada con Polyline (sin Static Maps), con duración, distancia, comisión, propina y calificación. Cálculos y fechas en funciones puras probadas con Jest; lógica de Firestore en services y hooks."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se crearon las funciones puras de fechas y ganancias (18 pruebas), historyService con la consulta paginada y la suscripción de viajes pagados, los hooks useEarnings y useTripHistory, el componente SegmentedControl, la fila y el detalle del historial, y las pantallas EarningsScreen e HistoryScreen conectadas al Drawer.
- Qué se usó / modificó / descartó:
  - Usado: useMemo para los resúmenes, getDocs con cursor para la paginación, onSnapshot para ganancias, useFocusEffect para recargar el historial y memo en las filas.
  - Modificado: colors.js incorpora surface y toneColors; DriverDrawer reemplaza ComingSoon por Historial y Ganancias; se crearon 2 índices compuestos en Firestore.
  - Descartado: calcular la paginación en el cliente sobre todo el historial (lee de más), Static Maps para el detalle (gasta cupo) y una pila de navegación extra para el detalle (se usó un Modal, más simple).
- Archivos y commit: mobile/src/config/history.js, mobile/src/utils/dates.js, mobile/src/utils/earnings.js, mobile/src/utils/__tests__/dates.test.js, mobile/src/utils/__tests__/earnings.test.js, mobile/src/services/historyService.js, mobile/src/hooks/useEarnings.js, mobile/src/hooks/useTripHistory.js, mobile/src/components/common/SegmentedControl.js, mobile/src/components/trip/TripHistoryItem.js, mobile/src/components/trip/TripDetailModal.js, mobile/src/screens/history/HistoryScreen.js, mobile/src/screens/earnings/EarningsScreen.js, mobile/src/theme/colors.js, mobile/src/navigation/DriverDrawer.js — [6416800]
- Verificación: [COMPLETAR TRAS LAS PRUEBAS] npm test con 8 suites y 76 pruebas; Ganancias de hoy con los 2 viajes reales (24.500 / 4.900 / 19.600 / promedio 9.800 / +7.800); historial con filtros, rango inválido con error debajo del campo, mensaje vacío, detalle con ruta y paginación probada con pageSize 2; índices compuestos creados desde el enlace del error de Firestore.
- Aprendizaje: Entendí la diferencia entre una lectura paginada con cursor (getDocs + startAfter), adecuada para listas largas, y una suscripción en tiempo real, adecuada para datos pequeños que deben actualizarse solos. También entendí por qué Firestore exige índices compuestos y por qué guardar los montos en cada viaje protege el historial de cambios de configuración. Haría distinto: definir los índices en un archivo firestore.indexes.json versionado en el repositorio.

### Entrada #20
- Fecha: 2026-11-12
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Implementar la pestaña 3 del registro (paso 20): documentos del conductor, correo de Mercado Pago y aceptación de términos con la comisión visible, y mover el envío del registro a esta pestaña.
- Prompt: "Agregar al registro la pestaña Documentos con licencia (número, foto y vencimiento posterior a hoy), SOAT (foto y vencimiento posterior a hoy), revisión técnico-mecánica (foto y vencimiento, solo si aplica según el año del vehículo con una regla configurable), correo de la cuenta de Mercado Pago con validación de formato y un checkbox de términos que muestre el porcentaje de comisión. Validadores puros con pruebas en Jest, errores debajo de cada campo y botón Enviar registro habilitado solo con las tres pestañas completas. Guardar los documentos en drivers/{uid} sin datos bancarios ni de tarjeta, sin romper las pruebas existentes de buildDriverDocument."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se crearon los validadores puros de documentos (22 pruebas), el componente CheckboxField, TabStatus como componente compartido y la pantalla DocumentsScreen con el envío del registro. El contexto de registro incorporó los datos y errores de la pestaña 3, que dependen del año del vehículo. buildDriverDocument recibe los documentos como parámetro opcional (4 pruebas nuevas) y DateField admite fecha mínima e inicial.
- Qué se usó / modificó / descartó:
  - Usado: useMemo para los errores de documentos y la regla de revisión técnica, useContext para compartir el estado entre las 3 pestañas y minimumDate en el selector de fechas.
  - Modificado: el botón Enviar registro pasó de VehicleScreen a DocumentsScreen; VehicleScreen ahora tiene Siguiente: Documentos; registerDriver recibe los documentos. [COMPLETAR si se cambió la regla de 6 años según la docente]
  - Descartado: guardar las fotos antes del paso de Cloudinary (quedan en null y se suben en el paso 21), un componente de checkbox externo (se armó con Pressable) y cambiar la firma de buildDriverDocument (se agregó un parámetro opcional para no romper pruebas).
- Archivos y commit: mobile/src/utils/documentValidators.js, mobile/src/utils/__tests__/documentValidators.test.js, mobile/src/utils/__tests__/driverDocument.documents.test.js, mobile/src/utils/driverDocument.js, mobile/src/config/registration.js, mobile/src/context/RegistrationContext.js, mobile/src/services/driverService.js, mobile/src/components/form/DateField.js, mobile/src/components/form/CheckboxField.js, mobile/src/components/form/TabStatus.js, mobile/src/screens/register/DocumentsScreen.js, mobile/src/screens/register/VehicleScreen.js, mobile/src/navigation/RegisterTabs.js — [e8ab7e4]
- Verificación: [COMPLETAR TRAS LAS PRUEBAS] npm test con 10 suites y 102 pruebas en verde; envío desactivado con pestañas incompletas; selector de vencimiento sin fechas pasadas; revisión técnica que aparece o desaparece según el año del vehículo; registro completo con documents guardado en Firestore, fotos en null y sin contraseña ni datos bancarios; modo avión y doble toque sin cuentas a medias.
- Aprendizaje: Entendí que una pestaña puede depender de otra (la revisión técnica depende del año del vehículo) y que eso se resuelve declarando esa dependencia en el useMemo, no copiando datos. También entendí por qué conviene agregar parámetros opcionales al final cuando una función ya tiene pruebas. Haría distinto: pedir desde el inicio la regla exacta de la revisión técnico-mecánica a la docente y dejar el valor documentado.

### Entrada #21
- Fecha: 2026-11-12
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Crear el sistema de idioma español/inglés para toda la app (paso 19A) con selector en el Login y en el Perfil, y la pantalla de Perfil y configuración con datos editables, vehículo, documentos y cierre de sesión.
- Prompt: "Crear un sistema de idioma es/en con un diccionario por idioma y un contexto global que se cargue desde AsyncStorage antes del inicio de sesión, con selector en el Login y en el Perfil. La última elección explícita gana y se copia al perfil en Firestore; si el teléfono no tiene preferencia se usa el idioma del perfil. Reemplazar la pantalla temporal de Perfil por una con datos editables (nombre, celular, género) usando los validadores del registro, datos de solo lectura, vehículo, documentos y cierre de sesión. Guardar en AsyncStorage solo el idioma y el último estado de disponibilidad, y ofrecer en Inicio volver a conectarse. Traducir Login, menú, Inicio y Perfil; funciones puras con t opcional en español por defecto."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se crearon los diccionarios es/en con translate, defaultT y getLocale (7 pruebas), LanguageContext con carga desde AsyncStorage, respaldo en el idioma del perfil y sincronización de la última elección, LanguageSelector, preferencesService, validadores del perfil (6 pruebas) y ProfileScreen. Se tradujeron Login, mensajes de autenticación, menú, títulos de navegación e Inicio, que además guarda el último estado de disponibilidad.
- Qué se usó / modificó / descartó:
  - Usado: useContext para el idioma, useEffect con bandera cancelled para AsyncStorage, useMemo para los errores del perfil, t como parámetro opcional (español por defecto) para no cambiar las pruebas existentes.
  - Modificado: RootNavigator envuelve la navegación en LanguageProvider (sin tocar App.js); DriverDrawer usa títulos traducidos, la pantalla real de Perfil y signOutDriver; authService traduce sus errores; se eliminó ComingSoonScreen.
  - Descartado: librerías externas de i18n (el diccionario basta), que gane el idioma del perfil al iniciar sesión (decisión A: gana la última elección), reconectar automáticamente al abrir la app y editar vehículo o documentos desde el perfil (requiere nueva aprobación).
- Archivos y commit: mobile/src/i18n/index.js, mobile/src/i18n/es.js, mobile/src/i18n/en.js, mobile/src/i18n/__tests__/i18n.test.js, mobile/src/context/LanguageContext.js, mobile/src/services/preferencesService.js, mobile/src/components/common/LanguageSelector.js, mobile/src/utils/profileValidators.js, mobile/src/utils/__tests__/profileValidators.test.js, mobile/src/screens/profile/ProfileScreen.js, mobile/src/services/authService.js, mobile/src/services/driverService.js, mobile/src/screens/auth/LoginScreen.js, mobile/src/navigation/RootNavigator.js, mobile/src/navigation/DriverDrawer.js, mobile/src/screens/home/HomeScreen.js — [9d886f1]
- Verificación: [COMPLETAR TRAS LAS PRUEBAS] npm test con 12 suites y 115 pruebas; Login en inglés con errores de autenticación en inglés; idioma conservado al cerrar y abrir la app; cambio de idioma en el Perfil aplicado a toda la parte traducida y copiado a Firestore; edición del perfil con errores debajo del campo; aviso de reconexión tras cerrar sesión estando Disponible; modo avión con mensajes claros.
- Aprendizaje: Entendí la diferencia entre una preferencia del dispositivo (AsyncStorage) y un dato del perfil (Firestore), y cómo combinarlas con una regla clara: gana la última elección. También entendí por qué un parámetro opcional con valor por defecto permite traducir funciones puras sin romper sus pruebas. Haría distinto: usar claves de traducción desde el inicio del proyecto en lugar de textos fijos en las pantallas.

### Entrada #22
- Fecha: 2026-11-12
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Traducir todo el flujo de registro a español e inglés (paso 19B): pestañas, campos, listas, fotos, fechas y mensajes de validación, usando el mismo selector de idioma de la app.
- Prompt: "Traducir el registro completo con el sistema de idioma existente: títulos de pestañas, etiquetas, ejemplos, opciones de género, categoría y color, componentes de foto y fecha, estado de las pestañas y errores de envío. Los validadores puros deben recibir una función t opcional con español por defecto para que sus pruebas no cambien, y agregar pruebas en inglés. El campo Idioma de la pestaña 1 debe ser el mismo selector de la app, de modo que el registro y la app usen siempre el mismo idioma."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se crearon los diccionarios del registro en español e inglés (unidos en i18n/index.js con translateOptions y optionLabel), los validadores, validadores de documentos y del perfil recibieron t como parámetro opcional, las opciones de las listas agregaron labelKey, imagePicker devuelve claves de error y las pantallas y componentes del registro usan t(). El idioma del registro se toma de LanguageContext. Se agregaron 7 pruebas en inglés.
- Qué se usó / modificó / descartó:
  - Usado: parámetro opcional t con defaultT (decisión A), códigos en la base de datos y etiquetas traducidas al mostrar, useMemo con t en las dependencias para retraducir los errores al cambiar de idioma.
  - Modificado: RegistrationContext ya no guarda un idioma propio; el campo Idioma usa LanguageSelector; LoginScreen y ProfileScreen pasan t a sus validadores; las opciones conservan label en español para el código que aún no se traduce.
  - Descartado: devolver claves desde los validadores (obligaba a reescribir unas 100 pruebas) y formato de fecha mm/dd/aaaa en inglés (la app es para Colombia, se mantiene dd/mm/aaaa).
- Archivos y commit: mobile/src/i18n/es.registration.js, mobile/src/i18n/en.registration.js, mobile/src/i18n/index.js, mobile/src/utils/__tests__/registration.en.test.js, mobile/src/config/registration.js, mobile/src/utils/validators.js, mobile/src/utils/documentValidators.js, mobile/src/utils/profileValidators.js, mobile/src/services/imagePicker.js, mobile/src/services/driverService.js, mobile/src/context/RegistrationContext.js, mobile/src/navigation/RegisterTabs.js, mobile/src/components/form/SelectField.js, mobile/src/components/form/DateField.js, mobile/src/components/form/PhotoField.js, mobile/src/components/form/TabStatus.js, mobile/src/screens/register/PersonalDataScreen.js, mobile/src/screens/register/VehicleScreen.js, mobile/src/screens/register/DocumentsScreen.js, mobile/src/screens/auth/LoginScreen.js, mobile/src/screens/profile/ProfileScreen.js — [fd05155]
- Verificación: [COMPLETAR TRAS LAS PRUEBAS] npm test con 13 suites y 122 pruebas; registro completo en inglés con errores, listas, selector de fechas y permisos traducidos; cambio de idioma en la pestaña 1 aplicado al instante a todo el registro; nueva cuenta creada en inglés que entra a la app en inglés con language en en en Firestore.
- Aprendizaje: Entendí cómo un parámetro con valor por defecto permite extender funciones puras sin romper sus pruebas, y por qué guardar códigos en la base de datos hace que traducir la interfaz no afecte los datos. También entendí que un mismo dato no debe vivir en dos lugares (el idioma del registro y el de la app). Haría distinto: diseñar los validadores con claves de mensaje desde el principio.

### Entrada #23
- Fecha: 2026-11-12
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Traducir a español e inglés la solicitud entrante, el viaje en curso, el cobro, el resumen del viaje, el simulador de pasajero y los avisos de Inicio (paso 19C).
- Prompt: "Traducir con el sistema de idioma existente la tarjeta de solicitud, la pantalla del viaje en todas sus etapas (incluidos títulos, confirmaciones de cancelar y de efectivo, cobro y resumen), el simulador de pasajero y los avisos de Inicio. Los hooks de solicitudes, ubicación, pago, resumen y perfil deben guardar claves de traducción en lugar de textos, y los servicios devolver claves de error. Las funciones puras de etiquetas reciben t opcional con español por defecto para no cambiar sus pruebas."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se crearon los diccionarios del viaje en español e inglés, getTripErrorKey, getPaymentErrorKey y getSimulatorErrorKey en los servicios, paymentMethodLabel y t opcional en categoryLabel y getPaymentStatusInfo (4 pruebas nuevas). Los hooks useTripRequests, useDriverLocation, useTripPayment, useTripSummary y useDriverProfile guardan claves, y TripRequestCard, ActiveTripScreen, PassengerSimulatorScreen y HomeScreen las traducen al mostrar.
- Qué se usó / modificó / descartó:
  - Usado: claves de traducción en el estado de los hooks, t opcional en funciones puras, useLayoutEffect dependiente de t para el título del viaje.
  - Modificado: el timeout local de useTripRequests pasó a TRIP_CONFIG.actionTimeoutMs; los colores fijos de la tarjeta y el simulador pasaron a theme/colors; ActiveTripScreen usa toneColors del tema.
  - Descartado: que los servicios reciban el idioma (mezclaría red con presentación) y traducir la página de Mercado Pago o las direcciones (no son textos de la app).
- Archivos y commit: mobile/src/i18n/es.trip.js, mobile/src/i18n/en.trip.js, mobile/src/i18n/index.js, mobile/src/utils/format.js, mobile/src/utils/paymentStatus.js, mobile/src/utils/__tests__/trip.en.test.js, mobile/src/services/tripService.js, mobile/src/services/paymentService.js, mobile/src/hooks/useTripPayment.js, mobile/src/hooks/useTripSummary.js, mobile/src/hooks/useTripRequests.js, mobile/src/hooks/useDriverLocation.js, mobile/src/hooks/useDriverProfile.js, mobile/src/components/trip/TripRequestCard.js, mobile/src/screens/trip/ActiveTripScreen.js, mobile/src/screens/simulator/PassengerSimulatorScreen.js, mobile/src/screens/home/HomeScreen.js — [1640dc2]
- Verificación: [COMPLETAR TRAS LAS PRUEBAS] npm test con 14 suites y 126 pruebas; solicitud, viaje, cobro en efectivo, resumen y simulador en inglés; confirmaciones de cancelar y efectivo traducidas; error del servidor de pagos en inglés con ngrok apagado; aviso visible que cambia de idioma al cambiar el idioma de la app.
- Aprendizaje: Entendí por qué conviene guardar en el estado una clave y no el texto ya traducido: el texto depende del idioma al momento de mostrarlo. También entendí que los servicios deben devolver códigos y dejar el texto a la capa de presentación. Haría distinto: definir desde el inicio que todos los mensajes de los hooks sean claves.

### Entrada #24
- Fecha: 2026-11-12
- Integrante: Santiago Cadavid Arboleda
- Herramienta: Claude
- Objetivo: Traducir a español e inglés el historial, el detalle del viaje y la pantalla de ganancias, y cerrar la traducción completa de la app (paso 19D).
- Prompt: "Traducir con el sistema de idioma existente el historial de carreras (filtros de periodo y método de pago, rango de fechas, mensajes vacío y de error, paginación), el detalle del viaje y la pantalla de ganancias. formatDateTime y validateDateRange deben recibir t opcional con español por defecto para no cambiar sus pruebas, y los hooks de historial y ganancias deben guardar claves de error. Incluir una revisión final para encontrar textos sin traducir."
- Enlace a la conversación: [PEGAR ENLACE DE SHARE]
- Resumen de la respuesta: Se crearon los diccionarios del historial en español e inglés, las opciones de filtros agregaron labelKey, formatDateTime y validateDateRange recibieron t opcional (3 pruebas nuevas en inglés), historyService devuelve claves de error y useEarnings y useTripHistory las guardan. TripHistoryItem, TripDetailModal, HistoryScreen y EarningsScreen usan t() y el selector de fechas usa el idioma de la app. Se agregó un comando de PowerShell para detectar textos con tildes sin traducir.
- Qué se usó / modificó / descartó:
  - Usado: t opcional en funciones puras, translateOptions para los filtros, locale del contexto en el selector de fechas y claves de error en los hooks.
  - Modificado: config/history.js agregó labelKey a las opciones; dates.js traduce el sufijo de la hora. [COMPLETAR si la revisión final encontró textos pendientes]
  - Descartado: cambiar el formato de fecha a mm/dd/aaaa en inglés (la app es para Colombia) y eliminar PAYMENT_METHOD_LABELS en este paso (se revisa en el cierre).
- Archivos y commit: mobile/src/i18n/es.history.js, mobile/src/i18n/en.history.js, mobile/src/i18n/index.js, mobile/src/utils/__tests__/history.en.test.js, mobile/src/config/history.js, mobile/src/utils/dates.js, mobile/src/services/historyService.js, mobile/src/hooks/useEarnings.js, mobile/src/hooks/useTripHistory.js, mobile/src/components/trip/TripHistoryItem.js, mobile/src/components/trip/TripDetailModal.js, mobile/src/screens/history/HistoryScreen.js, mobile/src/screens/earnings/EarningsScreen.js — [b0c19ef]
- Verificación: [COMPLETAR TRAS LAS PRUEBAS] npm test con 15 suites y 129 pruebas; historial, detalle y ganancias en inglés con AM/PM; error del rango de fechas en inglés debajo del campo; mensaje vacío en inglés; cambio de idioma aplicado a toda la app; comando de revisión final sin textos de interfaz pendientes.
- Aprendizaje: Entendí cómo organizar un diccionario por áreas sin perder la garantía de que ambos idiomas estén completos, gracias a una prueba automática. También entendí que la traducción incluye formatos (la hora) y no solo textos. Haría distinto: crear el diccionario y la prueba de claves al inicio del proyecto para no tener que migrar pantallas después.