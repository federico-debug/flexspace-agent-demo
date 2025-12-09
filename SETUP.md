# Setup Instructions

## Environment Variables

Para que el chat funcione en producción (Vercel), necesitas configurar las variables de entorno:

### En Vercel Dashboard:

1. Ve a tu proyecto en Vercel
2. Click en "Settings" → "Environment Variables"
3. Agrega la siguiente variable:

```
RETELL_API_KEY=key_91dba3204858e9738dcdeed28fca
```

4. Asegúrate de seleccionar "Production", "Preview" y "Development"
5. Haz un nuevo deploy para que tome los cambios

### Para desarrollo local:

El archivo `.env.local` ya está creado con la API key. Para probar localmente con Vercel Dev:

```bash
npm install -g vercel
vercel dev
```

Esto iniciará un servidor local en `http://localhost:3000` con las serverless functions funcionando.

## Arquitectura

```
Frontend (Chat Widget)
    ↓
Vercel Serverless Functions (/api/)
    ↓
Retell AI API
```

Las funciones serverless mantienen tu API Key segura y actúan como proxy entre el frontend y la API de Retell.

## Testing

1. Abre el navegador en `http://localhost:3000` (con vercel dev)
2. Click en el botón flotante de chat
3. Escribe un mensaje
4. Deberías ver la respuesta de Lauren AI

## Troubleshooting

Si recibes errores 404 o 500:
- Verifica que la API Key esté configurada correctamente en Vercel
- Revisa los logs en Vercel Dashboard → Functions → Logs
- Asegúrate de que el agent ID sea correcto en `config.js`
