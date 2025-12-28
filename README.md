# Simula Tu Sonrisa

Aplicación web para simular tratamientos dentales utilizando inteligencia artificial. Desarrollada para la clínica del Dr. Diego Serrano.

## Cómo funciona la aplicación

### Descripción general

**Simula Tu Sonrisa** es una herramienta de visualización que permite a los pacientes ver una simulación de cómo quedaría su sonrisa tras diferentes tratamientos dentales. La aplicación utiliza inteligencia artificial generativa de Google (Gemini) para crear imágenes realistas del resultado esperado.

### Flujo de uso

1. **Subida de imagen**: El paciente o profesional sube una fotografía del rostro mostrando la sonrisa actual
2. **Selección de tratamiento**: Se elige el tipo de tratamiento dental a simular (carillas, blanqueamiento, ortodoncia, etc.)
3. **Procesamiento con IA**: La imagen se envía a la API de Google Gemini junto con instrucciones específicas del tratamiento
4. **Resultado**: La IA genera una imagen modificada mostrando cómo quedaría la sonrisa tras el tratamiento

### Modelo de IA utilizado

La aplicación utiliza **Google Gemini**, específicamente modelos con capacidad de generación y edición de imágenes.

Por defecto, el modelo configurado es:

```
gemini-2.5-flash-image
```

Este modelo (conocido como **Nano Banana**) está optimizado para:
- Generación rápida de imágenes
- Edición fotorrealista
- Procesamiento eficiente (menor coste por solicitud)

### Cambiar el modelo de Gemini

Puedes cambiar el modelo utilizado mediante la variable de entorno `GEMINI_MODEL`. Hay dos modelos disponibles para generación de imágenes:

**Para cambiar el modelo**, modifica el archivo `.env`:

```env
# Cambiar a Nano Banana Pro para mayor calidad
GEMINI_MODEL=gemini-3-pro-image-preview
```

**Modelos disponibles para generación de imágenes:**

| Modelo | Nombre | Descripción |
|--------|--------|-------------|
| `gemini-2.5-flash-image` | Nano Banana | Rápido y económico (recomendado por defecto). Optimizado para alta velocidad y bajo coste. |
| `gemini-3-pro-image-preview` | Nano Banana Pro | Mayor calidad y precisión. Utiliza razonamiento avanzado ("Thinking") para seguir instrucciones complejas y producir imágenes de alta fidelidad. Más lento y costoso. |

**Recomendaciones:**
- Usa `gemini-2.5-flash-image` para procesamiento rápido y económico
- Usa `gemini-3-pro-image-preview` cuando necesites resultados de máxima calidad o instrucciones muy específicas

### Consideraciones técnicas

- **Privacidad**: Las imágenes se procesan a través de la API de Google. Consulta la [política de privacidad de Google AI](https://ai.google.dev/terms) para más información
- **Calidad de entrada**: Para mejores resultados, utiliza fotografías bien iluminadas con la sonrisa claramente visible
- **Tiempo de procesamiento**: Cada simulación tarda entre 5-15 segundos dependiendo del modelo y la carga del servidor

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
  - Descarga desde: https://nodejs.org/es
  - Recomendamos la versión LTS (Long Term Support)

- **Git** (para clonar el repositorio)
  - Descarga desde: https://git-scm.com/downloads

## Instalación

### 1. Clonar el repositorio

Abre una terminal (Símbolo del sistema en Windows o Terminal en Mac/Linux) y ejecuta:

```bash
git clone https://github.com/andres-monge/simula-tu-sonrisa.git
cd simula-tu-sonrisa
```

### 2. Instalar dependencias

Dentro de la carpeta del proyecto, ejecuta:

```bash
npm install
```

Este proceso puede tardar unos minutos en completarse.

## Configuración de la API de Gemini

La aplicación utiliza **Google Gemini AI** para generar las simulaciones de sonrisas. Necesitas obtener una clave de API (API Key) de Google.

### Paso 1: Obtener tu clave de API de Gemini

1. Ve a **Google AI Studio**: https://aistudio.google.com/

2. Inicia sesión con tu cuenta de Google

3. Haz clic en **"Get API Key"** (Obtener clave de API) en el menú lateral izquierdo

4. Haz clic en **"Create API Key"** (Crear clave de API)

5. Selecciona un proyecto de Google Cloud existente o crea uno nuevo

6. **Copia la clave de API** que se genera. Es una cadena de texto larga que comienza normalmente con "AIza..."

> **Importante**: Guarda esta clave en un lugar seguro. No la compartas públicamente ni la subas a repositorios públicos.

### Paso 2: Configurar las variables de entorno

Crea un archivo llamado `.env` en la raíz del proyecto (la carpeta principal `simula-tu-sonrisa`).

Puedes crear el archivo de las siguientes maneras:

**En Windows:**
```bash
type nul > .env
```

**En Mac/Linux:**
```bash
touch .env
```

Abre el archivo `.env` con un editor de texto (Bloc de notas, VS Code, etc.) y añade el siguiente contenido:

```env
# Clave de API de Gemini (OBLIGATORIO)
AI_INTEGRATIONS_GEMINI_API_KEY=tu-clave-de-api-aqui

# Modelo de Gemini a utilizar (OPCIONAL - este es el valor por defecto)
GEMINI_MODEL=gemini-2.5-flash-image

# Secreto de sesión (OBLIGATORIO para producción)
SESSION_SECRET=una-cadena-secreta-larga-y-aleatoria
```

**Reemplaza** `tu-clave-de-api-aqui` con la clave de API que copiaste en el paso anterior.

**Ejemplo:**
```env
AI_INTEGRATIONS_GEMINI_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
GEMINI_MODEL=gemini-2.5-flash-image
SESSION_SECRET=mi-super-secreto-seguro-12345
```

## Ejecutar la aplicación

### Modo desarrollo (para pruebas locales)

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5000**

### Modo producción

Para crear una versión optimizada para producción:

```bash
npm run build
npm start
```

## Uso de la aplicación

1. Abre el navegador y ve a `http://localhost:5000`

2. Sube una fotografía de una sonrisa

3. Selecciona el tipo de tratamiento dental que deseas simular

4. La IA generará una imagen con la simulación del resultado

## Solución de problemas comunes

### Error: "GEMINI_API_KEY not found" o similar

- Verifica que el archivo `.env` existe en la carpeta raíz del proyecto
- Comprueba que la variable `AI_INTEGRATIONS_GEMINI_API_KEY` está correctamente escrita
- Asegúrate de que no hay espacios antes o después del signo `=`

### Error: "npm: command not found"

- Node.js no está instalado correctamente
- Reinicia la terminal después de instalar Node.js
- En Windows, puede que necesites añadir Node.js al PATH del sistema

### La aplicación no carga en el navegador

- Verifica que la terminal muestra que el servidor está en ejecución
- Comprueba que estás accediendo a `http://localhost:5000` (no https)
- Asegúrate de que el puerto 5000 no está siendo usado por otra aplicación

### Error de cuota de API excedida

- Google Gemini tiene límites de uso gratuito
- Consulta tu panel en https://aistudio.google.com/ para ver el uso
- Considera actualizar a un plan de pago si necesitas más capacidad

## Estructura del proyecto

```
simula-tu-sonrisa/
├── client/          # Código del frontend (React)
├── server/          # Código del backend (Express)
├── shared/          # Código compartido (tipos, esquemas)
├── .env             # Variables de entorno (debes crear este archivo)
├── package.json     # Dependencias del proyecto
└── README.md        # Este archivo
```

## Soporte

Si tienes problemas con la configuración o el uso de la aplicación, contacta con el desarrollador a través del repositorio de GitHub.

---

Desarrollado para [Dr. Diego Serrano](https://www.doctordiegoserrano.com/)
