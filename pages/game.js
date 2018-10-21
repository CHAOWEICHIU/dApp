import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { div } from '../utils/calculation'
import withContracts from '../lib/withContracts'
import Section from '../components/Section'
import Layout from '../components/Layout'

const SectionWrapper = styled.div`
  padding: 10px;
  display: flex;
  width: 100%;
  justify-content: center;
`

const LineWrapper = styled.div`
  display: flex;
  align-items: flex-end;
`

const SectionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`

const SectionLabel = styled.div`
  color: gray;
  font-size: 14px;
`
const SectionContent = styled.div`
  color: white;
  font-size: 16px;
  margin-bottom: 10px;
`

const EthImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 100%;
  background: #0B1C29;
  padding: 10px;
  margin-right: 10px;
`

const Color = styled.div`
  color: #458890;
`

class Game extends React.PureComponent {
  static async getInitialProps({ req }) {
    return { params: req.params }
  }

  constructor(props) {
    super(props)
    const { web3, contracts: { playerBook, numberGame } } = this.props
    this.web3 = web3
    this.playerBook = playerBook
    this.numberGame = numberGame
    this.state = {
      bankerAddress: '',
      lotteryAmount: '0',
      winningAmount: '0',
    }
  }

  componentDidMount() {
    const { params: { id } } = this.props
    this.fetchGameInfo(id)
  }

  /* eslint-disable no-underscore-dangle */
  fetchGameInfo = id => Promise.all([
    this.numberGame.methods.currentLottryPot_().call(),
    this.numberGame.methods.games_(id).call(),
  ])
    .then(([lottery, game]) => {
      this.setState({
        lotteryAmount: div(lottery, this.web3.utils.unitMap.ether),
        bankerAddress: game.bankerAddress,
        winningAmount: div(game.totalAmount, this.web3.utils.unitMap.ether),
      })
    })

  render() {
    const { bankerAddress, winningAmount, lotteryAmount } = this.state
    return (
      <Layout>
        <SectionWrapper>
          <Section sectionTitle="Banker Info">
            <SectionLabel>Address</SectionLabel>
            <SectionContent>{bankerAddress}</SectionContent>
          </Section>
        </SectionWrapper>
        <SectionContainer>
          <Section sectionTitle="Winning Pot">
            <LineWrapper>
              <EthImg src="static/eth.svg" />
              <Color>
                {winningAmount}
              </Color>
            </LineWrapper>
          </Section>
          <Section sectionTitle="Lottery Pot">
            <LineWrapper>
              <EthImg src="static/eth.svg" />
              <Color>{lotteryAmount}</Color>
            </LineWrapper>
          </Section>
        </SectionContainer>
        <SectionContainer>
          <Section sectionTitle="Passive Income">
            <LineWrapper>
              <EthImg src="static/eth.svg" />
              <Color>To earn 0.0931 every number is bought</Color>
            </LineWrapper>
          </Section>
          <Section sectionTitle="To Be Continue">
            <LineWrapper>
              <EthImg src="static/eth.svg" />
              <Color>Working In progress</Color>
            </LineWrapper>
          </Section>
        </SectionContainer>
      </Layout>
    )
  }
}

Game.propTypes = {
  contracts: PropTypes.object, /* eslint-disable-line */
  web3: PropTypes.object, /* eslint-disable-line */
  params: PropTypes.object, /* eslint-disable-line */
}

export default withContracts(Game)
