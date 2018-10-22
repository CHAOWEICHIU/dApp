import React from 'react'
import moment from 'moment'
import styled, { keyframes } from 'styled-components'
import PropTypes from 'prop-types'
import { div, mul } from '../../utils/calculation'
import withContracts from '../../lib/withContracts'
import Section, { SectionLabel, SectionContent, SectionWrapper } from '../../components/Section'
import Layout from '../../components/Layout'
import Input from '../../components/Input'

const LineWrapper = styled.div`
  display: flex;
  align-items: flex-end;
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

const StyledButton = styled.div`
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px gray solid;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0 20px;
  font-size: 30px;
  opacity: ${props => (props.isDisabled ? 0.2 : 1)};
  cursor: ${props => (props.isDisabled ? 'default' : 'pointer')};
`

const NumbersContainerWrapper = styled.div`
  width: 100%;
  height: 500px;
  overflow: scroll;
`

const NumbersContainer = styled.div`
  display: grid;
  grid-column-gap: 10px;
  grid-template-columns: auto auto auto;
  grid-auto-rows: 125px;
  width: 100%;
  height: 500px;
  overflow: scroll;
`

const shakingAnimation = keyframes`
  100% {
    transform: translateX(10px) translateY(10px);
  }
`

const NumberLine = styled.div`
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px white solid;
  color: white;
  cursor: pointer;
  user-select: none;
  transition: color 1s;
  &:hover {
    animation: ${shakingAnimation} 10ms linear infinite;
    color: red;
    border: 1px red solid;
  }
`

const BuyButton = styled.div`
  margin: 10px 0 30px 0;
  width: 340px;
  border: 1px solid white;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
      user: { address: '', balance: '0' },
      banker: { address: '' },
      game: {
        lotteryAmount: '0',
        winningAmount: '0',
      },
      tempNumber: '',
      numbers: [],
      keyPrice: '0',
    }
  }

  componentDidMount() {
    const { params: { id }, contractMethods: { getKeyPrice } } = this.props
    this.gamePooling = setInterval(this.fetchGameInfo(id), 1000)
    this.polling = setInterval(this.updateUserInfo, 2000)
    getKeyPrice().then(price => this.setState({ keyPrice: price }))
  }

  componentWillUnmount() {
    if (this.polling) {
      clearInterval(this.polling)
    }
    if (this.gamePooling) {
      clearInterval(this.gamePooling)
    }
  }

  updateUserInfo = () => {
    const { contractMethods: { getUserInformationWithAddress }, getCurrentMetaAccount } = this.props
    getCurrentMetaAccount()
      .then((address) => {
        getUserInformationWithAddress(address)
          .then((user) => {
            this.setState({ user })
          })
      })
  }

  getWalletInfoWithAddress = address => this.web3.eth.getBalance(address)
    .then(balance => ({
      balance: div(balance, this.web3.utils.unitMap.ether),
      address,
    }))

  updateFiled = (key, value) => this.setState({ [key]: value })

  removeTarget = (key, index) => {
    const targets = this.state[key] /* eslint-disable-line */
    this.setState({
      [key]: [
        ...targets.slice(0, index),
        ...targets.slice(index + 1),
      ],
    })
  }

  buyKeys = (keys, address) => {
    const { contractMethods } = this.props
    contractMethods.buyKeys({ keys, address })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  fetchGameInfo = (id) => {
    const { contractMethods: { getCurrentLotteryPotAmount, getGameById } } = this.props
    Promise.all([
      getCurrentLotteryPotAmount(),
      getGameById(id),
    ])
      .then(([lotteryAmount, game]) => this.setState({
        banker: game.banker,
        game: Object.assign(game, { lotteryAmount }),
      }))
  }

  render() {
    const {
      banker,
      game,
      tempNumber,
      numbers,
      user,
      keyPrice,
    } = this.state
    const isValidNumberInput = !(tempNumber === '')
    const countDownTimeDiff = moment(game.endTime).diff(moment())
    const gameIsOver = countDownTimeDiff < 0

    return (
      <Layout>
        <SectionWrapper>
          <Section sectionTitle="Banker Info">
            <SectionLabel>Address</SectionLabel>
            <SectionContent>{banker.address}</SectionContent>
            <SectionLabel>Name</SectionLabel>
            <SectionContent>{banker.name}</SectionContent>
          </Section>
          <Section sectionTitle="User Info">
            <SectionLabel>Address</SectionLabel>
            <SectionContent>{user.address}</SectionContent>
            <SectionLabel>Name</SectionLabel>
            <SectionContent>{user.name}</SectionContent>
            <SectionLabel>Balance</SectionLabel>
            <SectionContent>{user.balance}</SectionContent>
            <SectionLabel>Claimable</SectionLabel>
            <SectionContent>{user.claimable}</SectionContent>
          </Section>
        </SectionWrapper>
        <SectionWrapper>
          <Section sectionTitle="Game Time Info">
            <SectionLabel>Start</SectionLabel>
            <SectionContent>{moment(game.startTime).format('YYYY-MM-DD HH:mm:ss')}</SectionContent>
            <SectionLabel>End</SectionLabel>
            <SectionContent>{moment(game.endTime).format('YYYY-MM-DD HH:mm:ss')}</SectionContent>
            <SectionLabel>Count Down</SectionLabel>
            <SectionContent>
              {
                gameIsOver
                  ? '00:00:00'
                  : moment.utc(countDownTimeDiff).format('HH:mm:ss')
              }
            </SectionContent>
          </Section>
        </SectionWrapper>
        <SectionWrapper>
          <Section sectionTitle="Winning Pot">
            <LineWrapper>
              <EthImg src="/static/eth.svg" />
              <Color>
                {game.winningAmount}
              </Color>
            </LineWrapper>
          </Section>
          <Section sectionTitle="Lottery Pot">
            <LineWrapper>
              <EthImg src="/static/eth.svg" />
              <Color>{game.lotteryAmount}</Color>
            </LineWrapper>
          </Section>
          <Section sectionTitle="Passive Income">
            <LineWrapper>
              <EthImg src="/static/eth.svg" />
              <Color>To earn 0.0931 every number is bought</Color>
            </LineWrapper>
          </Section>
        </SectionWrapper>
        <SectionWrapper>
          <Section sectionTitle="Buy Key">
            <SectionLabel>Price</SectionLabel>
            <SectionContent>
              {mul(keyPrice, numbers.length, '1.1')}
              {' '}
              ETH
            </SectionContent>
            <br />
            <BuyButton onClick={() => this.buyKeys(numbers, user.address)}>Buy</BuyButton>
            <Input
              label="Key"
              type="number"
              min="0"
              onChange={e => this.updateFiled('tempNumber', e.target.value)}
              value={tempNumber}
            />
            <StyledButton
              isDisabled={!isValidNumberInput}
              onClick={() => {
                if (!isValidNumberInput) return
                this.setState({
                  tempNumber: '',
                  numbers: [tempNumber, ...numbers],
                })
              }}
            >
              +
            </StyledButton>
            {
              numbers.length === 0
                ? <NumbersContainerWrapper />
                : (
                  <NumbersContainer>
                    {numbers.map((value, index) => (
                      <NumberLine
                        onClick={() => this.removeTarget('numbers', index)}
                        key={value}
                      >
                        {value}
                      </NumberLine>
                    ))}
                  </NumbersContainer>
                )
            }
          </Section>
        </SectionWrapper>
      </Layout>
    )
  }
}

Game.propTypes = {
  contracts: PropTypes.object, /* eslint-disable-line */
  web3: PropTypes.object, /* eslint-disable-line */
  params: PropTypes.object, /* eslint-disable-line */
  contractMethods: PropTypes.object, /* eslint-disable-line */
  getCurrentMetaAccount: PropTypes.func.isRequired,
}

export default withContracts(Game)
