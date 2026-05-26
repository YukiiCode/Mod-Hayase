# Extensión de AnimeFLV para Hayase / Miru 🌟

Esta es una extensión premium e independiente para **Hayase** (anteriormente conocido como **Miru**), diseñada específicamente para la comunidad hispanohablante. Permite buscar y reproducir anime directamente desde el portal **AnimeFLV** de forma descentralizada y ultra-rápida.

---

## Características Principales 🚀

- ⚡ **Scraping Directo y Descentralizado:** Realiza las consultas y el parseo del contenido directamente en tu dispositivo. No depende de APIs intermedias externas en la nube que puedan apagarse o fallar.
- ⚙️ **Dominio Base Configurable:** Si AnimeFLV cambia de dominio (por ejemplo, a `www3.animeflv.net`, `animeflv.vc`, etc.), puedes cambiar la URL base directamente desde los ajustes de la extensión en Hayase sin tocar el código.
- 🎬 **Servidor de Video Preferido:** Permite definir un orden de preferencia para los servidores de video (como **MEGA**, **Streamwish**, **Streamtape** y **Okru**). La extensión elegirá automáticamente tu servidor preferido si está disponible, y si no, usará un fallback inteligente al primer servidor que funcione.
- 📂 **Paginación e Historial Completos:** Soporte total de paginación en búsquedas y listado de últimos capítulos en la página principal.

---

## Estructura del Repositorio Local 📂

- `animeflv.js`: Contiene todo el código de la extensión en JavaScript compatible con la API de extensiones de Hayase/Miru.
- `index.json`: Manifiesto del repositorio local que sirve de puente para que Hayase reconozca e instale la extensión.

---

## Guía de Instalación y Pruebas Locales 🛠️

Para cargar esta extensión en tu aplicación local de Hayase, puedes utilizar cualquiera de estos dos métodos:

### Método 1: Servidor Web Local (Recomendado)
Dado que Hayase requiere una URL HTTP/HTTPS para importar repositorios de extensiones, puedes montar un mini-servidor local en tu carpeta del proyecto:

1. Abre una terminal de PowerShell o CMD en esta carpeta (`c:\Users\ferna\Desktop\Mod-Hayase`).
2. Levanta un servidor web simple con Node.js o Python:
   - **Con Node.js (npx):**
     ```bash
     npx http-server --cors -p 8080
     ```
   - **Con Python:**
     ```bash
     python -m http.server 8080
     ```
3. En la aplicación **Hayase / Miru**, navega a:
   `Ajustes (Settings) -> Extensiones (Extensions) -> Repositorios (Repositories)`.
4. Añade un nuevo repositorio con la siguiente URL local:
   ```text
   http://localhost:8080/index.json
   ```
5. ¡Listo! La extensión **AnimeFLV (Español)** aparecerá disponible para instalar con un solo clic.

### Método 2: Alojamiento en un Repositorio Privado/Público de GitHub
Si lo deseas, puedes subir el contenido de esta carpeta a tu cuenta personal de GitHub:
1. Crea un repositorio en GitHub (por ejemplo, `mis-extensiones-hayase`).
2. Sube los archivos `animeflv.js` e `index.json`.
3. Obtén la URL en formato "Raw" de tu archivo `index.json`. Tendrá una estructura similar a esta:
   ```text
   https://raw.githubusercontent.com/TU_USUARIO/TU_REPOSITORIO/main/index.json
   ```
4. Agrega esa URL en el menú de **Repositorios de Extensiones** dentro de Hayase.

---

## Configuración y Personalización ⚙️

Una vez instalada, ve a los ajustes de la extensión dentro de Hayase para personalizar tu experiencia:
* **Servidor de Video Preferido:** Configura si prefieres reproducir por defecto en MEGA, Streamwish, Streamtape, u Okru.
* **AnimeFLV URL:** Define la URL espejo actual si el dominio principal cambia o es bloqueado por tu proveedor de internet.

---

> [!TIP]
> **Compatibilidad:** Esta extensión ha sido desarrollada bajo los lineamientos y especificaciones de la API v2 de Miru/Hayase. Su funcionamiento está optimizado para evitar errores de CORS utilizando el agente interno de la aplicación.
