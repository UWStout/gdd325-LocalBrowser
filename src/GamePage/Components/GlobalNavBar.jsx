import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'
import ArrowBackIos from '@material-ui/icons/ArrowBackIos'

import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

const useStyles = makeStyles(theme => {
  return ({
    toolbar: {
      borderBottom: `1px solid ${theme.palette.divider}`
    },
    toolbarTitle: {
      flex: 1
    }
  })
})

export default function GlobalNavBar (props) {
  const classes = useStyles()
  return (
    <Toolbar className={classes.toolbar}>
      { props.showBackButton &&
        <Button size="small" onClick={(e) => { window.remountApp() }}><ArrowBackIos />Return to Game List</Button>
      }
      { !props.showBackButton &&
        <Typography>Click on a game below to view more</Typography>
      }
      <Typography
        component="h2"
        variant="h5"
        color="inherit"
        align="center"
        noWrap
        className={classes.toolbarTitle}
      >
        {props.title}
      </Typography>
      <Button variant="outlined" size="small" target="_blank" rel="noreferrer" href="https://www.uwstout.edu/game-design-and-development">
        UW Stout GDD Program
      </Button>
    </Toolbar>
  )
}

GlobalNavBar.propTypes = {
  title: PropTypes.string.isRequired,
  showBackButton: PropTypes.bool
}

GlobalNavBar.defaultProps = {
  showBackButton: true
}
