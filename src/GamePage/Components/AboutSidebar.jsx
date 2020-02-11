import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'

import AboutBox from './AboutBox.jsx'
import SidebarLinkList from './SidebarLinkList.jsx'

const useStyles = makeStyles(theme => ({
  sidebarAboutBox: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[200]
  }
}))

class AboutSidebar extends React.Component {
  constructor (props) {
    super(props)
    this.classes = useStyles
  }

  render () {
    return (
      <React.Fragment>
        <AboutBox title="About">{this.props.children}</AboutBox>
        {this.props.sections.map((collection, i) => (
          <SidebarLinkList title={collection.title} items={collection.items} key={i} />
        ))}
      </React.Fragment>
    )
  }
}

AboutSidebar.propTypes = {
  children: PropTypes.node,
  sections: PropTypes.arrayOf(PropTypes.object)
}

export default AboutSidebar
