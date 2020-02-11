import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'

import { green } from '@material-ui/core/colors'
import Box from '@material-ui/core/Box'
import CircularProgress from '@material-ui/core/CircularProgress'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import Fade from '@material-ui/core/Fade'

// Styles for the media grid elements
const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper
  },
  titleBar: {
    background:
      'linear-gradient(to top, rgba(0,0,0,0.7) 0%, ' +
      'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)'
  },
  loading: {
    color: green[500]
  }
}))

export default function GameListGrid (props) {
  const classes = useStyles()

  // Are images still loading
  const [loading, setLoading] = useState(true)

  // Count images and signal all loaded when done
  const loadedImageCount = useRef(0)
  function mediaDone () {
    loadedImageCount.current += 1
    if (loadedImageCount.current === props.gameList.length) {
      setLoading(false)
    }
  }

  // Build the grid list and game tiles
  return (
    <React.Fragment>
      <div className={classes.root}>
        { /* Output Grid list to hold all the game tiles */ }
        <GridList cellHeight={340} className={classes.gridList} spacing={10} cols={4}>
          { /* Output grid tile for each game passed in */ }
          {props.gameList.map((gameTile, i) => (
            <GridListTile width={1} key={`gameTile${i}`}
              cols={gameTile.cols || 1}
              className={classes.gridListTile}
              onClick={ (e) => { (!loading) && props.activateGameCallback(i) }}>
              <Fade in={!loading} timeout={1000}>
                <div>
                  <img style={{ display: (loading ? 'none' : 'block'), height: 340 }}
                    src={ gameTile.banner } alt={ loading ? 'Loading ...' : gameTile.bannerAlt }
                    onLoad={ mediaDone } onError={ mediaDone } className="MuiGridListTile-imgFullHeight" />
                  { gameTile.title &&
                    <GridListTileBar
                      classes={{ root: classes.titleBar, title: classes.title }}
                      title={gameTile.title} />
                  }
                </div>
              </Fade>
              {loading &&
                <Box minWidth={500} minHeight={340} display="flex" alignItems="center" justifyContent="center">
                  <CircularProgress className={classes.loading} />
                </Box>
              }
            </GridListTile>
          ))}
        </GridList>
      </div>
    </React.Fragment>
  )
}

GameListGrid.propTypes = {
  gameList: PropTypes.arrayOf(PropTypes.object).isRequired,
  activateGameCallback: PropTypes.func.isRequired
}
