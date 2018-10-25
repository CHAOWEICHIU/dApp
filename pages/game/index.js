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

const NoticeWording = styled.div`
  font-size: 14px;
  color: #31708F;
  min-height: 25px;
  display: flex;
  align-items: center;
  white-space: pre-line;
  min-height: 80px;
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
  transition: opacity 0.5s ease-in-out;
  ${props => (props.isDisabled
    ? `
      opacity: 0.3;
      pointer-events: none;
    `
    : `
      opacity: 1;
      cursor: pointer;
    `
  )}
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
      snapshotWinner: { name: '', number: '', timestamp: '' },
      banker: { address: '' },
      game: {
        lotteryAmount: '0',
        winningAmount: '0',
      },
      tempNumber: '',
      snapshotNumberMessage: '',
      numbers: [],
      keyPrice: '0',
      snapshotKeyPrice: '0',
      snapshotWinnerPrice: '0',
    }
  }

  componentDidMount() {
    const {
      params: { id },
      contractMethods: {
        getKeyPrice,
        getSnapshotKeyPrice,
        getSnapshotWinnerFee,
      },
    } = this.props
    this.gamePolling = setInterval(() => this.fetchGameInfo(id), 2000)
    this.polling = setInterval(this.updateUserInfo, 2000)
    this.snapshotWinnerPolling = setInterval(this.updateSnapshotWinner, 2000)
    Promise.all([
      getKeyPrice(),
      getSnapshotKeyPrice(),
      getSnapshotWinnerFee(),
    ])
      .then(([keyPrice, snapshotKeyPrice, snapshotWinnerPrice]) => this.setState({
        keyPrice,
        snapshotKeyPrice,
        snapshotWinnerPrice,
      }))
  }

  componentWillUnmount() {
    if (this.polling) {
      clearInterval(this.polling)
    }
    if (this.gamePolling) {
      clearInterval(this.gamePolling)
    }
  }

  updateSnapshotWinner = () => {
    const { contractMethods, params: { id } } = this.props
    contractMethods
      .getSnapshotWinner({ round: id })
      .then(({ name, number, timestamp }) => this.setState({
        snapshotWinner: { name, number, timestamp },
      }))
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
    const { contractMethods, params: { id } } = this.props
    contractMethods.buyKeys({ keys, address, round: id })
      .then(() => this.setState({ numbers: [], snapshotNumberMessage: '' }))
      .catch((err) => {
        console.log(err)
      })
  }

  snapshotKeys = (keys, address) => {
    const { contractMethods, params: { id } } = this.props
    contractMethods.snapshotKeys({ keys, address, round: id })
      .then(() => this.setState({ numbers: [], snapshotNumberMessage: '' }))
      .catch((err) => {
        console.log(err)
      })
  }

  snapshotWinner = (address, price) => {
    const { contractMethods, params: { id } } = this.props
    contractMethods.snapshotWinner({ address, round: id, price })
      .then((data) => {
        console.log('snapshotWinner',data);
        
      })
      .catch((err) => {
        console.log(err)
      })
  }

  getKeysSnapshotCount = ({ key }) => {
    if (!key) {
      return this.setState({ snapshotNumberMessage: '' })
    }
    const { contractMethods, params: { id } } = this.props
    return contractMethods.getKeysSnapshotCount({ round: id, key })
      .then(({ timestamp, count }) => {
        let msg = 'No One has bought it'
        if (Number(count) >= 1) {
          const timeDiff = moment(timestamp).diff(moment())
          msg = `
${key} has been bought for ${count} times.

Snapshot Time: ${moment.duration(timeDiff).humanize()} ago.

`
        }
        this.setState({ snapshotNumberMessage: msg })
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
      snapshotKeyPrice,
      snapshotNumberMessage,
      snapshotWinner,
      snapshotWinnerPrice,
    } = this.state
    const isValidNumberInput = !(tempNumber === '')
    const countDownTimeDiff = moment(game.endTime).diff(moment())
    const gameIsOver = countDownTimeDiff < 0
    const canBuyState = numbers.length > 0

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
          <Section sectionTitle="Winner">
            <SectionLabel>Snapshot Winner Name</SectionLabel>
            <SectionContent>{snapshotWinner.name}</SectionContent>
            <SectionLabel>Snapshot Time</SectionLabel>
            <SectionContent>
              {snapshotWinner.timestamp && moment
                .duration(moment(snapshotWinner.timestamp).diff(moment()))
                .humanize()
              }
            </SectionContent>
            <SectionLabel>Winning Number</SectionLabel>
            <SectionContent>{snapshotWinner.number}</SectionContent>
            <SectionLabel>Snapshot Fee</SectionLabel>
            <SectionContent>
              {snapshotWinnerPrice}
              {' '}
              eth
            </SectionContent>
            <StyledButton onClick={() => this.snapshotWinner(user.address, snapshotWinnerPrice)}>
              Snapshot Winner
            </StyledButton>
          </Section>
        </SectionWrapper>
        <SectionWrapper>
          <Section sectionTitle="Buy Key">
            <SectionLabel>Price to buy keys</SectionLabel>
            <SectionContent>
              {mul(keyPrice, numbers.length, '1.1')}
              {' '}
              eth
            </SectionContent>
            <BuyButton
              onClick={() => this.buyKeys(numbers, user.address)}
              isDisabled={!canBuyState}
            >
              Buy Numbers
            </BuyButton>

            <SectionLabel>Price to snapshot keys</SectionLabel>
            <SectionContent>
              {mul(snapshotKeyPrice, numbers.length, '1.1')}
              {' '}
              eth
            </SectionContent>
            <BuyButton
              onClick={() => this.snapshotKeys(numbers, user.address)}
              isDisabled={!canBuyState}
            >
              Snapshot Numbers
            </BuyButton>
            <Input
              label="Key"
              type="number"
              min="0"
              onChange={(e) => {
                const newValue = e.target.value
                this.updateFiled('tempNumber', newValue)
                this.getKeysSnapshotCount({ key: newValue })
              }}
              value={tempNumber}
            />
            <NoticeWording>
              {snapshotNumberMessage}
            </NoticeWording>
            <StyledButton
              isDisabled={!isValidNumberInput}
              onClick={() => {
                if (!isValidNumberInput) return
                this.setState({
                  tempNumber: '',
                  numbers: [tempNumber, ...numbers],
                  snapshotNumberMessage: '',
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
