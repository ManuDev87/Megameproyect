# Pixlanz

Tablero tipo Trello + CRM de lanzamiento + píxeles de marketing, para llevar proyectos tecnológicos de la idea al go-live.

## Qué incluye

- **Proyectos**: ficha, estado y color de cada producto.
- **Producto (tipo Trello)**: tablero con columnas, tarjetas, etiquetas, prioridad y arrastre.
- **Contactos**: importación desde Excel/CSV, registro de llamadas y cambio de estado.
- **Resultados**: visitas del píxel, contactos, conversión de tráfico, conversión comercial y rechazados.
- **Píxel**: pegar el ID o snippet de Meta, GA4, Google Ads, TikTok, LinkedIn o uno propio. Los activos se inyectan en `/p/[id]`.
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

En **Contactos** descarga la plantilla Excel o sube un archivo con columnas como:

`Nombre`, `Email`, `Teléfono`, `Empresa`, `Fuente`, `Estado`, `Notas`

Se omiten duplicados por email o teléfono.

## Píxeles

Añade el ID del píxel en **Píxel** y actívalo. La landing pública carga el snippet oficial del proveedor. Visitas y conversión se ven en **Resultados**. Para GTM, Hotjar u otro, usa *Snippet personalizado*.
