# ads-landings

Landings de la escalera de ofertas de LBIA: una página por producto, un solo
sistema de diseño compartido. HTML, CSS y JS sin build step y sin dependencias
externas (no hay fuentes remotas ni scripts de terceros).

## Estructura

```
index.html            hub de preview (noindex, no se publica)
shared/tokens.css     paleta y tipografías de lucasbenites.com (Kadence)
shared/base.css       reset, tipografía, botones, foco
shared/landing.css    hero asimétrico, panel, pasos, FAQ, formulario, sticky CTA
shared/landing.js     eventos (window.dataLayer), sticky CTA, validación del form
taller/               Implementá IA — lista de espera
consultoria/          Consultoría 1:1 — primera conversación
desarrollo/           Desarrollo a medida — primer contacto
assets/favicon.svg
assets/fonts/         Montserrat y Source Sans 3 autoalojadas (subset latin)
```

El producto de cada página se fija en `<body data-product="…">` y no hay selector
en la UI: una landing responde solo por su producto.

## Preview local

```bash
python3 -m http.server 8088 --bind 127.0.0.1
# http://127.0.0.1:8088/  (hub) · /taller/ · /consultoria/ · /desarrollo/
```

## Formularios

Cada página tiene un `<form data-lead data-endpoint="/api/lead">` con dos campos
(nombre y email o WhatsApp). Si el endpoint no responde, el formulario muestra un
fallback con mailto en vez de simular éxito.

## Deploy

Sitio estático: se publica el árbol tal cual (sin `index.html` del hub si no se
quiere exponer el preview). Los canonicals y `og:url` apuntan a
`https://promo.lucasbenites.com/<producto>/`.

## Estado

- Estándares de conversión y diseño: `ADS-40`.
- Sistema compartido: `ADS-41`. Taller: `ADS-42`. Consultoría: `ADS-43`. Media: `ADS-44`.
- Deploy y medición: `ADS-45` (bloqueado por subdominio y host).
- Validación de paleta y tipografía: `ADS-46` (bloqueante de publicación).
