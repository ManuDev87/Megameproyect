# Megame

Aplicación para **llevar proyectos tecnológicos** de la idea al lanzamiento.

## Qué incluye

- **Proyectos**: ficha, estado y color de cada producto.
- **Producto (tipo Trello)**: tablero con columnas, tarjetas, etiquetas, prioridad y arrastre.
- **Lanzamiento**: importación de contactos desde Excel/CSV (nombre, email, teléfono, empresa, fuente), registro de llamadas y métricas de conversión.
- **Marketing**: píxeles de Meta, GA4, Google Ads, TikTok, LinkedIn o un snippet propio. Los activos se inyectan en la landing pública `/p/[id]`.
- **Responsive**: menú lateral en escritorio, navegación inferior en móvil y tablero con scroll horizontal.

Los datos se guardan en el navegador (`localStorage`). No hace falta backend para empezar.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run build
```

## Importar contactos

En **Lanzamiento** descarga la plantilla Excel o sube un archivo con columnas como:

`Nombre`, `Email`, `Teléfono`, `Empresa`, `Fuente`, `Estado`, `Notas`

Se omiten duplicados por email o teléfono.

## Píxeles

Añade el ID del píxel en **Marketing** y actívalo. La landing pública carga el snippet oficial del proveedor. Para GTM, Hotjar u otro, usa *Snippet personalizado*.
