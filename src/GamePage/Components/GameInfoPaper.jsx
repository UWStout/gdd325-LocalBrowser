import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'

import Grid from '@material-ui/core/Grid'
import Fade from '@material-ui/core/Fade'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline'

import * as PlatformIcons from './PlatformIcons.jsx'

import GameBanner from './GameBanner.jsx'
import GameMediaGrid from './GameMediaGrid.jsx'
import AboutSidebar from './AboutSidebar.jsx'

import Markdown from './markdown.js'

import GameData from './GameData'
import { useArchives, useGameMarkdown } from './gameDataHelper.js'
import { useThumbnailLink } from './vimeoLinkHelper.js'

const useStyles = makeStyles(theme => ({
  mainGrid: {
    marginTop: theme.spacing(3)
  },
  markdown: {
    ...theme.typography.body2,
    padding: theme.spacing(3, 0)
  }
}))

const sidebarSections = [{
  title: 'Social Media',
  items: [
    { title: 'GitHub', href: 'https://www.github.com/UWStout' },
    { title: 'Twitter', href: 'https://twitter.com/uwstoutgdd' },
    { title: 'Facebook', href: 'https://www.facebook.com/uwstoutgdd/' }
  ]
}]

export default function GameInfoPaper (props) {
  const classes = useStyles()

  // Setup state for the archives links
  const archives = useArchives()
  if (archives && (sidebarSections.length <= 0 || sidebarSections[sidebarSections.length - 1].title !== 'Game Archives')) {
    sidebarSections.push({
      title: 'Game Archives',
      items: archives
    })
  }

  // Setup[ state for the game deascription markdown
  const gameMD = useGameMarkdown(props.gameMDURL)

  // Queue up any thumbnail links to load
  let localReadyCount = 0
  props.game.media.forEach((mediaData) => {
    // The size of game.media cannot change while this page is loaded
    // so this loop is guaranteed to run the same number of times always.
    // Because of this, we can ignore the 'don't call hooks in loops' rule.

    /* eslint-disable react-hooks/rules-of-hooks */
    const [mediaReady, setMediaReady] = useState(false)
    useThumbnailLink(mediaData, () => { setMediaReady(true) })
    /* eslint-enable react-hooks/rules-of-hooks */
    if (mediaReady) { localReadyCount++ }
  })

  // Is the page content ready?
  const [pageIsReady, setPageIsReady] = useState(false)
  useEffect(() => {
    if (localReadyCount === props.game.media.length && gameMD && archives) {
      setPageIsReady(true)
    }
  }, [props, localReadyCount, archives, gameMD])

  return (
    <main>
      <Fade in={pageIsReady} timeout={1000}>
        <Paper>
          { props.game &&
          <React.Fragment>
            <GameBanner
              imgSrc={props.game.bannerWide}
              imgAlt={`${props.game.title} Banner Image`}
              title={props.game.title}
              byLine={props.game.byLine}/>

            {/* Media grid for images and videos */}
            <a name="MediaAnchor"></a>
            <GameMediaGrid mediaItems={props.game.media} />

            <Grid container spacing={2} className={classes.mainGrid}>
              <Grid item xs={12} md={8}>
                <div style={{ padding: 20 }}>
                  {/* Game Play Buttons */}
                  <a name="PlayAnchor"></a>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Tooltip placement="bottom" title="Play in your web browser" aria-label="Play the game in your web browser">
                        <Button fullWidth variant="contained" color="primary" href={props.game.webPlayLink} target="_blank" endIcon={<PlayCircleOutlineIcon />}>Play</Button>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={4}>
                      <Tooltip placement="bottom" title={props.game.windowsDownloadLink ? 'Download windows exe' : 'Windows exe not available'}>
                        <span><Button fullWidth variant="contained" color="primary" disabled={!props.game.windowsDownloadLink} href={props.game.windowsDownloadLink} target="_blank" endIcon={<PlatformIcons.WindowsIcon />}>Win Download</Button></span>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={4}>
                      <Tooltip placement="bottom" title={props.game.macOSDownloadLink ? 'Download MacOS app' : 'MacOS app not available'}>
                        <span><Button fullWidth variant="contained" color="primary" disabled={!props.game.macOSDownloadLink} href={props.game.macOSDownloadLink} target="_blank" endIcon={<PlatformIcons.MacOSIcon />}>Mac Download</Button></span>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </div>
                <div style={{ padding: 20 }}>
                  <a name="GameInfoAnchor"></a>
                  {/* Main game description */}
                  {gameMD &&
                    <Markdown className={classes.markdown}>{gameMD}</Markdown>
                  }
                </div>
              </Grid>

              {/* Sidebar with a quick 'about' box and links to other semesters and social media. */}
              <Grid item xs={12} md={4}>
                <div style={{ padding: 20 }}>
                  <a name="OtherAnchor"></a>
                  <AboutSidebar sections={sidebarSections}>
                    {props.game.title} was created as part of the UW Stout Jr. level game design course, GDD 325.
                    Students worked in teams to create a 2d game using the JavaScript game library {props.phaserName}.
                  </AboutSidebar>
                </div>
              </Grid>
            </Grid>
          </React.Fragment>
          }
        </Paper>
      </Fade>
    </main>
  )
}

GameInfoPaper.propTypes = {
  phaserName: PropTypes.string,
  game: PropTypes.instanceOf(GameData).isRequired,
  gameMDURL: PropTypes.string.isRequired
}

GameInfoPaper.defaultProps = {
  phaserName: 'Phaser CE'
}
