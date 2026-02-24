# SEPOffice – Manual de usuario

**Versión 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Índice

1. [Descripción general](#1-descripción-general)
2. [Instalación e inicio](#2-instalación-e-inicio)
3. [Panel de control](#3-panel-de-control)
4. [SEPWrite – Procesador de texto](#4-sepwrite--procesador-de-texto)
5. [SEPGrid – Hoja de cálculo](#5-sepgrid--hoja-de-cálculo)
6. [SEPShow – Presentaciones](#6-sepshow--presentaciones)
7. [Eliot – Asistente de IA](#7-eliot--asistente-de-ia)
8. [Configuración](#8-configuración)
9. [Atajos de teclado](#9-atajos-de-teclado)

---

## 1. Descripción general

SEPOffice es una suite ofimática de escritorio potenciada por IA para Windows, compuesta por tres aplicaciones integradas:

| Aplicación | Función |
|------------|---------|
| **SEPWrite** | Crear documentos de texto enriquecido, exportación a Word/PDF |
| **SEPGrid** | Hoja de cálculo con fórmulas y gráficos |
| **SEPShow** | Presentaciones con editor de lienzo |

Las tres aplicaciones están conectadas a **Eliot** – un asistente de IA integrado que formula textos, genera fórmulas y diseña diapositivas.

---

## 2. Instalación e inicio

### Instalador
Ejecute `SEPOffice Setup 1.0.1.exe`. El asistente le guía a través de la instalación:
- Directorio de instalación seleccionable (predeterminado: `Archivos de programa\SEPOffice`)
- Se crea una entrada en el menú Inicio
- Acceso directo en el escritorio opcional

### Inicio directo (sin instalador)
Ejecute `release\win-unpacked\SEPOffice.exe`.

### Primer inicio
En el primer inicio, el servicio de IA carga el modelo de lenguaje (Qwen2.5-0.5B) en segundo plano. El progreso de carga es visible en el widget de chat de Eliot en la esquina inferior derecha. Dependiendo del hardware, esto toma **1-5 minutos**.

> **Nota:** La aplicación es utilizable inmediatamente – Eliot se activa una vez que la barra de carga alcanza el 100%.

---

## 3. Panel de control

![Panel de control](assets/screenshots/01_dashboard.png)

El Panel de control es la página de inicio de SEPOffice. Muestra:

### Tres mosaicos de aplicaciones
- **SEPWrite** – Crear o abrir documento
- **SEPGrid** – Crear o abrir hoja de cálculo  
- **SEPShow** – Crear o abrir presentación *(NUEVO)*

Haga clic en un mosaico → Nuevo documento vacío en la aplicación respectiva.

### Documentos abiertos recientemente
Debajo de los mosaicos aparecen los documentos editados recientemente con el icono de tipo, nombre y fecha de última modificación. Haga clic en una entrada para abrir el documento directamente.

### Navegación
La barra de navegación superior está disponible en todas las aplicaciones:

| Elemento | Función |
|----------|---------|
| **SEPWrite / SEPGrid / SEPShow** (Botones) | Cambiar entre aplicaciones |
| ⚙️ | Abrir configuración |
| ⌨️ | Mostrar atajos de teclado |
| 🌙 / ☀️ | Alternar modo oscuro/claro |

---

## 4. SEPWrite – Procesador de texto

![Editor SEPWrite](assets/screenshots/02_sepwrite.png)

SEPWrite es un editor de texto enriquecido moderno basado en **TipTap**.

### 4.1 Formato

La barra de herramientas ofrece las siguientes opciones de formato:

| Símbolo | Función | Atajo de teclado |
|---------|---------|------------------|
| **B** | Negrita | `Ctrl + B` |
| *I* | Cursiva | `Ctrl + I` |
| <u>U</u> | Subrayado | `Ctrl + U` |
| H1 | Título 1 | — |
| H2 | Título 2 | — |
| Lista | Lista con viñetas | — |
| 1. Lista | Lista numerada | — |

### 4.2 Insertar imágenes

A través de **Insertar → Imagen** se abre el diálogo de inserción de imágenes:
- Cargar imagen arrastrando y soltando o seleccionando archivo
- Alineación: Izquierda, Centro, Derecha
- Las imágenes se incrustan directamente en el documento

### 4.3 Guardar y exportar documentos

| Acción | Descripción |
|--------|-------------|
| **Guardar** | Guardado automático en el almacenamiento local del navegador |
| **Exportar como .docx** | Descargar documento compatible con Word |
| **Imprimir / PDF** | Vista previa de impresión con configuración de página, luego imprimir o guardar como PDF |

### 4.4 Soporte de IA

El chat de Eliot (→ [Capítulo 7](#7-eliot--asistente-de-ia)) está completamente integrado en SEPWrite. Los borradores de texto, revisiones y reformulaciones se pueden solicitar directamente en el chat.

---

## 5. SEPGrid – Hoja de cálculo

![SEPGrid](assets/screenshots/03_sepgrid.png)

SEPGrid es una potente hoja de cálculo con **10.000 filas × 26 columnas** por hoja de trabajo – comparable a Microsoft Excel y OpenOffice Calc.

### 5.1 Operaciones básicas

| Acción | Descripción |
|--------|-------------|
| Hacer clic en celda | Seleccionar celda |
| Doble clic / F2 | Editar celda |
| `Enter` | Confirmar, pasar a la siguiente fila |
| `Tab` | Confirmar, pasar a la siguiente columna |
| `Escape` | Cancelar edición |
| `Ctrl + Z` | Deshacer |
| `Ctrl + Y` | Rehacer |
| `Ctrl + C` | Copiar |
| `Ctrl + V` | Pegar |
| `Ctrl + X` | Cortar |
| `Ctrl + B` | Negrita |
| `Ctrl + I` | Cursiva |
| `Ctrl + U` | Subrayado |
| `Ctrl + F` | Buscar y reemplazar |
| `Supr` | Borrar contenido de celda |

**Selección múltiple:** Arrastrar el ratón con el botón izquierdo presionado o `Mayús + Clic`.

**Controlador de relleno:** Arrastrar el cuadrado azul en la esquina inferior derecha de una celda para copiar valores o fórmulas.

### 5.2 La barra de fórmulas

La barra de fórmulas se encuentra debajo de la cinta de opciones:

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SUM(A1:A10)                             │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Dirección  Símbolo de     Campo de entrada (muestra la fórmula sin procesar)
  de celda   fórmula
```

- **Dirección de celda**: Muestra la celda activa o el rango seleccionado (ej. `A1:B5`)
- **Símbolo fx**: Indica entrada de fórmula
- **Campo de entrada**: Siempre muestra la fórmula sin procesar (ej. `=SUM(A1:A10)`) – no el resultado

**Visualización de errores:** Para errores de fórmula como `#ERROR`, `#REF!`, `#DIV/0!` etc., el campo de entrada obtiene un borde rojo y el tipo de error se muestra a la derecha.

### 5.3 Introducir fórmulas

La entrada de fórmulas siempre comienza con `=`:

```
=SUM(A1:A10)           Suma
=AVERAGE(B1:B5)        Promedio
=MAX(C1:C100)          Máximo
=MIN(D1:D50)           Mínimo
=COUNT(A:A)            Conteo
=IF(A1>0,"Sí","No")    Condición
=VLOOKUP(...)          Búsqueda
=ROUND(A1, 2)          Redondear
```

#### Referencias de fórmula mediante clic del ratón

En lugar de escribir manualmente las direcciones de celdas:

1. Escriba `=` o una función como `=SUM(`
2. Haga clic en la celda deseada → La dirección se inserta
3. Arrastre para rangos → El rango se inserta (ej. `A1:B10`)

Esto funciona después de `=`, `(`, `+`, `-`, `*`, `/`, `,` y `!`.

#### Acceso rápido a fórmulas

Haga clic en el **símbolo de calculadora (fx)** para abrir sugerencias de fórmulas:
- SUM(), AVERAGE(), MAX(), MIN(), COUNT(), IF()
- Cuando se selecciona un rango, se inserta automáticamente

### 5.4 Fórmulas entre hojas

Referencias a otras hojas de cálculo – como en Excel:

```
=Hoja2!A1                    Celda única de Hoja2
=SUM(Hoja2!A1:B10)           Suma de Hoja2
=Hoja1!A1 + Hoja2!B5         Combinación de múltiples hojas
=AVERAGE(Ventas!C1:C100)     Rango de la hoja "Ventas"
```

**Mediante clic del ratón:**
1. Escriba `=` en una celda
2. Haga clic en otra pestaña de hoja → `Hoja2!` se inserta
3. Haga clic en la celda deseada → `A1` se añade

### 5.5 Formatos de números

A través del **símbolo 123** en la barra de herramientas:

| Formato | Ejemplo | Descripción |
|---------|---------|-------------|
| Estándar | 1234,5 | Sin formato |
| Número | 1.234,56 | Notación estándar con 2 decimales |
| Moneda | 1.234,56 € | Formato de moneda |
| Porcentaje | 12,5 % | Valor × 100 con signo % |
| Miles | 1.234 | Números enteros con separador de miles |
| Fecha | 24/02/2026 | Formato de fecha |

### 5.6 Combinar celdas

Combinar múltiples celdas en una:

1. Seleccionar rango de celdas
2. **Insertar → Combinar celdas**
3. Solo se conserva el valor de la celda superior izquierda

**Descombinar:** Misma posición en el menú o **Insertar → Descombinar celdas**

### 5.7 Formato condicional

Formatear automáticamente las celdas según los valores:

1. Seleccionar rango
2. **Edición → Formato condicional...**
3. Elegir regla:
   - Mayor que / Menor que
   - Igual a
   - Entre (dos valores)
   - El texto contiene
4. Elegir colores para texto y fondo
5. **Añadir**

*Ejemplo:* Resaltar todos los valores superiores a 1000 en verde.

**Eliminar:** Seleccionar rango → **Edición → Eliminar formato condicional**

### 5.8 Inmovilizar paneles

Mantener los encabezados de filas o columnas visibles al desplazarse:

1. Seleccionar la celda desde la cual debe comenzar el desplazamiento
2. **Vista → Inmovilizar paneles**
3. Todas las filas de arriba y las columnas a la izquierda de la selección se inmovilizan

**Movilizar:** **Vista → Movilizar paneles**

### 5.9 Comentarios

Añadir notas a las celdas:

1. Seleccionar celda
2. **Insertar → Añadir comentario**
3. Introducir texto → Aceptar

Las celdas con comentarios muestran un **triángulo rojo** en la esquina superior derecha. La información sobre herramientas aparece al pasar el cursor.

### 5.10 Buscar y reemplazar

`Ctrl + F` o **Edición → Buscar y reemplazar**:

- **Buscar**: Introducir texto, navegar por las coincidencias con ◀ ▶
- **Reemplazar**: Reemplazar uno a la vez o todos a la vez

### 5.11 Insertar/Eliminar filas y columnas

**A través del menú Insertar:**
- Insertar fila arriba/abajo
- Insertar columna izquierda/derecha
- Eliminar fila/columna

La posición se basa en la selección actual.

### 5.12 Barra de estado

En la parte inferior, las estadísticas se muestran automáticamente para selecciones múltiples:

```
Σ Suma: 12.345   ⌀ Promedio: 1.234   ↓ Mín: 100   ↑ Máx: 5.000   Cantidad: 10
```

### 5.13 Importación / Exportación

| Función | Formato | Descripción |
|---------|---------|-------------|
| Importar | `.xlsx`, `.xlsm` | Abrir archivos de Excel |
| Importar CSV | `.csv` | Archivos separados por coma/punto y coma |
| Exportar | `.xlsx` | Guardar como archivo de Excel |
| Exportar CSV | `.csv` | Guardar como archivo CSV (UTF-8, punto y coma) |
| Imprimir / PDF | — | Vista previa de impresión, solo filas con contenido |
| Insertar imagen | PNG, JPG | Incrustar imagen en el área de la hoja de cálculo |

### 5.14 Funciones de IA

#### Generador de fórmulas de IA
Haga clic en **✨** en la barra de fórmulas:
> "Calcular el promedio de todos los valores positivos en la columna B"  
> → `=AVERAGEIF(B:B,">0")`

#### Asistente de tablas de IA
Superposición de glassmorphismo al hacer clic en el botón de IA:
> "Crear una tabla de ventas mensuales para 2025 con columnas: Mes, Ingresos, Costos, Beneficio"

#### Vibe Writing
Activar a través de **Archivo → Activar Vibe Writing**: Soporte de IA mientras escribe.

### 5.15 Resumen de atajos de teclado

| Atajo | Función |
|-------|---------|
| `Ctrl + Z` | Deshacer |
| `Ctrl + Y` | Rehacer |
| `Ctrl + C` | Copiar |
| `Ctrl + V` | Pegar |
| `Ctrl + X` | Cortar |
| `Ctrl + B` | Negrita |
| `Ctrl + I` | Cursiva |
| `Ctrl + U` | Subrayado |
| `Ctrl + F` | Buscar y reemplazar |
| `F2` | Editar celda |
| `Enter` | Confirmar + bajar |
| `Tab` | Confirmar + ir a la derecha |
| `Escape` | Cancelar |
| `Supr` | Borrar contenido |
| `Mayús + Clic` | Extender rango |

---

## 6. SEPShow – Presentaciones

![SEPShow](assets/screenshots/04_sepshow.png)

SEPShow es un editor de presentaciones basado en diapositivas que utiliza **Konva** (renderizador de lienzo).

### 6.1 Interfaz

| Área | Descripción |
|------|-------------|
| **Barra lateral izquierda** | Lista de diapositivas – vista previa de todas las diapositivas, reordenar arrastrando y soltando |
| **Área principal** | Editor de lienzo de la diapositiva activa |
| **Barra de herramientas (arriba)** | Herramientas, exportación, modo de presentación |
| **Notas del orador (abajo)** | Notas para la diapositiva actual |

### 6.2 Insertar elementos

A través de la barra de herramientas:

| Acción | Descripción |
|--------|-------------|
| **Texto** | Colocar campo de texto en la diapositiva |
| **Imagen** | Insertar imagen mediante carga o portapapeles |
| **Forma** | Rectángulos, círculos, etc. |
| **Diseño de IA** | La IA genera un diseño de diapositiva completo |

Todos los elementos pueden:
- Moverse libremente con el ratón
- Cambiar de tamaño (controladores de esquina)
- Rotarse

### 6.3 Gestión de diapositivas

| Acción | Descripción |
|--------|-------------|
| **+** en la barra lateral | Añadir nueva diapositiva |
| Clic derecho en la diapositiva | Duplicar, eliminar, mover |
| Arrastrar y soltar en la barra lateral | Cambiar orden |

### 6.4 Modo de presentación

Haga clic en **Presentar** (icono de pantalla) para abrir la presentación a pantalla completa:
- Navegación: teclas de flecha `→` / `←` o clic
- `Esc` sale del modo de presentación

### 6.5 Notas del orador

Debajo del lienzo hay un campo de notas para cada diapositiva. Las notas solo son visibles en el editor, no durante la presentación.

### 6.6 Exportación

| Formato | Descripción |
|---------|-------------|
| Guardar | En almacenamiento local (automático) |
| PDF/Imprimir | Exportar diapositivas como PDF |

---

## 7. Eliot – Asistente de IA

![Chat de Eliot](assets/screenshots/05_eliot.png)

Eliot es el asistente de IA integrado disponible en las tres aplicaciones.

### 7.1 El widget de chat

El **símbolo flotante de Eliot** se encuentra en la esquina inferior derecha en todas las aplicaciones. Haga clic en él para abrir la ventana de chat.

#### Indicadores de estado

| Símbolo | Estado |
|---------|--------|
| 💬 (normal) | IA lista – escriba una solicitud |
| ⏳ (girando) | IA cargando – el modelo se está inicializando |
| ❌ (rojo) | Error o no conectado |

#### Progreso de carga
En el primer inicio, aparece una **barra de carga** (0–100%) mientras el modelo de lenguaje se carga en memoria.

### 7.2 Trabajar con Eliot

Escriba una solicitud en el campo de entrada del chat y confirme con `Enter` o el botón de envío.

**Ejemplos de solicitudes:**

*En SEPWrite:*
- "Escribe una introducción profesional para un informe sobre energías renovables"
- "Revisa este texto para que sea más formal"
- "Resume el siguiente texto en 3 oraciones"

*En SEPGrid:*
- "¿Qué fórmula calcula la media móvil de 5 valores?"
- "Crea una fórmula que encuentre el valor más alto en la columna C"

*En SEPShow:*
- "Crea una diapositiva sobre el cambio climático con 3 puntos"
- "Sugiere un esquema de colores para una presentación empresarial"

### 7.3 Texto fantasma (Autocompletado)

En SEPWrite, Eliot ofrece **Texto fantasma** – una vista previa de texto gris tenue mientras escribe. `Tab` acepta la sugerencia.

### 7.4 Iniciar el servicio de IA (manualmente)

Si el servicio de IA no se inicia automáticamente, aparece un botón **"Iniciar servicio de IA"** en el widget de Eliot. Haga clic para iniciar el servicio manualmente.

---

## 8. Configuración

La ventana de Configuración (⚙️ en la barra de navegación) contiene:

### Configuración de IA
| Opción | Descripción |
|--------|-------------|
| **URL de API** | URL del backend de IA (predeterminado: `http://localhost:8080`) |
| **Clave de API** | Opcional, para APIs de IA externas |
| **Probar conexión** | Comprueba si el servicio de IA está accesible |

### Idioma
SEPOffice admite **29 idiomas**. El idioma se puede seleccionar en el diálogo de Configuración y se aplica a toda la interfaz de usuario.

---

## 9. Atajos de teclado

La ventana de Ayuda (⌨️ en la barra de navegación) muestra todos los atajos de teclado.

### Global

| Atajo | Función |
|-------|---------|
| `Ctrl + Z` | Deshacer |
| `Ctrl + Y` | Rehacer |
| `Ctrl + S` | Guardar |

### SEPWrite

| Atajo | Función |
|-------|---------|
| `Ctrl + B` | Negrita |
| `Ctrl + I` | Cursiva |
| `Ctrl + U` | Subrayado |
| `Ctrl + P` | Imprimir |

### SEPGrid

| Atajo | Función |
|-------|---------|
| `Enter` | Confirmar celda, bajar |
| `Tab` | Confirmar celda, ir a la derecha |
| `Escape` | Cancelar edición |
| `Ctrl + C` | Copiar |
| `Ctrl + V` | Pegar |
| `F2` | Editar celda |
| Teclas de flecha | Navegar por celdas |
| `Mayús + Teclas de flecha` | Selección múltiple |

### SEPShow

| Atajo | Función |
|-------|---------|
| `→` / `←` | Diapositiva siguiente / anterior (modo de presentación) |
| `Esc` | Salir del modo de presentación |
| `Ctrl + D` | Duplicar diapositiva |
| `Supr` | Eliminar elemento seleccionado |

---

## Notas técnicas

- **Almacenamiento de datos:** Todos los documentos se guardan localmente en el almacenamiento del navegador (`localStorage`). No se transmiten datos a servidores externos.
- **Modelo de IA:** Qwen2.5-0.5B se ejecuta completamente en local – no se requiere conexión a Internet para las funciones de IA.
- **Requisitos del sistema:** Windows 10/11, mín. 4 GB de RAM (8 GB recomendados para el modelo de IA)
- **Desinstalación:** A través de Windows "Aplicaciones y características" → Desinstalar SEPOffice

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
