import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Link from 'next/link'
import { compose } from 'recompose'
import { Query } from 'react-apollo'
import Loader from '../components/Loader'
import withPolling from '../lib/withPolling'
import { H2, P } from '../components/Text'
import { GET_WALLET_USER } from '../lib/queries'

const Links = [
  { name: 'Game', url: '/game/list' },
  { name: 'Register', url: '/user/register' },
]

const StyledLink = styled.a`
  display:flex;
  align-items:center;
  justify-content:center;
  color:white;
  outline:none;
  padding:8px 12px;
  background:transparent;
  transition: all 0.4s ease;
  border: 1px solid transparent;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  &:hover{
    cursor:pointer;
    color:#ff9a00;
    text-decoration:none;
    border: 1px solid white;
  }
`
const LeftArea = styled.div`
  flex: 1;
  display:flex;
  align-items:center;
  justify-content:flex-start;
  height:100%;
  ${props => !props.mushroom && `
    cursor: pointer;
    opacity: 0.7;
    &:hover {
      opacity: 1;
    }
  `}
`
const CenterArea = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`
const RightArea = styled(LeftArea)`
  flex: 3;
  justify-content:flex-end;
  opacity: 1;
`
const Header = styled.div`
  background: rgba(6,9,14,0.95);
  width:100vw;
  height:85px;
  display:flex;
  position: relative;
`
const ImgWrapper = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  height:40px;
  margin-left:25px;
`
const Img = styled.img`
  height:70%;
`
const CoinGranpa = () => (
  <ImgWrapper>
    <Img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACNCAMAAABIfoInAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKtQTFRFv7+/7+/vQEBAgICABAcHEBAQn5+fgoODYGBgz8/P39/fICAgUFBQMDAwcHBwj4+Pr6+vf39/wMHBAgQEQ0VF4ODgIyYmYmRkkZOTAQEBFBcXoaKi7/DwoKCgUlVVkJCQ0NHRMjMzEhMTcnNzIiMjAQICcnR0gYOD3+DgUlNTQkREMjU1YWNjERISMTIyAwUFoKGhMDExMzY2AgMD0NDQsbKyAAAA////////7ZvLcgAAADl0Uk5T//////////////////////////////////////////////////////////////////////////8AOqxlQAAAB2JJREFUeNrEm+di4ygQgAdkMEKo+RynbrbvXu+H/f5PdiA3FZqEFPPHu46d+cJUhhEcgtY+aB0mLJhN+kQOmFv6WApYRnw4AywmPhABlpQfwgDLivcTwILyaVb4EWAp8ajMMhqwCbCMfJQQDM1r4iGAJeRzRoQWz08YLgKYXz5nkvHTa+o1RZhbPmBSaPHASIPhI4B55VeYJOiI0bz6CWBO+fRk+Oq1RIEBAWaTj5Is1+IRvfrfeICIzT/7HcHVmJgIc+1/2vhdcfa7YAJYwP8mA8TGHyiG4lORuglg/vTXtQxJ3ASwqPxS6kVvBYCYPK7SQQDLyee5PC/mB5hffkrkdQlkI1gMgMrOytEbAzDZA6gsWwCLyEe4Iz0rUqsZaoBMjlyDVNtXf/s3Ela54qECoHL8ciJULfMTg8SIBgBCTlmZNekkV8WXJsy0B4DkxEXN6j//PVliSUx9ACrnJDhFH8JSu4VCF4BNBpBDIdCovzE7VAr9HyLaenh5eN2tVl2A3CUCl8B1sZEYPYWZoo+gWiAq2p87Izw8rfRCHQCHeMH7ia2HN4g+eckvO5GXeofSUsUEcvTE+9Xq74cPqmpsA4BdfumKrUMAJC7xhna8BPKjvWxWq4fmjXdtALsNFr2/L/d+4iKxtevnvKz24HW1PvG1dAC11dH7v7YYRCOLnyFysY67i3LUh7erzekDLR0AC3ayJCwQNKbQ/P1333av1+1jV4C2DgDbgq0jwsnHH9T6uLYsKZX+X563T/eba/SRcr27ALR0YAUQLoCvK9dSxrn59bfH55f2t4VUPzkDtHQAYS5g2IFPny0b8OXx45dH9aFehpKf1uuzSbR0YAWAvc8GSGK0gOc/VvfNz3uW2XnjqgMrAPcCmNzww/3T7h+51wkp7/0oa0fuqw6sAPsAgAHkw+7bHSgTQAzjfqLAnU19NweAOQ5xgwMdHRFMOogAIJaiyPTdwdsXHdgAsB8gscShXFbG8NwNre+iAWwboEI2M4bH7rsligVIrDWxyYVUfug6NqeRAMReFmNDGBWD35hEAiSOY8EwjtJhZIvdgdTdFqB9+QNgXsUBUM/J8HoebuoRg12+jwMQzsOZ+iw5FWhpQcwxq4z0AvfxUNeBkmCMifUUlTY6gGwqAPX1p8TxiEiErXGZuAqS3AsgQpqXAA5jfe+siPyRML6Jo0+JICbXA1U0QeIqyysvAIsGqF0AhT8dx/dRU8fJKPMXJPE6oK6zYdvN+IiKaMxSfgCp9WjWijSlESCL3wHuOp5fzpcokeaiNI2/XlUA9iZdRlUgKQt8igohZfnodroCwCHNGDPADDpAcCimA0zSgYrPVZIkAmOdrygc6hAAZAYoJ9zr9DIKHCAEAMwAeSSASteBjUoLgOQTAFhd18q6+aVVSyIAxusAyKBXjCMAxusA8ACgjgDwFGa6d+cHgBgAT2GWDspBEMMLixgAd2GGSL9oQHk9BBARAE4doFz+O3jHAEBjAFw6KOTH+678v74+0iEA8jsitwIIl8vju932YfO8Xq9ft9utbuFtf073w1uzYmoucBdmGeH7l+f77asCeN5sNi+ma6sGgPvkYzuAvTCj9jA1uDf0hYLEAWAtjkW+DwZAmd8GbQA2HSB7soZ0cHNauW8J9w4Aabm/A3sLox2MzjdYTjtkTgBLYQbIcbFtmB/IvbdjSfAJwreECQDlTh/gdoDRhZk6CZhGOOyGCDqHzTrZkBmnaFJivbrgZDYAlCgxtXmOCBktUTcEcexJdHO+zfhJX/b8jmyDTIaGjR4DAmlpQAevl6fWlc4vPzomqUoylN/cP0DkFlzEP/3pGeWief/yFk08AnTvUnZH8d+Rf5aM0wJjXbSfJgAgsCflWf+t1583k4bZknn6IcY5pnCAGfohwwGSQAAxU09K3+ZGAHiPANOUEK4C1w1BxBaMACBoCSsImSmtZutMGnQQAsA9tc+4HeCusd47S31t6NxNb4+6ALj1BmZyR2RoUcg1WV05jWAWM0ioC8BSSWbDycjJizHncHvpckT3FF3gyrATgJfmc367SOcx8tWJ1f18QZ16tiAOQZW+wvOEBUPm73WbU+U0Bl38Uw8Ax8jf4NQMRTUaQg97Zt6HXCpm7naYKmbMEnq5muPqX/qmjibHXvCxGzwocv2P+dTMfCk/x+rLNz/oxJhFfeMX7i6Gwh71wkaCoPFbUR9bwZDGPHGJcqMvlAFt5ZkeekW5MeZy9lYAB4SJMSLxgrwNgLJE22GIChcDzAZwqNtjGP3+D34DgENFXKkvpQnGywIc0lyykfl/XgDdPCP0pgB6xgSPKUHyuQGavo0IT3u4nv/p+xSPKEGWADgcqCpHGNwQQCGo2IPpDQEOqMz0dBa/GcBJETKn7sBQLAhwHjoSLoYELwmgKtY6Oz75kd4IQHsla5Jhxii/DYDOUsXxmJCJEm4CoPehPGfCXCRV+vYAx424puMMF80JoXpLgOb7JcujarJYgNOjOvX1EHQLgFOwBFBHgrEq+F+AAQADwzyZ9J5+GwAAAABJRU5ErkJggg=="
    />
  </ImgWrapper>
)

const YellowText = styled(H2)`
  color: rgb(241,193,68);
`

const WhiteText = styled(YellowText)`
  color:white;
  margin-left: 10px;
`

const CircularImg = styled.img`
  height: 30px;
  border-radius: 100%;
  padding: 10px;
  background: #0B1C29;
  border: 1px white solid;
  margin-right: 15px;
  transition: all 0.4s ease;
  &:hover {
    border: 1px #0B1C29 solid;
    background: white;
  }
`

const WalletInfoWrapper = styled.div`
  margin-right: 10px;
  text-align: right;
`

const GrayText = styled(P)`
  color: gray;
`

const PriceIndicator = styled(P)`
  position: relative;
  background: transparent;
  padding: 5px 10px;
  transition: all 0.5s ease;
  width: 120px;
  &:after {
    position: absolute;
    right: 10px;
    content: ${props => `'${props.amount} ETH'`};
    color: transparent;
  }
  &:hover {
    color: transparent;
    &:after {
      color: white;
    }
  }
`

const MushroomImg = styled.img`
  height: 90%;
`
const MushroomSubImg = styled.img`
  height: 90%;
  transform: scale(2.4) translate(4px, 6px);
`

class HeaderComponent extends React.PureComponent {
  render() {
    const {
      walletAddress,
      mushroom = false,
    } = this.props

    return (
      <Header>
        <LeftArea mushroom={mushroom}>
          { mushroom
            ? (
              <React.Fragment>
                <MushroomImg src="/static/mushroom-logo.png" />
                <MushroomSubImg src="/static/mushroom-sub-logo.png" />
              </React.Fragment>
            )
            : (
              <Link prefetch href="/">
                <React.Fragment>
                  <CoinGranpa />
                  <WhiteText>COIN</WhiteText>
                  <YellowText>GRANDPA</YellowText>
                </React.Fragment>
              </Link>
            )
          }
        </LeftArea>
        <CenterArea>
          { !mushroom && (
            <Query
              query={GET_WALLET_USER}
              variables={{ address: walletAddress }}
              skip={!walletAddress}
            >
              {({ data, loading }) => {
                if (loading || !data) return null
                const { wallet: { user } } = data
                return Links
                  .filter(x => (!user ? x.name === 'Register' : x.name !== 'Register'))
                  .map(link => (
                    <Link prefetch href={link.url} key={link.name}>
                      <StyledLink>{link.name}</StyledLink>
                    </Link>
                  ))
              }}
            </Query>
          ) }
        </CenterArea>
        <RightArea>
          <Query
            query={GET_WALLET_USER}
            variables={{ address: walletAddress }}
            skip={!walletAddress}
          >
            {({ data, loading }) => {
              if (loading || !data) {
                return null
              }
              const { wallet: { user } } = data
              if (!user) return null
              const { name, claimable, image } = user
              return (
                <React.Fragment>
                  <WalletInfoWrapper>
                    <GrayText>
                      {name}
                    </GrayText>
                    <PriceIndicator amount={Number(claimable).toFixed(6)} label="claimable">
                      {Number(claimable).toFixed(2)}
                      {' '}
                      ETH
                    </PriceIndicator>
                  </WalletInfoWrapper>
                  <CircularImg src={image} />
                </React.Fragment>
              )
            }}
          </Query>
          <Query
            query={GET_WALLET_USER}
            variables={{ address: walletAddress }}
            skip={!walletAddress}
          >
            {({ data, loading }) => {
              if (loading || !data) {
                return (
                  <WalletInfoWrapper>
                    <Loader size={1} />
                  </WalletInfoWrapper>
                )
              }
              const { wallet: { address, balance } } = data
              const showLength = 2
              const shortAddress = `${address.slice(0, showLength)}...${address.slice(address.length - showLength, address.length + 1)}`
              return (
                <WalletInfoWrapper>
                  <GrayText>
                    {shortAddress}
                  </GrayText>
                  <PriceIndicator amount={Number(balance).toFixed(6)} label="balance">
                    {Number(balance).toFixed(2)}
                    {' '}
                    ETH
                  </PriceIndicator>
                </WalletInfoWrapper>
              )
            }}
          </Query>
          <CircularImg src="/static/eth.svg" />
        </RightArea>
      </Header>
    )
  }
}


HeaderComponent.propTypes = {
  walletAddress: PropTypes.string.isRequired,
  mushroom: PropTypes.bool, // eslint-disable-line
}

export default compose(
  withPolling,
)(HeaderComponent)
