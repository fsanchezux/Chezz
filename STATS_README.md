# Sistema de Estadísticas y Almacenamiento

## Resumen

Se ha implementado un sistema completo de estadísticas y almacenamiento de partidas usando **LocalStorage**, que funciona tanto para usuarios autenticados con Google como para invitados.

## Características Implementadas

### 1. **Almacenamiento de Estadísticas** (`js/stats.js`)

#### Estadísticas Guardadas:
- **Total de partidas**: Contador total de juegos
- **Victorias/Derrotas/Empates**: Registro completo
- **ELO**: Sistema de puntuación que sube/baja según resultados
  - Victoria: +25 ELO
  - Derrota: -15 ELO
  - Empate: +5 ELO
- **Estadísticas por color**: Partidas y victorias como blancas/negras
- **Racha actual y mejor racha**: Tracking de victorias consecutivas
- **Promedio de movimientos por partida**
- **Partida más larga y más corta**

#### Historial de Partidas:
- Guarda las últimas **50 partidas** (se limpia automáticamente si se llena el almacenamiento)
- Información guardada por partida:
  - Fecha y hora
  - Oponente (IA, humano local, o jugador online)
  - Resultado (victoria/derrota/empate)
  - Color jugado
  - Número de movimientos
  - Notación simplificada de la partida (PGN)
  - Modo de juego
  - Razón del final (checkmate, stalemate, etc.)

### 2. **Sistema de Logros**

Logros implementados:
- 🏆 **First Victory**: Primera victoria
- ⭐ **Veteran Player**: 10 victorias
- 👑 **Chess Master**: 50 victorias
- 🔥 **On Fire**: 5 victorias consecutivas
- ⚡ **Unstoppable**: 10 victorias consecutivas
- 🌟 **Rising Star**: Alcanzar 1000 ELO
- 💎 **Expert Player**: Alcanzar 1500 ELO

Los logros se muestran con notificaciones animadas que aparecen en la esquina superior derecha.

### 3. **Integración con la Autenticación**

- **Usuarios con Google**: Sus estadísticas se guardan con su ID de Google
- **Invitados**: Sus estadísticas se guardan con un ID temporal de invitado
- Las estadísticas de invitados persisten en el navegador hasta que limpien el localStorage o cambien de dispositivo

### 4. **Visualización**

- **User Badge**: Muestra el ELO y el récord (W/L/D) en tiempo real
- Actualización automática después de cada partida
- Las estadísticas se cargan al iniciar sesión

### 5. **Detección Automática del Final**

El sistema detecta automáticamente cuando termina una partida por:
- ✅ Checkmate
- ✅ Stalemate
- ✅ Threefold repetition
- ✅ Insufficient material
- ✅ Draw

Y muestra un mensaje toast con el resultado.

## Funciones Principales

### Para Desarrolladores:

```javascript
// Obtener estadísticas del jugador actual
const stats = getPlayerStats(userId);

// Registrar una partida
recordGame({
  opponent: 'Computer',
  opponentType: 'ai',
  result: 'win',
  color: 'white',
  moves: 45,
  pgn: 'e2-e4, e7-e5...',
  gameMode: 'singleplayer',
  endReason: 'checkmate'
});

// Obtener estadísticas formateadas
const formatted = getFormattedStats(userId);

// Reiniciar estadísticas (para testing)
resetStats(userId);

// Exportar estadísticas como JSON
exportStats(userId);

// Importar estadísticas desde JSON
importStats(jsonData);
```

## Almacenamiento

### LocalStorage Keys:
- `chessUser`: Información del usuario actual
- `chessStats_[userId]`: Estadísticas de cada usuario

### Límites:
- LocalStorage típicamente permite ~10MB
- Se mantienen las últimas 50 partidas
- Limpieza automática si se alcanza el límite de almacenamiento

## Próximos Pasos (Migración a Firebase)

Cuando estés listo para migrar a Firebase:

1. **Mantener la misma estructura de datos** - El formato JSON es compatible
2. **Sincronización bidireccional**:
   - LocalStorage como caché local
   - Firebase como almacenamiento persistente
3. **Migración de datos**:
   - Exportar datos de localStorage
   - Importar a Firebase Firestore
4. **Ventajas**:
   - Acceso desde cualquier dispositivo
   - Backup automático
   - Sincronización en tiempo real

## Cómo Probar

1. **Inicia sesión** (con Google o como invitado)
2. **Juega una partida** contra la IA o localmente
3. **Termina la partida** (checkmate, stalemate, etc.)
4. **Observa**:
   - Notificación toast del resultado
   - Actualización del ELO en el user badge
   - Notificaciones de logros (si aplica)
5. **Verifica localStorage**:
   - Abre DevTools → Application → Local Storage
   - Busca `chessStats_[tu_id]`
   - Verifica que las estadísticas se guardaron correctamente

## Configuración de Google OAuth (Pendiente)

Para que funcione la autenticación con Google:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto
3. Habilita Google Identity Services
4. Obtén tu CLIENT_ID
5. Actualiza en `js/auth.js:6`:
   ```javascript
   const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID_AQUI.apps.googleusercontent.com';
   ```

## Notas Técnicas

- El sistema es completamente offline (excepto autenticación con Google)
- Compatible con todos los modos de juego (vs IA, local 2 jugadores, online)
- Las estadísticas se actualizan inmediatamente después de cada partida
- Los logros solo se otorgan una vez
- Sistema de ELO simplificado (no usa diferencia de rating del oponente)
