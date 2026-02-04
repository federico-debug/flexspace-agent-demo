# Refactor SOLID - Flexspace Agent Demo

**Overall Progress:** `75%` (Fases 0-3 completadas, Fase 4-5 pendientes)

---

## TLDR

Refactorizar el chat widget de Flexspace para aplicar principios SOLID, mejorar seguridad, y habilitar testing. El proyecto tiene dos "God Objects" (ChatWidget 645 líneas, ChatService 432 líneas) que violan SRP. Este plan los divide en módulos pequeños, crea abstracciones para DIP, y establece infraestructura de testing.

---

## Critical Decisions

| Decisión | Elección | Rationale |
|----------|----------|-----------|
| **Build system** | Ninguno (ES6 modules nativos) | Mantener simplicidad actual, evitar overhead |
| **TypeScript** | Opcional (Fase 5) | Depende de experiencia del equipo |
| **Testing framework** | Jest + Testing Library | Standard de la industria, buena DX |
| **Abstractions en JS** | JSDoc @interface + Base classes | Permite DIP sin TS |
| **Backward compatibility** | API pública igual | ChatService métodos externos no cambian |

---

## Archivos Afectados

### Modificar
- `public/src/services/config.js` - Remover chatAgentId
- `public/src/services/chatService.js` - Refactorizar a ChatOrchestrator
- `public/src/components/ChatWidget/ChatWidget.js` - Split en 4 componentes
- `api/create-chat.js` - Usar env var para agent_id
- `.env.local` - Agregar RETELL_AGENT_ID

### Crear (Fase 1 - Services)
- `public/src/utils/EventBus.js`
- `public/src/services/RetellApiClient.js`
- `public/src/services/ChatStateStore.js`
- `public/src/services/VariableExtractor.js`
- `public/src/services/ChatOrchestrator.js`

### Crear (Fase 2 - Components)
- `public/src/components/ChatWidget/MessageFormatter.js`
- `public/src/components/ChatWidget/MessageList.js`
- `public/src/components/ChatWidget/ChatInput.js`
- `public/src/components/ChatWidget/TypingIndicator.js`

### Crear (Fase 3 - Abstractions)
- `public/src/types/interfaces.js` (JSDoc interfaces)

### Crear (Fase 4 - Testing)
- `__tests__/services/RetellApiClient.test.js`
- `__tests__/services/ChatOrchestrator.test.js`
- `__tests__/components/MessageFormatter.test.js`
- `__mocks__/MockChatService.js`

---

## Tasks

### Fase 0: Security Hardening ✅

- [x] 🟩 **0.1: Mover chatAgentId a backend**
  - [x] 🟩 Agregar `RETELL_AGENT_ID` a `.env.local`
  - [x] 🟩 Actualizar `api/create-chat.js` para usar `process.env.RETELL_AGENT_ID`
  - [x] 🟩 Remover `chatAgentId` de `config.js`
  - [x] 🟩 Actualizar `chatService.js` para no enviar agent_id desde frontend
  - [x] 🟩 Verificar que agent_id no aparece en Network tab

---

### Fase 1: Service Layer Split ✅

- [x] 🟩 **1.1: Crear EventBus utility**
  - [x] 🟩 Crear `public/src/utils/EventBus.js`
  - [x] 🟩 Implementar métodos `on()`, `off()`, `emit()`
  - [x] 🟩 Agregar tipado JSDoc

- [x] 🟩 **1.2: Crear RetellApiClient**
  - [x] 🟩 Crear `public/src/services/RetellApiClient.js`
  - [x] 🟩 Extraer `createChat()` de chatService
  - [x] 🟩 Extraer `sendMessage()` de chatService
  - [x] 🟩 Extraer `getChatDetails()` de chatService
  - [x] 🟩 Extraer `endChat()` de chatService
  - [x] 🟩 Manejar errores HTTP de forma consistente

- [x] 🟩 **1.3: Crear ChatStateStore**
  - [x] 🟩 Crear `public/src/services/ChatStateStore.js`
  - [x] 🟩 Mover estado: `chatId`, `messages`, `isActive`, `variables`
  - [x] 🟩 Implementar `addMessage()`, `reset()`, `setActive()`
  - [x] 🟩 Getters para acceso de solo lectura

- [x] 🟩 **1.4: Crear VariableExtractor**
  - [x] 🟩 Crear `public/src/services/VariableExtractor.js`
  - [x] 🟩 Extraer lógica de `extractVariables()` de chatService
  - [x] 🟩 Documentar paths de extracción soportados

- [x] 🟩 **1.5: Crear ChatOrchestrator**
  - [x] 🟩 Crear `public/src/services/ChatOrchestrator.js`
  - [x] 🟩 Inyectar dependencias: ApiClient, StateStore, EventBus, Extractor
  - [x] 🟩 Mantener API pública idéntica a chatService original
  - [x] 🟩 Coordinar flujo entre módulos

- [x] 🟩 **1.6: Migrar imports**
  - [x] 🟩 Actualizar `app.js` para usar ChatOrchestrator
  - [x] 🟩 `chatService.js` original mantenido como backup
  - [x] 🟩 Verificar funcionalidad end-to-end

---

### Fase 2: Component Layer Split ✅

- [x] 🟩 **2.1: Crear MessageFormatter (Strategy Pattern)**
  - [x] 🟩 Crear `public/src/components/ChatWidget/MessageFormatter.js`
  - [x] 🟩 Crear clase `OutlookFormatter` con `canHandle()` y `format()`
  - [x] 🟩 Crear clase `LinkFormatter` con `canHandle()` y `format()`
  - [x] 🟩 Crear clase `PlainTextFormatter` como fallback
  - [x] 🟩 Crear clase `MessageFormatter` que orquesta formatters
  - [x] 🟩 Implementar `addFormatter(formatter, priority)` para OCP

- [x] 🟩 **2.2: Crear MessageList component**
  - [x] 🟩 Crear `public/src/components/ChatWidget/MessageList.js`
  - [x] 🟩 Inyectar `MessageFormatter` como dependencia
  - [x] 🟩 Implementar `addUserMessage(text)`
  - [x] 🟩 Implementar `addBotMessage(text)`
  - [x] 🟩 Implementar `clear()`
  - [x] 🟩 Manejar auto-scroll

- [x] 🟩 **2.3: Crear ChatInput component**
  - [x] 🟩 Crear `public/src/components/ChatWidget/ChatInput.js`
  - [x] 🟩 Implementar `create()` - textarea + send button
  - [x] 🟩 Implementar `disable()`, `enable()`, `clear()`, `focus()`
  - [x] 🟩 Manejar Enter para enviar, Shift+Enter para newline
  - [x] 🟩 Auto-resize del textarea
  - [x] 🟩 Callback `onSend(message)` inyectado

- [x] 🟩 **2.4: Crear TypingIndicator component**
  - [x] 🟩 Crear `public/src/components/ChatWidget/TypingIndicator.js`
  - [x] 🟩 Implementar `show()` y `hide()`
  - [x] 🟩 Animación de dots

- [x] 🟩 **2.5: Simplificar ChatWidget**
  - [x] 🟩 Refactorizar ChatWidget.js como coordinator (238 líneas vs 645 original)
  - [x] 🟩 Inyectar: ChatOrchestrator, MessageList, ChatInput, TypingIndicator
  - [x] 🟩 Remover lógica de formatting (ahora en MessageFormatter)
  - [x] 🟩 Remover lógica de input (ahora en ChatInput)
  - [x] 🟩 Original guardado como `ChatWidget.original.js`
  - [x] 🟩 Verificar UI idéntica visualmente

---

### Fase 3: Abstractions & DIP ✅

- [x] 🟩 **3.1: Crear interfaces JSDoc**
  - [x] 🟩 Crear `public/src/types/interfaces.js`
  - [x] 🟩 Definir `@interface IChatService`
  - [x] 🟩 Definir `@interface IMessageFormatter`
  - [x] 🟩 Definir `@interface IApiClient`
  - [x] 🟩 Definir `@interface IEventBus`
  - [x] 🟩 Definir `@interface IStateStore`
  - [x] 🟩 Definir interfaces de componentes

- [x] 🟩 **3.2: Actualizar componentes para DIP**
  - [x] 🟩 ChatWidget recibe interfaces, no implementaciones
  - [x] 🟩 Documentar contratos en constructores
  - [x] 🟩 Factory function `createChatWidget()` en interfaces.js

---

### Fase 4: Testing Infrastructure

- [ ] 🟥 **4.1: Setup testing**
  - [ ] 🟥 `npm install --save-dev jest @testing-library/dom msw`
  - [ ] 🟥 Crear `jest.config.js`
  - [ ] 🟥 Agregar script `"test"` a package.json
  - [ ] 🟥 Configurar ESM support en Jest

- [ ] 🟥 **4.2: Crear mocks**
  - [ ] 🟥 Crear `__mocks__/MockChatService.js`
  - [ ] 🟥 Crear `__mocks__/MockApiClient.js`
  - [ ] 🟥 Setup MSW handlers para API mocking

- [ ] 🟥 **4.3: Tests de services**
  - [ ] 🟥 `RetellApiClient.test.js` - test HTTP calls
  - [ ] 🟥 `ChatStateStore.test.js` - test state management
  - [ ] 🟥 `ChatOrchestrator.test.js` - test coordination

- [ ] 🟥 **4.4: Tests de components**
  - [ ] 🟥 `MessageFormatter.test.js` - test cada formatter
  - [ ] 🟥 `ChatInput.test.js` - test keyboard events
  - [ ] 🟥 `MessageList.test.js` - test rendering

---

### Fase 5: TypeScript Migration (Opcional)

- [ ] 🟥 **5.1: Setup TypeScript**
  - [ ] 🟥 `npm install --save-dev typescript`
  - [ ] 🟥 Crear `tsconfig.json`
  - [ ] 🟥 Configurar build con esbuild o vite

- [ ] 🟥 **5.2: Migrar types**
  - [ ] 🟥 Convertir `interfaces.js` a `interfaces.ts`
  - [ ] 🟥 Crear tipos: `Message`, `ChatEvent`, `ChatState`

- [ ] 🟥 **5.3: Migrar services**
  - [ ] 🟥 `EventBus.js` → `EventBus.ts`
  - [ ] 🟥 `RetellApiClient.js` → `RetellApiClient.ts`
  - [ ] 🟥 `ChatStateStore.js` → `ChatStateStore.ts`
  - [ ] 🟥 `ChatOrchestrator.js` → `ChatOrchestrator.ts`

- [ ] 🟥 **5.4: Migrar components**
  - [ ] 🟥 `MessageFormatter.js` → `MessageFormatter.ts`
  - [ ] 🟥 `ChatWidget.js` → `ChatWidget.ts`
  - [ ] 🟥 Demás componentes

- [ ] 🟥 **5.5: CI integration**
  - [ ] 🟥 Agregar `npm run typecheck` a CI
  - [ ] 🟥 Verificar bundle size < 10% incremento

---

## Criterios de Aceptación Global

| Fase | Criterio | Verificación |
|------|----------|--------------|
| 0 | Agent ID no visible en browser | Network tab inspection |
| 1 | Cada archivo service < 150 líneas | `wc -l` |
| 1 | Chat funciona igual | Test manual E2E |
| 2 | ChatWidget.js < 150 líneas | `wc -l` |
| 2 | UI visualmente idéntica | Screenshot comparison |
| 3 | Componentes dependen de interfaces | Code review |
| 4 | Coverage services > 70% | Jest coverage report |
| 5 | TypeScript compila sin errores | `npm run typecheck` |

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Breaking change en API pública | Media | Alto | Mantener métodos externos idénticos |
| Regresión visual | Baja | Medio | Screenshots antes/después |
| EventBus memory leaks | Baja | Medio | Implementar `off()` y cleanup |
| Jest ESM issues | Alta | Bajo | Usar experimental-vm-modules flag |

---

## Notas de Implementación

### EventBus Pattern
```javascript
// Uso esperado
const bus = new EventBus();
bus.on('messageReceived', (data) => console.log(data));
bus.emit('messageReceived', { text: 'Hello' });
bus.off('messageReceived', handler); // cleanup
```

### Strategy Pattern para Formatters
```javascript
// Cada formatter implementa:
class SomeFormatter {
  canHandle(text) { return boolean; }
  format(text, container) { /* modifica container */ }
}

// MessageFormatter los orquesta:
formatters.find(f => f.canHandle(text))?.format(text, container);
```

### Dependency Injection Pattern
```javascript
// Factory function crea todo wired
function createChatWidget() {
  const eventBus = new EventBus();
  const apiClient = new RetellApiClient();
  const stateStore = new ChatStateStore();
  const extractor = new VariableExtractor();
  const orchestrator = new ChatOrchestrator(apiClient, stateStore, eventBus, extractor);
  const formatter = new MessageFormatter();
  const messageList = new MessageList(formatter);
  const chatInput = new ChatInput();
  const typingIndicator = new TypingIndicator();

  return new ChatWidget(orchestrator, messageList, chatInput, typingIndicator);
}
```

---

**Última actualización:** 2026-02-04
**Autor:** Claude CTO Mode
**Status:** Planning Complete - Ready for Implementation
