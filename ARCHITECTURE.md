# Arquitectura del Proyecto

## Estructura del Proyecto

```
flexspace-agent-demo/
├── public/                  # Directorio raíz servible
│   ├── index.html           # Punto de entrada
│   ├── logo.svg
│   ├── favicon.svg
│   └── src/
│       ├── components/      # Componentes UI (cada uno con su .js y .css)
│       │   ├── Header/
│       │   │   ├── Header.js
│       │   │   └── Header.css
│       │   ├── VoiceWave/
│       │   │   ├── VoiceWave.js
│       │   │   └── VoiceWave.css
│       │   ├── StatusBadge/
│       │   │   ├── StatusBadge.js
│       │   │   └── StatusBadge.css
│       │   ├── CallControls/
│       │   │   ├── CallControls.js
│       │   │   └── CallControls.css
│       │   ├── StatusDisplay/
│       │   │   ├── StatusDisplay.js
│       │   │   └── StatusDisplay.css
│       │   └── ExampleQuestions/
│       │       ├── ExampleQuestions.js
│       │       └── ExampleQuestions.css
│       ├── services/        # Lógica de negocio y APIs
│       │   ├── retellClient.js
│       │   └── config.js
│       ├── utils/           # Utilidades
│       │   └── timer.js
│       ├── styles/          # Estilos globales
│       │   ├── variables.css
│       │   ├── animations.css
│       │   └── global.css
│       └── app.js           # Orchestrator principal
├── examples/
├── index.html.backup        # Backup del archivo original
└── docs/
```

## Componentes

### Header
- **Responsabilidad**: Mostrar el logo de la aplicación
- **Archivos**: `Header.js`, `Header.css`
- **Props**: Ninguna

### StatusBadge
- **Responsabilidad**: Mostrar badge "LIVE" con punto pulsante
- **Archivos**: `StatusBadge.js`, `StatusBadge.css`
- **Props**: `text` (opcional)
- **Métodos**: `setText(newText)`

### VoiceWave
- **Responsabilidad**: Animación de ondas de voz (4 círculos concéntricos)
- **Archivos**: `VoiceWave.js`, `VoiceWave.css`
- **Props**: Ninguna

### CallControls
- **Responsabilidad**: Botones de control de llamada (Start/End)
- **Archivos**: `CallControls.js`, `CallControls.css`
- **Props**: `onStartCall`, `onEndCall` (callbacks)
- **Métodos**:
  - `setConnecting(boolean)` - Mostrar estado "Connecting..."
  - `setConnected(boolean)` - Cambiar entre botones Start/End

### StatusDisplay
- **Responsabilidad**: Mostrar estados de la aplicación (inicial/conectado/error)
- **Archivos**: `StatusDisplay.js`, `StatusDisplay.css`
- **Props**: Ninguna
- **Métodos**:
  - `showInitial()` - Mostrar estado inicial
  - `showConnected()` - Mostrar estado conectado
  - `showError(message)` - Mostrar error
  - `hideError()` - Ocultar error
  - `updateTimer(duration)` - Actualizar timer

### ExampleQuestions
- **Responsabilidad**: Mostrar preguntas de ejemplo como chips
- **Archivos**: `ExampleQuestions.js`, `ExampleQuestions.css`
- **Props**: `questions` (array), `onQuestionClick` (callback)

## Servicios

### RetellClientService
- **Responsabilidad**: Gestionar integración con Retell AI API
- **Archivo**: `retellClient.js`
- **Métodos**:
  - `initialize()` - Inicializar cliente
  - `on(event, callback)` - Registrar callbacks
  - `startCall()` - Iniciar llamada
  - `stopCall()` - Terminar llamada
- **Eventos**: `callStarted`, `callEnded`, `error`, `agentStartTalking`, `agentStopTalking`, `update`

### Config
- **Responsabilidad**: Configuración centralizada
- **Archivo**: `config.js`
- **Exports**: `CONFIG` (objeto con publicKey, agentId, apiUrl)

## Utilidades

### Timer
- **Responsabilidad**: Gestionar duración de llamada
- **Archivo**: `timer.js`
- **Métodos**:
  - `start()` - Iniciar timer
  - `stop()` - Detener timer
  - `getDuration()` - Obtener duración actual

## App Orchestrator

### App
- **Responsabilidad**: Coordinar todos los componentes y servicios
- **Archivo**: `app.js`
- **Métodos**:
  - `init()` - Inicializar aplicación
  - `setupComponents()` - Montar componentes en el DOM
  - `setupRetellService()` - Configurar callbacks del servicio
  - `handleStartCall()` - Manejar inicio de llamada
  - `handleEndCall()` - Manejar fin de llamada
  - `handleQuestionClick(question)` - Manejar click en pregunta
  - `showConnectedState()` - Mostrar UI conectada
  - `resetToInitialState()` - Reset a estado inicial

## Flujo de Datos

```
Usuario interactúa con UI
       ↓
CallControls / ExampleQuestions
       ↓
App.js (orchestrator)
       ↓
RetellClientService
       ↓
Retell AI API
       ↓
Callbacks → App.js → Actualiza componentes
```

## Estilos

### variables.css
- Variables CSS globales (colores, tipografía, spacing, etc.)

### animations.css
- Animaciones keyframes (slowPulse, pulse, fadeIn, fadeOut)

### global.css
- Estilos globales (reset, typography, layout, utility classes)

### Component CSS
- Cada componente tiene sus estilos específicos en su propia carpeta

## Principios de Diseño

1. **Separación de Responsabilidades**
   - Componentes: Solo UI y presentación
   - Servicios: Lógica de negocio y API calls
   - Utils: Funciones auxiliares

2. **Modularidad**
   - Cada componente es autónomo
   - CSS específico junto al componente
   - Fácil de mantener y testear

3. **ES6 Modules**
   - Import/Export para modularidad
   - No hay variables globales
   - Dependencias explícitas

4. **Componentes Reutilizables**
   - Todos los componentes son reutilizables
   - Props configurables
   - Métodos públicos bien definidos

## Cómo Ejecutar

1. Usar un servidor local (requerido para ES6 modules):
   ```bash
   # Opción 1: Python
   cd public && python3 -m http.server 8080

   # Opción 2: npx serve
   npx serve public

   # Opción 3: Node http-server
   npx http-server public
   ```
2. Abrir en el navegador: `http://localhost:8080`

**Nota**: No se puede abrir directamente el archivo HTML debido a las restricciones CORS de los ES6 modules. Debe usar un servidor HTTP.

## Agregar Nuevos Componentes

1. Crear carpeta en `public/src/components/NuevoComponente/`
2. Crear archivos:
   - `NuevoComponente.js` (con clase y métodos render/mount)
   - `NuevoComponente.css` (estilos específicos)
3. Importar en `public/src/app.js`
4. Agregar link al CSS en `public/index.html`:
   ```html
   <link rel="stylesheet" href="src/components/NuevoComponente/NuevoComponente.css" />
   ```

## Próximas Mejoras

- [ ] Mover API keys a variables de entorno
- [ ] Agregar build process (webpack/vite)
- [ ] Agregar tests unitarios
- [ ] Implementar error boundary
- [ ] Agregar TypeScript
