import React from 'react'
import moment from 'moment'
import styled, { keyframes } from 'styled-components'
import { compose } from 'recompose'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import { GET_GAMES } from '../../lib/queries'
import Header from '../../containers/Header'
import { mul } from '../../utils/calculation'
import withPolling from '../../lib/withPolling'
import Section, { SectionLabel, SectionContent, SectionWrapper } from '../../components/Section'
import Layout from '../../components/Layout'
import Input from '../../components/Input'
import Loader from '../../components/Loader'

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
  height: 200px;
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

const CenterWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Img = styled.img`
  width: 50%;
`

class GamePage extends React.PureComponent {
  static async getInitialProps({ req }) {
    return { params: req.params }
  }

  constructor(props) {
    super(props)
    this.state = {
      tempNumber: '',
      snapshotNumberMessage: '',
      numbers: [],
      keyPrice: '0',
      currentTime: moment(),
    }
  }

  componentDidMount() {
    const {
      apolloClient: {
        watchQuery,
      },
      params: { id },
    } = this.props

    this.timer = setInterval(() => {
      this.setState({ currentTime: moment() })
    }, 1000)

    this.pollingGame = watchQuery({
      query: GET_GAMES,
      variables: { gameIds: [Number(id)] },
      pollInterval: 2000,
      ssr: false,
    }).subscribe()
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.pollingGame) {
      this.pollingGame.unsubscribe()
    }
  }

  updateFiled = (key, value) => this.setState({ [key]: value })

  removeTarget = (key, index) => {
    const targets = this.state[key] // eslint-disable-line
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
      .catch(err => console.log(err))
  }

  snapshotKeys = (keys, address) => {
    const { contractMethods, params: { id } } = this.props
    contractMethods.snapshotKeys({ keys, address, round: id })
      .then(() => this.setState({ numbers: [], snapshotNumberMessage: '' }))
      .catch(err => console.log(err))
  }

  snapshotWinner = (address, price) => {
    const { contractMethods, params: { id } } = this.props
    contractMethods.snapshotWinner({ address, round: id, price })
      .then(() => {})
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

  render() {
    const {
      params: { id },
      walletAddress,
    } = this.props
    const {
      currentTime,
      numbers,
      tempNumber,
      snapshotNumberMessage,
    } = this.state

    return (
      <Layout>
        <Header />
        <Query
          query={GET_GAMES}
          variables={{ gameIds: [Number(id)] }}
          skip={!id}
        >
          {({ data, loading }) => {
            if (loading || !data) {
              return (<Loader />)
            }
            const { gameInformation: { games: [game], potAmountLottery } } = data
            const isValidNumberInput = !(tempNumber === '')
            const countDownTimeDiff = moment(game.endTime).diff(currentTime)
            const gameIsOver = countDownTimeDiff < 0
            const canBuyState = numbers.length > 0

            return (
              <React.Fragment>
                <SectionWrapper>
                  <Section sectionTitle="Winning Pot">
                    <LineWrapper>
                      <EthImg src="/static/eth.svg" />
                      <Color>
                        {game.potAmountWinning}
                      </Color>
                    </LineWrapper>
                  </Section>
                  <Section sectionTitle="Game Info">
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
                    <SectionContent>
                      <CenterWrapper>
                        {game.winner.wallet && 'Current Winner Info'}
                      </CenterWrapper>
                    </SectionContent>
                    { !game.winner.wallet && (
                      <SectionContent>
                        <CenterWrapper>
                          Waiting For a Winner
                        </CenterWrapper>
                      </SectionContent>
                    ) }
                    { game.winner.wallet && (
                      <CenterWrapper>
                        <Img src={game.winner.wallet.user.image} />
                      </CenterWrapper>
                    ) }
                    <SectionContent>
                      <CenterWrapper>
                        Updated at
                        {' '}
                        {moment.duration(moment(game.winner.timestamp).diff(moment())).humanize()}
                        {' '}
                        age
                      </CenterWrapper>
                    </SectionContent>
                  </Section>
                  <Section sectionTitle="Lottery Pot">
                    <LineWrapper>
                      <EthImg src="/static/eth.svg" />
                      <Color>{potAmountLottery}</Color>
                    </LineWrapper>
                  </Section>
                </SectionWrapper>
                <SectionWrapper>
                  <Section sectionTitle="Buy Number">
                    <SectionLabel>
                      Price to buy one number $
                      {game.feeKeyPurchasing}
                    </SectionLabel>
                    <SectionContent>
                      {mul(game.feeKeyPurchasing, numbers.length, '1.1')}
                      {' '}
                      eth
                    </SectionContent>
                    <BuyButton
                      onClick={() => this.buyKeys(numbers, walletAddress)}
                      isDisabled={!canBuyState}
                    >
                      Buy Numbers
                    </BuyButton>
                    <SectionLabel>
                      Price to snapshot one number $
                      {game.feeKeyRevealing}
                    </SectionLabel>
                    <SectionContent>
                      {mul(game.feeKeyRevealing, numbers.length, '1.1')}
                      {' '}
                      eth
                    </SectionContent>
                    <BuyButton
                      onClick={() => this.snapshotKeys(numbers, walletAddress)}
                      isDisabled={!canBuyState}
                    >
                      Snapshot Numbers
                    </BuyButton>
                    <Input
                      label="Number"
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
                  <Section sectionTitle="Snapshot Winner">
                    <SectionLabel>Snapshot Winner Name</SectionLabel>
                    <SectionContent>
                      {game.winner.wallet
                        ? game.winner.wallet.user.name
                        : ''
                      }
                    </SectionContent>
                    <SectionLabel>Snapshot Time</SectionLabel>
                    <SectionContent>
                      {moment.duration(moment(game.winner.timestamp).diff(moment())).humanize()}
                      {' ago'}
                    </SectionContent>
                    <SectionLabel>Winning Number</SectionLabel>
                    <SectionContent>{game.winner.winningNumber}</SectionContent>
                    <SectionLabel>Snapshot Fee</SectionLabel>
                    <SectionContent>
                      {game.feeSnapshotWinner}
                      {' '}
                      eth
                    </SectionContent>
                    <StyledButton
                      onClick={() => this.snapshotWinner(walletAddress, game.feeSnapshotWinner)}
                    >
                      Snapshot Winner
                    </StyledButton>
                  </Section>
                </SectionWrapper>
              </React.Fragment>
            )
          }}
        </Query>
      </Layout>
    )
  }
}

GamePage.propTypes = {
  // contracts: PropTypes.object, /* eslint-disable-line */
  apolloClient: PropTypes.object, /* eslint-disable-line */
  contractMethods: PropTypes.object, /* eslint-disable-line */
  params: PropTypes.object, /* eslint-disable-line */
  walletAddress: PropTypes.string.isRequired,
}


export default compose(
  withPolling,
)(GamePage)
