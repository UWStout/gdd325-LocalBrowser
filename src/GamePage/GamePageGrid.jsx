// Basic react includes
import React, { useState } from 'react'

import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import Dialog from '@material-ui/core/Dialog'
import Slide from '@material-ui/core/Slide'
import Button from '@material-ui/core/Button'
import CloseIcon from '@material-ui/icons/Close'

import GlobalNavBar from './Components/GlobalNavBar.jsx'
import PageFooter from './Components/PageFooter.jsx'

import { useJSON } from './Components/gameDataHelper.js'
import GameListGrid from './Components/GameListGrid.jsx'

const DialogTransition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

// Render the basic game grid
export default function GamePageGrid (props) {
  // State for which game is currently selected
  const [activeGame, setActiveGame] = useState(-1)

  // State of the game dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const handleOpenGame = (which) => {
    if (which >= 0 && which < gameList.length) {
      setActiveGame(which)
      setDialogOpen(true)
    }
  }

  const handleCloseGame = () => {
    // setActiveGame(-1)
    // setDialogOpen(false)
    window.remountApp()
  }

  // Retrieve the game list from the root of the server
  const gameList = useJSON('gameList.json')

  let activePlayLink = ''
  if (activeGame >= 0 && activeGame < gameList.length) {
    activePlayLink = gameList[activeGame].playLink
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="lg">
        {/* Upper page global navigation bar */}
        <GlobalNavBar title="UW Stout GDD Games Showcase" showBackButton={false} />

        {/* Main content. Will be game select grid or game page. */}
        { gameList && gameList !== 'wait' &&
          <React.Fragment>
            {/* Game grid content */}
            <GameListGrid gameList={gameList}
              activateGameCallback={handleOpenGame} />
          </React.Fragment>
        }
      </Container>

      { makeGamedialog(dialogOpen, handleCloseGame, activePlayLink) }

      {/* Page footer with copyright info and link to UWStout main page. */}
      <PageFooter footerTitle="Ownership and Copyright" siteText="University of Wisconsin Stout" siteHref="https://www.uwstout.edu">
        All games, including all code and art assets, are the property of the students that created them.
      </PageFooter>
    </React.Fragment>
  )
}

function makeGamedialog (open, handleClose, url) {
  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={DialogTransition}>
      <iframe src={url} style={{ width: '100%', height: '100%' }}></iframe>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <Button variant="contained" color="default" onClick={handleClose} aria-label="close" startIcon={<CloseIcon />}>
          Close
        </Button>
      </div>
    </Dialog>
  )
}
