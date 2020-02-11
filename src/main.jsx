// Polyfill for advanced javascript transformation via Babel
import 'core-js/stable'
import 'regenerator-runtime/runtime'

// Basic react includes
import ReactDOM from 'react-dom'
import React from 'react'

// Game grid which will load game pages dynamically
import GamePageGrid from './GamePage/GamePageGrid.jsx'

// Function to mount our react app
window.mountApp = () => {
  ReactDOM.render(
    <GamePageGrid studioName="Seth's Safari" phaserName="Phaser 3" />,
    document.getElementById('app')
  )
}

// Remove then re-add the app to clear react state and events
// Note: This is needed for when we return to the game grid and
// open a new game page. React tries to cache and re-use the game
// page but hits errors because the hooks are different between
// them so we force a re-render of the entire page to clear the
// cache and hooks.
window.remountApp = () => {
  ReactDOM.unmountComponentAtNode(document.getElementById('app'))
  setTimeout(window.mountApp, 10)
}

// Render the game grid for the first time
window.mountApp()
