# PokéDex React + Vite 🎮

Pokédex completa con los 1025 Pokémon, login con Firebase y sincronización en la nube.

## Estructura del proyecto

```
pokedex-react/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              ← Entrada de la app
    ├── App.jsx               ← Layout principal
    ├── App.module.css        ← Estilos del layout
    ├── index.css             ← Variables globales y animaciones
    ├── firebase.js           ← Configuración Firebase ⬅ EDITA ESTO
    ├── context/
    │   └── AuthContext.jsx   ← Estado de autenticación global
    ├── hooks/
    │   └── usePokemon.js     ← Lógica de fetch y filtros
    ├── components/
    │   ├── AuthScreen.jsx    ← Pantalla de login/registro
    │   ├── Splash.jsx        ← Pantalla de carga
    │   ├── PokemonCard.jsx   ← Tarjeta de Pokémon
    │   └── DetailPanel.jsx   ← Panel de detalle (4 tabs)
    └── utils/
        └── constants.js      ← Colores, generaciones, juegos
```

## Setup rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un proyecto → Agrega app web
3. Activa **Authentication → Email/Contraseña**
4. Crea **Firestore Database** en modo prueba
5. Copia tu config en `src/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  ...
}
```

### 3. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

### 4. Build para producción

```bash
npm run build
```

Sube la carpeta `dist/` a Netlify, Vercel o cualquier hosting estático.

## Funcionalidades

- 🔐 Login / registro con email y contraseña
- ☁️ Pokémon capturados sincronizados en tiempo real entre dispositivos
- 📱 Responsive: móvil, tablet y desktop
- 🔍 Búsqueda y filtro por generación
- 📊 Stats, movimientos, ubicaciones y línea evolutiva
- ✅ Marcar/desmarcar Pokémon como capturados
