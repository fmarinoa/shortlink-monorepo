# 🔗 Shortlink Admin

> Panel de administración moderno para gestionar enlaces cortos personalizados

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg)](https://tailwindcss.com/)

## 📋 Descripción

Shortlink Admin es una aplicación web moderna y eficiente para gestionar enlaces cortos personalizados. Diseñada específicamente para administrar URLs bajo el dominio `francomarino.dev`, permite crear, editar, eliminar y monitorear enlaces abreviados con una interfaz intuitiva y elegante.

**Ejemplo de uso:** Accede a `francomarino.dev/cv` para ser redirigido a tu currículum completo.

## ✨ Características

- 🎨 **Interfaz moderna** - Diseño dark mode con TailwindCSS
- ⚡ **Rendimiento optimizado** - Construcción con Vite y React 19
- 🔍 **Búsqueda en tiempo real** - Filtra enlaces por slug o URL
- 📊 **Estadísticas integradas** - Visualiza el número de visitas de cada link
- 🔒 **Autenticación segura** - Sistema de API Key con almacenamiento local
- 📱 **Diseño responsivo** - Totalmente adaptable a móviles y tablets
- ✅ **Validación de formularios** - Feedback instantáneo en operaciones
- 🎯 **Gestión completa CRUD** - Crear, leer, actualizar y eliminar enlaces
- 🚀 **Confirmación de eliminación** - Modal de confirmación para prevenir errores
- 📋 **Copiar al portapapeles** - Copia URLs con un solo click
- 💬 **Mensajes toast** - Notificaciones visuales de éxito y error
- 🔄 **Estados de carga** - Feedback visual durante operaciones asíncronas

## 🛠️ Tecnologías

### Core

- **React 19.2** - Biblioteca de UI con React Compiler
- **TypeScript 5.9** - Tipado estático
- **Vite 7.2** - Build tool ultrarrápido

### UI/Styling

- **TailwindCSS 4.1** - Framework CSS utility-first
- **Lucide React** - Iconos modernos y ligeros

### Estado y Datos

- **TanStack Query 5.90** - Gestión de estado servidor
- **Axios 1.13** - Cliente HTTP

### Herramientas de Desarrollo

- **ESLint 9** - Linting de código
- **Prettier 3.8** - Formateo de código
- **React Router 7.13** - Enrutamiento (preparado para futuras expansiones)

## 🚀 Instalación

### Prerrequisitos

- Node.js >= 18
- pnpm (recomendado) o npm

### Pasos

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/tu-usuario/shortlink-admin.git
   cd shortlink-admin
   ```

2. **Instalar dependencias**

   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   ```

   Edita `.env` y configura:

   ```env
   VITE_API_URL="https://tu-api.execute-api.region.amazonaws.com/stage"
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   pnpm dev
   ```

La aplicación estará disponible en `http://localhost:5173`

## ⚙️ Configuración

### API Key

Al iniciar la aplicación por primera vez:

1. Haz clic en el botón **"API Key"** en el header
2. Ingresa tu API Key de AWS API Gateway
3. La clave se almacena localmente en tu navegador

> ⚠️ **Importante:** La API Key se guarda en localStorage. No la compartas ni la expongas públicamente.

### Variables de Entorno

| Variable       | Descripción                | Ejemplo                       |
| -------------- | -------------------------- | ----------------------------- |
| `VITE_API_URL` | URL base de la API backend | `https://api.example.com/dev` |

## 📖 Uso

### Crear un nuevo link

1. Click en **"Nuevo Link"**
2. Ingresa el slug (ej: `cv`, `portfolio`)
3. Ingresa la URL de destino
4. Click en **"Crear Link"**

### Editar un link existente

1. Click en el ícono de lápiz ✏️ en la fila del link
2. Modifica la URL de destino
3. Click en **"Guardar Cambios"**

> 📝 **Nota:** El slug no puede editarse una vez creado.

### Eliminar un link

1. Click en el ícono de papelera 🗑️
2. Confirma la eliminación en el modal
3. El link será eliminado permanentemente

### Copiar link

1. Click en el ícono de copiar 📋 junto al slug
2. El link completo se copiará al portapapeles

## 📁 Estructura del Proyecto

```
shortlink-admin/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes React
│   │   ├── CreateEditModal.tsx
│   │   ├── DeleteModal.tsx
│   │   ├── Header.tsx
│   │   ├── LinkTable.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SetApiKey.tsx
│   │   └── Toast.tsx
│   ├── hooks/          # Custom hooks
│   │   ├── localStorage.ts
│   │   └── useLinks.ts
│   ├── interfaces/     # TypeScript interfaces
│   │   └── Link.ts
│   ├── lib/           # Configuraciones
│   │   ├── api.ts
│   │   └── reactQuery.ts
│   ├── utils/         # Utilidades
│   ├── App.tsx        # Componente principal
│   ├── main.tsx       # Entry point
│   └── index.css      # Estilos globales
├── .env.example       # Template de variables de entorno
├── eslint.config.js   # Configuración ESLint
├── tailwind.config.js # Configuración Tailwind
├── tsconfig.json      # Configuración TypeScript
├── vite.config.ts     # Configuración Vite
└── package.json
```

## 🧪 Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia servidor de desarrollo con hot reload

# Producción
pnpm build        # Compila para producción
pnpm preview      # Preview de build de producción

# Calidad de código
pnpm lint         # Ejecuta ESLint
pnpm prettier     # Formatea código con Prettier
```

## 🎨 Componentes Principales

### `<Header />`

Encabezado con título y botones de acción (API Key, Nuevo Link)

### `<SearchBar />`

Barra de búsqueda en tiempo real por slug o URL

### `<LinkTable />`

Tabla principal que muestra todos los enlaces con:

- Información del link (slug, URL, fecha)
- Estadísticas de visitas
- Acciones (editar, eliminar, copiar)

### `<CreateEditModal />`

Modal para crear nuevos links o editar existentes

### `<DeleteModal />`

Modal de confirmación para eliminar links

### `<SetApiKey />`

Modal para configurar la API Key con visualización tipo password

### `<Toast />`

Componente de notificaciones (éxito/error)

## 🔌 API Backend

Esta aplicación requiere un backend compatible con las siguientes endpoints (ejemplo: https://github.com/fmarinoa/shortlink-api):

```typescript
GET    /links           # Obtener todos los links
POST   /links           # Crear nuevo link
PUT    /links/:slug     # Actualizar link existente
DELETE /links/:slug     # Eliminar link
```

### Formato de respuesta

```typescript
// GET /links
{
  "total": 10,
  "data": [
    {
      "slug": "cv",
      "url": "https://...",
      "visitCount": 42,
      "creationDate": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Autenticación

Todas las peticiones requieren el header:

```
x-api-key: tu-api-key-aqui
```

## 🐛 Manejo de Errores

La aplicación maneja diversos códigos de error HTTP:

| Código  | Mensaje            | Causa Común                      |
| ------- | ------------------ | -------------------------------- |
| 400     | Datos inválidos    | Validación de formulario fallida |
| 401     | No autorizado      | API Key faltante                 |
| 403     | Acceso denegado    | API Key incorrecta               |
| 404     | No encontrado      | Link no existe                   |
| 409     | Conflicto          | Slug duplicado                   |
| 500     | Error del servidor | Error en backend                 |
| Network | Error de conexión  | CORS o API Key faltante          |

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👤 Autor

**Franco Mariño**

- Portfolio: [https://portfolio.francomarino.dev](https://portfolio.francomarino.dev)
- Links: [https://francomarino.dev](https://francomarino.dev)

## 🙏 Agradecimientos

- [React Team](https://react.dev/) por React 19 y el nuevo compilador
- [Evan You](https://github.com/yyx990803) por Vite
- [TanStack](https://tanstack.com/) por React Query
- Comunidad de TailwindCSS

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub
