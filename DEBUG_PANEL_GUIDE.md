# 🛠️ Panel de Debug - Guía de Uso

## Cómo Acceder al Panel de Debug

Hay **3 formas** de abrir el panel de debug:

### 1. **Atajo de Teclado** (Recomendado)
Presiona: `Ctrl + Shift + D`

### 2. **Menú Lateral**
Click en el sidebar inferior → "Debug Panel"

### 3. **Consola del Navegador**
```javascript
openDebugPanel()
```

## Cerrar el Panel

- Presiona `ESC`
- Click en el botón `✕` (esquina superior derecha)
- En consola: `closeDebugPanel()`

---

## Funcionalidades del Panel

### 📊 **Current Stats** (Estadísticas Actuales)

Muestra en tiempo real:
- User ID
- ELO actual
- Total de partidas
- Récord (W/L/D)
- Racha actual y mejor racha

Botón: **🔄 Refresh Stats** - Actualiza los datos mostrados

---

### ⚡ **Quick Actions** (Acciones Rápidas)

Añade partidas de prueba instantáneamente:

- **✅ Add Win** - Añade una victoria
  - +25 ELO
  - Aumenta racha
  - Puede desbloquear logros

- **❌ Add Loss** - Añade una derrota
  - -15 ELO
  - Resetea racha

- **🤝 Add Draw** - Añade un empate
  - +5 ELO
  - Resetea racha

Cada acción:
- Crea una partida falsa con datos aleatorios
- Actualiza estadísticas automáticamente
- Actualiza el User Badge
- Muestra notificación toast
- Puede desbloquear logros si se cumplen condiciones

---

### ✏️ **Manual Modification** (Modificación Manual)

Permite establecer valores exactos:

**Campos:**
- **ELO**: Establece ELO exacto (ej: 1500)
- **Wins**: Número de victorias (ej: 50)
- **Losses**: Número de derrotas (ej: 20)
- **Draws**: Número de empates (ej: 10)

**Botón: 💾 Apply Changes**
- Aplica los valores ingresados
- Recalcula total de partidas automáticamente
- Actualiza la UI

**Ejemplo de uso:**
1. Ingresa `ELO: 1200`
2. Ingresa `Wins: 30`
3. Ingresa `Losses: 15`
4. Ingresa `Draws: 5`
5. Click en "Apply Changes"
6. ✅ Stats actualizados

---

### 🏆 **Achievement Testing** (Test de Logros)

Prueba las notificaciones de logros sin tener que desbloquearlos:

- **🏆 First Win** - Muestra "First Victory"
- **🔥 Streak 5** - Muestra "On Fire"
- **🌟 ELO 1000** - Muestra "Rising Star"

Útil para:
- Ver cómo se ven las notificaciones
- Probar animaciones
- Verificar el diseño

---

### ⚠️ **Danger Zone** (Zona Peligrosa)

**¡CUIDADO!** Estas acciones son irreversibles:

#### 🔄 Reset All Stats
- Borra TODAS las estadísticas del usuario actual
- Mantiene la sesión activa
- Reinicia stats a valores por defecto (ELO 500, 0 partidas)
- **Requiere confirmación**

#### 🗑️ Clear LocalStorage
- **PELIGROSO**: Borra TODO el localStorage
- Cierra sesión automáticamente
- Borra stats de TODOS los usuarios
- Recarga la página
- **Requiere confirmación**

#### 📥 Export Data
- Exporta las stats del usuario actual como JSON
- Descarga archivo automáticamente
- Útil para backup
- Formato: `chess_stats_[userId]_[fecha].json`

---

### 🎮 **Recent Games** (Últimas Partidas)

Muestra las últimas 5 partidas jugadas:

Para cada partida muestra:
- Nombre del oponente
- Color jugado (white/black)
- Fecha
- Número de movimientos
- Razón del final (checkmate, stalemate, etc.)
- Resultado (WIN/LOSS/DRAW) con color

Si no hay partidas registradas, muestra: "No games recorded yet"

---

## Funciones Avanzadas (Consola)

### Presets Rápidos

En la consola del navegador puedes usar presets predefinidos:

```javascript
// Principiante
debugApplyPreset('beginner')
// ELO: 500, W: 2, L: 5, D: 1

// Intermedio
debugApplyPreset('intermediate')
// ELO: 1000, W: 25, L: 20, D: 5

// Avanzado
debugApplyPreset('advanced')
// ELO: 1500, W: 100, L: 40, D: 10

// Maestro
debugApplyPreset('master')
// ELO: 2000, W: 500, L: 100, D: 50
```

### Otras Funciones Disponibles

```javascript
// Añadir partidas individuales
debugAddWin()
debugAddLoss()
debugAddDraw()

// Mostrar logro específico
debugShowAchievement('first_win')
debugShowAchievement('streak_5')
debugShowAchievement('elo_1000')

// Reiniciar stats
debugResetStats()

// Limpiar localStorage
debugClearStorage()

// Exportar datos
debugExportData()

// Refrescar panel
debugRefreshStats()
```

---

## Escenarios de Prueba Comunes

### Escenario 1: Probar Primera Victoria
```javascript
1. Abrir Debug Panel (Ctrl+Shift+D)
2. Click "Add Win"
3. Ver notificación: "🎉 Congratulations! You won..."
4. Ver logro: "🏆 First Victory"
5. ELO aumenta a 525
```

### Escenario 2: Probar Racha de Victorias
```javascript
1. Abrir Debug Panel
2. Click "Add Win" x 5 veces
3. Ver logro: "🔥 On Fire" (5 victorias consecutivas)
4. Ver racha actual: 5
```

### Escenario 3: Probar Milestone de ELO
```javascript
1. Abrir Debug Panel
2. En "Manual Modification", ingresar ELO: 1000
3. Click "Apply Changes"
4. Ver logro: "🌟 Rising Star"
```

### Escenario 4: Simular Jugador Avanzado
```javascript
1. Abrir Consola (F12)
2. Ejecutar: debugApplyPreset('advanced')
3. User Badge muestra: "ELO 1500"
4. Stats: W 100 / L 40 / D 10
```

### Escenario 5: Probar Racha Perdida
```javascript
1. Usar preset: debugApplyPreset('intermediate')
2. Click "Add Loss"
3. Racha se resetea a 0
4. ELO baja
```

---

## Tips y Consejos

### ✅ Buenas Prácticas

1. **Usa Refresh Stats** después de hacer cambios manuales
2. **Exporta datos** antes de hacer "Clear LocalStorage"
3. **Prueba presets** para escenarios específicos
4. **Usa Quick Actions** para pruebas rápidas
5. **Usa Manual Modification** para valores exactos

### ⚠️ Advertencias

- Los logros solo se muestran UNA VEZ (no se repiten si ya fueron desbloqueados)
- "Clear LocalStorage" cierra sesión y borra TODO
- Las partidas de prueba tienen datos aleatorios
- El ELO mínimo es 0 (no puede ser negativo)

### 🔍 Debugging

Si algo no funciona:

1. Abre la consola (F12)
2. Busca errores en rojo
3. Verifica que el usuario esté logueado
4. Prueba: `getCurrentUser()` - debe retornar un objeto
5. Prueba: `getPlayerStats()` - debe retornar stats

---

## Estructura de Datos

### Formato de Stats en LocalStorage

```javascript
{
  "userId": "guest_1234567890",
  "stats": {
    "totalGames": 50,
    "wins": 30,
    "losses": 15,
    "draws": 5,
    "elo": 1250,
    "gamesAsWhite": 25,
    "gamesAsBlack": 25,
    "winsAsWhite": 16,
    "winsAsBlack": 14,
    "totalMoves": 2150,
    "averageMovesPerGame": 43,
    "longestGame": 78,
    "shortestGame": 18,
    "currentStreak": 3,
    "bestStreak": 7,
    "lastPlayed": "2025-12-30T10:30:00.000Z"
  },
  "recentGames": [...],
  "achievements": [...]
}
```

### LocalStorage Keys

- `chessUser` - Sesión del usuario actual
- `chessStats_[userId]` - Stats de cada usuario

---

## Solución de Problemas

### "No user logged in"
**Solución:** Inicia sesión primero (Google o Guest)

### Stats no se actualizan en el badge
**Solución:** Click en "Refresh Stats" o recarga la página

### Panel no abre con Ctrl+Shift+D
**Solución:** Usa el botón del menú o `openDebugPanel()` en consola

### Los logros no aparecen
**Solución:** Verifica que no estén ya desbloqueados. Usa "Achievement Testing" para forzar

### Error al exportar
**Solución:** Verifica que tengas stats guardadas. Intenta añadir una partida primero

---

## Contacto y Soporte

Si encuentras bugs o tienes sugerencias:
1. Revisa la consola del navegador
2. Exporta tus datos para backup
3. Reporta el issue con detalles

---

**Última actualización:** 30/12/2025
**Versión:** 1.0
