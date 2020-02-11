import React from 'react'
import PropTypes from 'prop-types'

import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'

import GlobalNavBar from './Components/GlobalNavBar.jsx'
import PageNavBar from './Components/PageNavBar.jsx'
import PageFooter from './Components/PageFooter.jsx'

import { useGame } from './Components/gameDataHelper.js'
import GameInfoPaper from './Components/GameInfoPaper.jsx'

const sections = [
  'Trailer',
  'Screenshots',
  'Play',
  'Credits',
  'Other'
]

export default function GamePage (props) {
  // Setup state for the game object, retrieved asynchronously
  const game = useGame(props.gameDataURL)

  // Pre-create the page title
  const pageTitle = `${props.studioName} / ${game ? game.title : 'Loading ...'}`

  // Render the game page
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="lg">
        {/* Upper page navigation */}
        <GlobalNavBar title={pageTitle}/>
        <PageNavBar sections={sections} />

        {/* Main game page content */}
        { game &&
          <GameInfoPaper
            phaserName={props.phaserName}
            game={game}
            gameMDURL={props.gameMDURL} />
        }
      </Container>

      {/* Page footer with copyright info and link to UWStout main page. */}
      <PageFooter footerTitle="Footer" siteText="UW Stout GDD Program" siteHref="https://www.uwstout.edu">
        Something here to give the footer a purpose!
      </PageFooter>
    </React.Fragment>
  )
}

GamePage.propTypes = {
  phaserName: PropTypes.string,
  studioName: PropTypes.string.isRequired,
  gameDataURL: PropTypes.string.isRequired,
  gameMDURL: PropTypes.string.isRequired
}

GamePage.defaultProps = {
  phaserName: 'Phaser CE'
}
