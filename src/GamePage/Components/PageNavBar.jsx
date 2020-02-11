import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'

import Toolbar from '@material-ui/core/Toolbar'
import Link from '@material-ui/core/Link'

const useStyles = makeStyles(theme => ({
  toolbarSecondary: {
    justifyContent: 'space-between',
    overflowX: 'auto'
  },
  toolbarLink: {
    padding: theme.spacing(1),
    flexShrink: 0
  }
}))

export default function PageNavBar (props) {
  const classes = useStyles()
  return (
    <Toolbar component="nav" variant="dense" className={classes.toolbarSecondary}>
      {props.sections.map((section, i) => (
        <Link
          color="inherit"
          noWrap
          key={i}
          variant="body2"
          href={`#${section.replace(/[\W]/g, '')}Anchor`}
          className={classes.toolbarLink}
        >
          {section}
        </Link>
      ))}
    </Toolbar>
  )
}

PageNavBar.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.string).isRequired
}
