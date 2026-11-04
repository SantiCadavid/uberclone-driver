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