# Pixlanz

Tablero tipo Trello + CRM de lanzamiento + píxeles de marketing, para llevar proyectos tecnológicos de la idea al go-live.

## Qué incluye

- **Proyectos**: ficha, estado y color de cada producto.
- **Producto (tipo Trello)**: tablero con columnas, tarjetas, etiquetas, prioridad y arrastre.
- **Contactos**: importación desde Excel/CSV, fuente (WhatsApp, email, llamada…) y registro de llamadas.
- **Resultados**: conversión comercial, rechazados y embudo.
- **Marketing**: pestaña de código de píxel y pestaña de analítica (web vs contactos; *Mostrar todo* las junta).
- **Ver prueba**: landing con panel de visitas si abres `?preview=1`.
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

Añade el ID del píxel en **Marketing → Código de píxel** y actívalo. **Ver prueba** abre la landing con un panel de visitas. En **Analítica**, web y contactos van en paneles distintos; *Mostrar todo* los junta. Para GTM, Hotjar u otro, usa *Snippet personalizado*.
