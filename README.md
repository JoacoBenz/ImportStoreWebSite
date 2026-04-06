# Import Store Argentina

Tienda web de tecnología importada con integración de WhatsApp para carga automática de stock.

## Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Base de datos:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Parseo de stock:** Anthropic Claude API
- **Bot de WhatsApp:** Meta Cloud API (WhatsApp Business)
- **Deploy:** Vercel

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ir a **Authentication > Settings** y habilitar email/password
4. Crear un usuario admin en **Authentication > Users** con email y password

### 3. Variables de entorno

Copiar `.env.example` a `.env.local` y completar los valores:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase |
| `ANTHROPIC_API_KEY` | API key de Anthropic |
| `WHATSAPP_VERIFY_TOKEN` | Token personalizado para verificar el webhook |
| `WHATSAPP_ACCESS_TOKEN` | Access token de Meta Cloud API |
| `WHATSAPP_PHONE_NUMBER_ID` | ID del número de WhatsApp Business |
| `WHATSAPP_AUTHORIZED_NUMBER` | Número autorizado (el de Nati) con formato +549... |

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) para la tienda y [http://localhost:3000/admin](http://localhost:3000/admin) para el panel de administración.

## Configurar WhatsApp Business

1. Crear una app en [Meta for Developers](https://developers.facebook.com/)
2. Agregar el producto "WhatsApp" a la app
3. Configurar el webhook con:
   - URL: `https://tu-dominio.com/api/webhook/whatsapp`
   - Token de verificación: el mismo que `WHATSAPP_VERIFY_TOKEN`
   - Suscribirse a: `messages`
4. Obtener el `WHATSAPP_ACCESS_TOKEN` y `WHATSAPP_PHONE_NUMBER_ID` desde el dashboard

## Deploy en Vercel

1. Conectar el repositorio a Vercel
2. Configurar las variables de entorno en Vercel (las mismas de `.env.local`)
3. Deploy automático en cada push

## Flujo de uso

### Carga de stock por WhatsApp
1. Nati envía el listado de productos por WhatsApp
2. El bot parsea el mensaje con IA y muestra un preview
3. Nati elige "Reemplazar stock" o "Agregar al stock"
4. Los productos se actualizan en la web automáticamente

### Carga manual desde el panel admin
1. Ir a `/admin/stock`
2. Pegar el mensaje de la proveedora en el textarea
3. Click en "Analizar con IA"
4. Revisar y editar los productos parseados
5. Confirmar la acción (reemplazar o agregar)

### Actualizar tipo de cambio
- Por WhatsApp: enviar "dolar" y luego el nuevo valor
- Desde el admin: ir a `/admin/configuracion`
