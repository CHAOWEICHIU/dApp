import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { compose } from 'recompose'
import withPolling from '../lib/withPolling'
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

const Img = styled.img`
  height: 90%;
`
const SubImg = styled.img`
  height: 90%;
  transform: scale(2.4) translate(4px, 6px);
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
  { link: '/mushroom', name: 'Home' },
  { link: '/mushroom/us', name: 'Us' },
  { link: '/mushroom/mall', name: 'ShroomMall' },
  { link: '/mushroom/coin', name: 'ShroomCoin' },
  { link: '/mushroom/faq', name: 'FAQ' },
]

class MushroomHeader extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      activePageIndex: 0,
    }
  }
  
  render() {
    const { pathname } = this.props
    const { activePageIndex } = this.state

    console.log(pathname)
    return (
      <Header>
        <LeftArea>
          <Img src="/static/mushroom-logo.png" />
          <SubImg src="/static/mushroom-sub-logo.png" />
        </LeftArea>
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
  }
}

export default MushroomHeader
