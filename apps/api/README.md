# 🔗 Shortlink API

API serverless para crear y gestionar enlaces cortos (URL shortener) construida con AWS Lambda, DynamoDB y TypeScript.

[![Deploy to Production](https://github.com/fmarinoa/shortlink-api/actions/workflows/cd.yml/badge.svg)](https://github.com/fmarinoa/shortlink-api/actions/workflows/cd.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange)](https://aws.amazon.com/lambda/)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Prerequisitos](#-prerequisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Deployment](#-deployment)
- [Desarrollo](#-desarrollo)

## ✨ Características

- ⚡ **Serverless**: Desplegado en AWS Lambda con escalabilidad automática
- 🔐 **Autenticación**: Protección mediante API Keys para operaciones administrativas
- ✅ **Validación robusta**: Validación de datos con Zod
- 🏗️ **Clean Architecture**: Separación clara entre capas (Domain, Services, Controllers, Repositories)
- 🎯 **Result Pattern**: Manejo de errores funcional sin excepciones
- 📊 **DynamoDB**: Almacenamiento NoSQL con alta disponibilidad
- 🌐 **Custom Domain**: Soporte para dominio personalizado (producción)
- 🚦 **Rate Limiting**: Control de tráfico y cuotas de uso
- 📝 **TypeScript**: Type-safety en todo el proyecto

## 🏛️ Arquitectura

El proyecto sigue los principios de **Clean Architecture** y **Domain-Driven Design**:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (API Gateway + Lambda Handlers)        │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Application Layer               │
│        (Controllers)                    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Domain Layer                    │
│  (Business Logic + Entities)            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Infrastructure Layer               │
│   (Repositories + External Services)    │
└─────────────────────────────────────────┘
```

### Patrones de Diseño Implementados

- **Repository Pattern**: Abstracción del acceso a datos
- **Dependency Injection**: Inyección de dependencias en constructores
- **Result Pattern**: Manejo explícito de éxitos y errores
- **Factory Pattern**: Creación de entidades de dominio
- **Value Objects**: Entidades inmutables con validación

## 🛠️ Tecnologías

- **Runtime**: Node.js 20.x
- **Lenguaje**: TypeScript 5.x
- **Framework**: Serverless Framework 4
- **Cloud Provider**: AWS
  - Lambda (Compute)
  - DynamoDB (Database)
  - API Gateway (API Management)
  - CloudFormation (IaC)
- **Validación**: Zod
- **AWS SDK**: v3 (modular)
- **Package Manager**: pnpm

## 📦 Prerequisitos

- Node.js >= 20.x
- pnpm >= 8.x
- AWS CLI configurado con credenciales válidas
- Serverless Framework CLI

```bash
npm install -g serverless
```

## 🚀 Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/fmarinoa/shortlink-api.git
cd shortlink-api
```

2. **Instalar dependencias**

```bash
pnpm install
```

3. **Configurar AWS CLI**

```bash
aws configure
```

## ⚙️ Configuración

El proyecto utiliza diferentes configuraciones por ambiente (dev/prod):

### Variables de Entorno

Las variables se configuran automáticamente en `serverless.yml`:

- `TABLE_NAME`: Nombre de la tabla DynamoDB (`LinksDev` o `LinksProd`)
- `DOMAIN`: Dominio base (`francomarino.dev`)

### Configuración de Dominio Personalizado

Para producción, edita en `serverless.yml`:

```yaml
customDomain:
  domainName: tu-dominio.com
  certificateName: "tu-dominio.com"
```

## 💻 Uso

### Crear un enlace corto

```bash
curl -X POST https://api-url/links \
  -H "x-api-key: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "mi-enlace",
    "url": "https://ejemplo.com/pagina-muy-larga"
  }'
```

**Respuesta exitosa:**

```json
{
  "shortUrl": "https://tu-dominio.com/mi-enlace"
}
```

### Redireccionar a URL original

```bash
curl https://tu-dominio.com/mi-enlace
# Redirige automáticamente a: https://ejemplo.com/pagina-muy-larga
```

## 📡 API Endpoints

### `POST /links` (Protegido)

Crea un nuevo enlace corto.

**Headers:**

- `x-api-key`: API Key de administrador (requerido)
- `Content-Type`: application/json

**Body:**

```json
{
  "slug": "mi-slug",
  "url": "https://url-destino.com"
}
```

**Validaciones:**

- `slug`: 3-50 caracteres, solo letras minúsculas, números y guiones
- `url`: URL válida

**Respuestas:**

| Código | Descripción                |
| ------ | -------------------------- |
| 201    | Link creado exitosamente   |
| 400    | Datos de entrada inválidos |
| 409    | El slug ya existe          |
| 500    | Error interno del servidor |

**Ejemplo de error de validación:**

```json
{
  "message": "Invalid link data",
  "errors": [
    {
      "code": "invalid_type",
      "path": ["slug"],
      "message": "Invalid input: expected string, received object"
    }
  ]
}
```

### `GET /{slug}`

Redirige al usuario a la URL original.

**Parámetros:**

- `slug`: Identificador del enlace corto

**Respuestas:**

| Código | Descripción                                               |
| ------ | --------------------------------------------------------- |
| 301    | Redirección permanente (link encontrado)                  |
| 302    | Redirección temporal (link no encontrado, va a portfolio) |

### `GET /`

Redirige al portfolio del desarrollador.

**Respuestas:**

- `302`: Redirige a `https://portfolio.tu-dominio.com`

## 📁 Estructura del Proyecto

```
shortlink-api/
├── src/
│   ├── controllers/          # Controladores HTTP
│   │   ├── LinksController.ts
│   │   └── index.ts
│   ├── domains/              # Entidades y lógica de negocio
│   │   ├── Link.ts           # Entidad Link con validaciones
│   │   ├── errors/           # Errores de dominio
│   │   │   └── LinkErrors.ts
│   │   └── index.ts
│   ├── handler/              # Handlers de Lambda
│   │   └── index.ts
│   ├── lib/                  # Utilidades y clientes externos
│   │   ├── dynamo.ts         # Cliente DynamoDB
│   │   └── index.ts
│   ├── repositories/         # Capa de acceso a datos
│   │   ├── IRepository.ts    # Interface del repositorio
│   │   └── DynamoRepositoryImp.ts
│   ├── services/             # Lógica de aplicación
│   │   ├── ILinksServices.ts
│   │   └── LinksServices.tsImp.ts
│   ├── shared/               # Código compartido
│   │   └── core/
│   │       └── Result.ts     # Result Pattern implementation
│   └── index.ts              # Punto de entrada principal
├── serverless.yml            # Configuración de Serverless
├── tsconfig.json             # Configuración de TypeScript
├── package.json              # Dependencias y scripts
└── README.md                 # Este archivo
```

### Responsabilidades por Capa

#### 🎯 **Domain Layer** (`domains/`)

- Entidades de negocio (`Link`)
- Reglas de validación con Zod
- Errores de dominio
- Sin dependencias externas

#### 🔧 **Services Layer** (`services/`)

- Orquestación de casos de uso
- Lógica de aplicación
- Coordinación entre repositorios y dominio

#### 🎮 **Controllers Layer** (`controllers/`)

- Manejo de requests HTTP
- Transformación de datos
- Respuestas HTTP estandarizadas

#### 💾 **Infrastructure Layer** (`repositories/`, `lib/`)

- Acceso a DynamoDB
- Implementación de interfaces de repositorio
- Clientes de servicios externos

#### 🔗 **Handlers** (`handler/`)

- Adaptadores de AWS Lambda
- Inyección de dependencias inicial

## 🚀 Deployment

### Desarrollo

```bash
pnpm deploy:dev
```

Despliega a ambiente de desarrollo:

- Sin dominio personalizado
- Tabla: `LinksDev`
- Stage: `dev`

### Producción

```bash
pnpm deploy:prod
```

Despliega a ambiente de producción:

- Con dominio personalizado
- Tabla: `LinksProd`
- Stage: `prod`

### Obtener API Key

Después del deployment, obtén la API Key:

```bash
aws apigateway get-api-keys --include-values --query "items[?name=='AdminKeyDev'].value"
```

## 🛠️ Desarrollo

### Scripts disponibles

```bash
# Formatear código
pnpm prettier

# Desplegar a desarrollo
pnpm deploy:dev

# Desplegar a producción
pnpm deploy:prod
```

## 📊 Cuotas y Límites

Configuración en API Gateway:

- **Cuota mensual**: 50 requests/mes
- **Rate limit**: 100 requests/segundo
- **Burst limit**: 200 requests simultáneas

Para modificar, edita en `serverless.yml`:

```yaml
usagePlan:
  quota:
    limit: 1000
    period: MONTH
  throttle:
    rateLimit: 200
    burstLimit: 400
```

## 🧪 Testing

```bash
# TODO: Implementar tests
pnpm test
```

## 📝 Notas Técnicas

### Result Pattern

El proyecto usa Result Pattern para manejar errores de forma explícita:

```typescript
const result = await service.createLink(link);

if (!result.isSuccess) {
  return handleError(result.getErrorValue());
}

return handleSuccess(result.getValue());
```

### Validación con Zod

Las entidades de dominio se validan automáticamente:

```typescript
const linkResult = Link.create({ slug, url });
// Si falla, linkResult.getErrorValue() contiene errores detallados de Zod
```

### DynamoDB Schema

**Tabla**: `Links{Dev|Prod}`

| Campo        | Tipo   | Descripción                    |
| ------------ | ------ | ------------------------------ |
| slug (PK)    | String | Identificador único del enlace |
| url          | String | URL de destino                 |
| creationDate | Number | Timestamp de creación          |
| clicks       | Number | Contador de clics              |

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

ISC License - ver el archivo [LICENSE](LICENSE) para detalles.

## 👤 Autor

**Franco Marino**

- GitHub: [@fmarinoa](https://francomarino.dev/github)
- Portfolio: [portfolio.francomarino.dev](https://francomarino.dev)

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub!
