import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'

const useStyles = makeStyles(theme => ({
  sidebarSection: {
    marginTop: theme.spacing(3)
  }
}))

export default function SidebarLinkList (props) {
  const classes = useStyles()
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom className={classes.sidebarSection}>
        {props.title}
      </Typography>
      {props.items.map((listItem, i) => (
        <Link display="block" variant="body1" target="_blank" rel="noreferrer" href={listItem.href} key={i}>
          {listItem.title}
        </Link>
      ))}
    </React.Fragment>
  )
}

SidebarLinkList.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired
}
