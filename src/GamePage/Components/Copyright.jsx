import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'

export default function Copyright (props) {
  return (
    <Typography variant="body2" color="textSecondary" align="center" rel="noreferrer" target="_blank">
      {'Copyright © '}
      <Link color="inherit" href={props.siteHref}>
        {props.siteText}
      </Link>{' '}
      {(props.copyrightYear || new Date().getFullYear())}
      {'.'}
    </Typography>
  )
}

Copyright.propTypes = {
  copyrightYear: PropTypes.number,
  siteHref: PropTypes.string.isRequired,
  siteText: PropTypes.string.isRequired
}
