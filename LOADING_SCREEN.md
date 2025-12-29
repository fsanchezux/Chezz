# Loading Screen Design Documentation

## Overview

La pantalla de carga implementa el diseño personalizado con los siguientes elementos:

### Capas Visuales (de fondo a frente)

1. **Imagen de fondo** (`background_load.jpg`)
   - Ubicación: `/img/background_load.jpg` (o `.png`)
   - Debe mostrar un tablero de ajedrez con piezas
   - Recomendado: imagen oscura para buen contraste

2. **Degradado superpuesto**
   - Color inferior: `#d2fe0b` (verde neón/lima)
   - Color superior: transparente (0% opacity)
   - Dirección: de abajo hacia arriba

3. **Pieza de ajedrez (Rey)**
   - Fuente: CHESSVETICA
   - Carácter: 'e' (representa el Rey)
   - Tamaño: 400px
   - Componentes:
     - **Outline**: Contorno verde neón (#d2fe0b) con 3px de grosor
     - **Fill**: Relleno oscuro (#2a2a2a) que se llena de abajo hacia arriba

4. **Texto de carga** (opcional)
   - Texto: "Loading..."
   - Color: `#d2fe0b`
   - Aparece después de 2 segundos con fade-in

## Animaciones

### 1. Fill Animation (Llenado)
- **Duración**: 2.5 segundos
- **Efecto**: La pieza se llena desde abajo hacia arriba
- **Timing**: ease-out (comienza rápido, termina suave)
- **Implementación**: `clip-path: inset()` con keyframes

```css
@keyframes fillPiece {
  0%   { clip-path: inset(100% 0 0 0); }  /* Completamente vacía */
  100% { clip-path: inset(0% 0 0 0); }    /* Completamente llena */
}
```

### 2. Glow Pulse (Brillo pulsante)
- **Duración**: 2 segundos
- **Efecto**: El contorno pulsa con brillo
- **Timing**: ease-in-out (suave en ambos extremos)
- **Loop**: infinito

```css
@keyframes glowPulse {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(210, 254, 11, 0.5)); }
  50%      { filter: drop-shadow(0 0 40px rgba(210, 254, 11, 0.8)); }
}
```

### 3. Fade Out (Desvanecimiento final)
- **Duración**: 0.8 segundos
- **Efecto**: Toda la pantalla se desvanece
- **Trigger**: Después de 3 segundos totales

## Cronología de Eventos

```
0.0s  → Página carga, pantalla de carga aparece
0.0s  → Animación de llenado comienza
0.0s  → Animación de brillo comienza (infinita)
2.0s  → Texto "Loading..." aparece con fade-in
2.5s  → Animación de llenado completa
3.0s  → Pantalla de carga se desvanece (fade-out)
3.8s  → Menú principal aparece
```

## Colores Utilizados

| Elemento | Color | Código |
|----------|-------|--------|
| Degradado inferior | Verde neón | `#d2fe0b` |
| Contorno pieza | Verde neón | `#d2fe0b` |
| Relleno pieza | Gris oscuro | `#2a2a2a` |
| Texto carga | Verde neón | `#d2fe0b` |
| Fondo fallback | Degradado oscuro | `#1a1a1a` → `#0a0a0a` |

## Cómo Agregar la Imagen de Fondo

### Opción 1: Usar tu propia imagen

1. Coloca tu imagen en `/img/`
2. Nómbrala `background_load.jpg` (o `.png`)
3. Recomendaciones:
   - Resolución mínima: 1920x1080 px
   - Formato: JPG o PNG
   - Tema: Tablero de ajedrez, piezas, o abstracto oscuro
   - Contraste: Imagen oscura para que el verde neón resalte

### Opción 2: Sin imagen de fondo

Si no agregas la imagen:
- Se usará un degradado oscuro como fondo
- La pantalla de carga seguirá funcionando perfectamente
- El verde neón resaltará sobre el fondo oscuro

## Estructura HTML

```html
<div id="loadingScreen">
  <!-- Fondo con imagen y degradado (CSS) -->

  <div class="loading-content">
    <div class="chess-piece-container">
      <!-- Contorno verde neón -->
      <div class="chess-piece-outline">e</div>

      <!-- Relleno oscuro con animación -->
      <div class="chess-piece-dark">e</div>
    </div>
  </div>

  <!-- Texto opcional -->
  <div class="loading-text">Loading...</div>
</div>
```

## Responsive Design

La pantalla de carga se adapta a diferentes tamaños de pantalla:

### Desktop (> 768px)
- Pieza: 400px
- Container: 300px x 400px

### Tablet (≤ 768px)
- Pieza: 300px
- Container: 200px x 300px

### Mobile (≤ 480px)
- Pieza: 250px
- Container: 150px x 250px

## Personalización

### Cambiar duración de la carga
Edita `js/init.js`, línea 22-25:
```javascript
setTimeout(function() {
  hideLoadingScreen();
  showModal('mainMenuModal');
}, 3000); // Cambia este valor (en milisegundos)
```

### Cambiar duración del llenado
Edita `css/loading.css`, línea 98:
```css
animation: fillPiece 2.5s ease-out forwards;
/* Cambia 2.5s por el valor deseado */
```

### Cambiar color del degradado
Edita `css/loading.css`, línea 50:
```css
background: linear-gradient(to top, #d2fe0b 0%, rgba(210, 254, 11, 0) 100%);
/* Cambia #d2fe0b por tu color preferido */
```

### Usar diferente carácter de CHESSVETICA
Edita `index.html`, líneas 50-51:
```html
<div class="chess-piece-outline">e</div>  <!-- Rey -->
<div class="chess-piece-dark">e</div>

<!-- Otros caracteres disponibles:
     a = Torre, b = Caballo, c = Alfil, d = Reina, e = Rey, f = Peón
-->
```

## Soporte de Navegadores

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- ⚠️ IE11 (sin soporte de clip-path)

## Troubleshooting

### La pieza no se ve
- Verifica que la fuente CHESSVETICA esté en `/fonts/Chessvetica-Regular.otf`
- Revisa la consola del navegador para errores de carga de fuente
- Intenta hacer hard refresh (Ctrl+F5)

### La animación no funciona
- Verifica que `css/loading.css` esté cargándose correctamente
- Comprueba que no haya errores CSS en la consola
- Asegúrate de que el navegador soporte `clip-path`

### La imagen de fondo no aparece
- Verifica la ruta: debe ser `/img/background_load.jpg` o `.png`
- Comprueba que el archivo tenga los permisos correctos
- Revisa la red en DevTools para ver si se está cargando

### El degradado no se ve
- El degradado está implementado con `::after` pseudo-elemento
- Verifica que no haya CSS que esté sobrescribiendo el z-index
- Comprueba que el navegador soporte gradientes lineales

## Testing

Para probar la pantalla de carga:

1. Inicia el servidor: `node app.js`
2. Abre: `http://localhost:4000/index.html`
3. La pantalla de carga debería aparecer inmediatamente
4. Observa la animación de llenado (2.5s)
5. El texto "Loading..." aparece a los 2s
6. Todo se desvanece a los 3s
7. El menú principal aparece

## Capturas de Proceso

### 0s - Inicio
```
┌─────────────────────────┐
│                         │
│         ╔═══╗           │
│         ║   ║           │  ← Contorno verde neón
│         ║   ║           │  ← Interior vacío
│         ╚═══╝           │
│                         │
└─────────────────────────┘
```

### 1.25s - Mitad
```
┌─────────────────────────┐
│                         │
│         ╔═══╗           │
│         ║   ║           │  ← Contorno verde neón
│         ║▓▓▓║           │  ← Mitad llena
│         ╚═══╝           │
│                         │
└─────────────────────────┘
```

### 2.5s - Completo
```
┌─────────────────────────┐
│                         │
│         ╔═══╗           │
│         ║▓▓▓║           │  ← Contorno verde neón
│         ║▓▓▓║           │  ← Completamente lleno
│         ╚═══╝           │
│                         │
│       Loading...        │  ← Texto aparece
└─────────────────────────┘
```

## Referencias

- Fuente CHESSVETICA: `/fonts/Chessvetica-Regular.otf`
- CSS principal: `/css/loading.css`
- HTML: `/index.html` (líneas 46-55)
- JavaScript: `/js/init.js` (líneas 20-25)
- Documentación imagen: `/img/README_BACKGROUND.md`
