import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'

import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'

const useStyles = makeStyles(theme => ({
  gameBanner: {
    position: 'relative',
    backgroundColor: theme.palette.grey[800],
    color: theme.palette.common.white,
    marginBottom: theme.spacing(4),
    backgroundImage: '',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,.3)'
  },
  gameBannerContent: {
    position: 'relative',
    padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(6),
      paddingRight: 0
    }
  }
}))

export default function FeaturedPost (props) {
  const classes = useStyles()
  return (
    <Paper className={classes.gameBanner} style={{ backgroundImage: `url(${props.imgSrc})` }}>
      { props.imgSrc &&
        <img
          style={{ display: 'none' }}
          src={props.imgSrc}
          alt={props.imgAlt}
        />
      }
      <div className={classes.overlay} />
      <Grid container>
        <Grid item md={6}>
          <div className={classes.gameBannerContent}>
            <Typography component="h1" variant="h3" color="inherit" gutterBottom>
              {props.title}
            </Typography>
            <Typography variant="h5" color="inherit" paragraph>
              {props.byLine}
            </Typography>
            {props.linkHref &&
              <Link variant="subtitle1" href={props.linkHref}>
                {props.linkText || props.linkHref}
              </Link>
            }
          </div>
        </Grid>
      </Grid>
    </Paper>
  )
}

/* Original version
{/* Main featured post }
<Paper className={classes.mainFeaturedPost}>
{/* Increase the priority of the hero background image }
{
  <img
    style={{ display: 'none' }}
    src="https://source.unsplash.com/user/erondu"
    alt="background"
  />
}
<div className={classes.overlay} />
<Grid container>
  <Grid item md={6}>
    <div className={classes.mainFeaturedPostContent}>
      <Typography component="h1" variant="h3" color="inherit" gutterBottom>
        Title of a longer featured blog post
      </Typography>
      <Typography variant="h5" color="inherit" paragraph>
        Multiple lines of text that form the lede, informing new readers quickly and
        efficiently about what&apos;s most interesting in this post&apos;s contents.
      </Typography>
      <Link variant="subtitle1" href="#">
        Continue reading…
      </Link>
    </div>
  </Grid>
</Grid>
</Paper>
*/

FeaturedPost.propTypes = {
  title: PropTypes.string.isRequired,
  imgSrc: PropTypes.string,
  imgAlt: PropTypes.string,
  byLine: PropTypes.string,
  linkText: PropTypes.string,
  linkHref: PropTypes.string
}
