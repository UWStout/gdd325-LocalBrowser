import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'

const useStyles = makeStyles(theme => ({
  aboutBox: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[200]
  }
}))

export default function AboutBox (props) {
  const classes = useStyles()
  return (
    <Paper elevation={0} className={classes.aboutBox}>
      <Typography variant="h6" gutterBottom>{props.title}</Typography>
      <Typography>{props.children}</Typography>
    </Paper>
  )
}

AboutBox.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string
}
