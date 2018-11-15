import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Link from 'next/link'
import { H2 } from '../components/Text'

const Header = styled.div`
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
`

const RightArea = styled.div`
  flex: 10;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  height: 100%;
`

const LeftArea = styled(RightArea)`
  align-items: center;
  justify-content: flex-start;
  flex: 1 300px;
`

const StyledH3 = styled(H2)`
  color: black;
  margin-right: 15px;
  letter-spacing: 0;
  cursor: pointer;
  transition: all 0.4 ease;
  opacity: ${props => (props.isActive ? 1 : 0.3)};
  &:hover {
    opacity: 1;
  }
`

const pages = [
  { link: '/mushroom', name: '' },
]

const MushroomHeader = ({ pathname }) => (
  <Header>
    <LeftArea />
    <RightArea>
      {
        pages.map(page => (
          <Link
            replace
            prefetch
            href={{ pathname: page.link }}
            key={page.name}
          >
            <StyledH3 isActive={pathname === page.link}>
              {page.name}
            </StyledH3>
          </Link>
        ))
      }
    </RightArea>
  </Header>
)

MushroomHeader.propTypes = {
  pathname: PropTypes.string.isRequired,
}

export default MushroomHeader
