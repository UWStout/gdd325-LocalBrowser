import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'

import Copyright from './Copyright.jsx'

const useStyles = makeStyles(theme => ({
  footer: {
    backgroundColor: theme.palette.background.paper,
    marginTop: theme.spacing(8),
    padding: theme.spacing(6, 0)
  }
}))

export default function PageFooter (props) {
  const classes = useStyles()
  return (
    <footer className={classes.footer}>
      <Container maxWidth="lg">
        <Typography variant="h6" align="center" gutterBottom>
          {props.footerTitle}
        </Typography>
        {props.children &&
          <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
            {props.children}
          </Typography>
        }
        <Copyright
          copyrightYear={props.copyrightYear}
          siteHref={props.siteHref}
          siteText={props.siteText} />
      </Container>
    </footer>
  )
}

PageFooter.propTypes = {
  children: PropTypes.node,
  footerTitle: PropTypes.string.isRequired,
  copyrightYear: PropTypes.number,
  siteHref: PropTypes.string.isRequired,
  siteText: PropTypes.string.isRequired
}
