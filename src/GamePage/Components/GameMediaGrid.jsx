import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'

import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import ListSubheader from '@material-ui/core/ListSubheader'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Slide from '@material-ui/core/Slide'

// Transition component for the dialog
const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction="up" timeout={2000} ref={ref} {...props} />
})

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
  listSubheader: {
    fontSize: '24px'
  }
}))

export default function GameMediaGrid (props) {
  const classes = useStyles()

  // State to toggle the modal dialog to show large media
  const [activeMedia, setActiveMedia] = useState(-1)
  const handleClose = () => { setActiveMedia(-1) }

  // Build the grid list and media tiles
  return (
    <React.Fragment>
      <div className={classes.root}>
        { /* Output Grid list to hold all the media tiles */ }
        <GridList cellHeight={200} className={classes.gridList} spacing={10} cols={3}>
          { /* Output general title for the grid of media */ }
          <GridListTile key="MediaGridSubheader" cols={3} style={{ height: 'auto' }}>
            <ListSubheader component="div" className={classes.listSubheader}>Media and Screenshots</ListSubheader>
          </GridListTile>
          { /* Output grid tile for each media item passed (may be images or vimeo videos) */ }
          {props.mediaItems.map((mediaTile, i) => (
            <GridListTile
              cols={mediaTile.cols || 1}
              className={classes.gridListTile}
              key={`mediaTile${i}`}
              onClick={ (e) => { setActiveMedia(i) }}>
              <img src={mediaTile.thumb || mediaTile.link} alt={mediaTile.alt} />
              <GridListTileBar
                classes={{ root: classes.titleBar, title: classes.title }}
                title={mediaTile.title} />
            </GridListTile>
          ))}
        </GridList>
      </div>
      { /* If there is an active media tile, show it in a large modal dialog */ }
      { activeMedia >= 0 && activeMedia < props.mediaItems.length &&
        makeMediaDialog(props.mediaItems[activeMedia], handleClose)
      }
    </React.Fragment>
  )
}

/**
 * This function will make a modal dialog to show a media item full size in the web browser.
 * Should be activated when a smaller media tile is clicked.
 *
 * @param {Object} tile Info about the media tile to show in the dialog.
 * @param {function} handleClose Callback for the dialog close operation.
 */
function makeMediaDialog (tile, handleClose) {
  return (
    <Dialog TransitionComponent={Transition} fullWidth={true} maxWidth="lg" open={true}
      keepMounted onClose={handleClose} aria-labelledby="media-dialog-title">
      <DialogTitle id="media-dialog-title">{tile.title}</DialogTitle>
      <DialogContent dividers={true}>
        {tile.type === 'video' &&
          <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
            <iframe
              src={`https://player.vimeo.com/video/${tile.vimeoID}?byline=0&portrait=0`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen>
            </iframe>
            <script src="https://player.vimeo.com/api/player.js"></script>
          </div>
        }
        {tile.type !== 'video' &&
          <img src={tile.link} alt={tile.alt} width="100%" />
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

GameMediaGrid.propTypes = {
  mediaItems: PropTypes.arrayOf(PropTypes.object).isRequired
}
