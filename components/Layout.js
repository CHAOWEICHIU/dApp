import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Background = styled.div`
  ${props => (
    props.mushroom
      ? `
        background-image: url('/static/mushroom-background.png');
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        overflow: hidden;
      ` : `
        background: black;
        overflow: auto;
      `
  )}
  height: 100vh;
  width: 100vw;
  color: white;
`

const Layout = ({ children, mushroom = false }) => (
  <Background mushroom={mushroom}>
    {children}
  </Background>
)

Layout.propTypes = {
  children: PropTypes.any, /* eslint-disable-line */
  mushroom: PropTypes.bool, /* eslint-disable-line */
}

export default Layout
