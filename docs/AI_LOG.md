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