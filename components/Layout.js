import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Background = styled.div`
  background: black;
  height: 100vh;
  width: 100vw;
  overflow: auto;
  color: white;
`

const Layout = ({ children }) => (
  <Background>
    {children}
  </Background>
)

Layout.propTypes = {
  children: PropTypes.any, /* eslint-disable-line */
}

export default Layout
