import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import PropTypes from 'prop-types'
import { div, mul } from '../utils/calculation'
import withContracts from '../lib/withContracts'
import Section from '../components/Section'
import Layout from '../components/Layout'
import Input from '../components/Input'

const SectionWrapper = styled.div`
  padding: 10px;
  display: flex;
  width: 100%;
  justify-content: center;
`

const StyledButton = styled.div`
  margin-top: 50px;
  cursor: pointer;
  width: 340px;
  height: 15px;
  padding: 10px;
  border: 1px white solid;
  display: flex;
  align-items: center;
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

class Dashboard extends React.PureComponent {
  constructor(props) {
    super(props)
    const { web3, contracts: { playerBook, numberGame } } = this.props
    this.state = {
      user: {
        address: '',
        balance: '0',
        claimable: '0',
        name: '',
      },
      laffUser: {
        address: '',
        balance: '0',
        claimable: '0',
        name: '',
      },
      initReward: '',
      currentGame: '',
    }
    this.web3 = web3
    this.playerBook = playerBook
    this.numberGame = numberGame
  }

  componentDidMount() {
    this.polling = setInterval(this.updateUserInfo, 2000)
    this.gamePooling = setInterval(this.getCurrentGame, 2000)
  }

  componentDidUpdate(prevProps, prevState) {
    const { user, laffUser } = this.state
    if (user.address && user.address !== prevState.user.address) {
      /* eslint-disable no-underscore-dangle */
      this
        .playerBook
        .methods
        .pIDxAddr_(user.address)
        .call()
        .then(id => this.getUserInformationWithId(id))
        .then(({ userName, claimable, laff }) => {
          this.setState({ user: Object.assign({}, user, { claimable, name: userName }) })
          this
            .getUserInformationWithId(laff)
            .then(data => this.setState({
              laffUser: Object.assign(
                {},
                laffUser,
                {
                  claimable: data.claimable,
                  name: data.userName,
                },
              ),
            }))
        })
    }
  }

  componentWillUnmount() {
    if (this.polling) {
      clearInterval(this.polling)
    }
    if (this.gamePooling) {
      clearInterval(this.polling)
    }
  }

  getCurrentGame = () => this.numberGame
    .methods
    .totalGameCount_()
    .call()
    .then(game => this.setState({ currentGame: game }))

  updateUserInfo = () => this.web3.eth
    .getAccounts()
    .then(([address]) => {
      const { user } = this.state
      this
        .getWalletInfoWithAddress(address)
        .then(info => this.setState({
          user: Object.assign({}, user, info),
        }))
    })

  getWalletInfoWithAddress = address => this.web3.eth.getBalance(address)
    .then(balance => ({
      balance: div(balance, this.web3.utils.unitMap.ether),
      address,
    }))

  /* eslint-disable no-underscore-dangle */
  getUserInformationWithId = id => this.playerBook.methods
    .plyr_(id)
    .call()
    .then(data => ({
      userName: this.web3.utils.toUtf8(data.name),
      laff: data.laff,
      claimable: data.claimable,
    }))

  updateFiled = (key, value) => this.setState({ [key]: value })

  startGame = () => {
    const { user } = this.state
    this.numberGame.methods.startGame()
      .send({
        from: user.address,
        gasPrice: this.web3.utils.unitMap.szabo,
        gas: '3000000',
        value: mul(this.web3.utils.unitMap.ether, 2),
      })
      .then((res) => {
        console.log('res', res)
      })
      .catch((err) => {
        console.log('err', err)
      })
  }

  render() {
    const { state } = this
    const {
      user,
      laffUser,
      initReward,
      currentGame,
    } = state
    return (
      <Layout>
        <SectionWrapper>
          <Section sectionTitle="User Wallet Info">
            <SectionLabel>Address</SectionLabel>
            <SectionContent>{user.address}</SectionContent>
            <SectionLabel>Balance</SectionLabel>
            <SectionContent>{user.balance}</SectionContent>
          </Section>
          <Section sectionTitle="User Book">
            <SectionLabel>Name</SectionLabel>
            <SectionContent>{user.name}</SectionContent>
            <SectionLabel>Claimable</SectionLabel>
            <SectionContent>{user.claimable}</SectionContent>
          </Section>
        </SectionWrapper>
        <SectionWrapper>
          <Section sectionTitle="Laff User Book">
            <SectionLabel>Name</SectionLabel>
            <SectionContent>{laffUser.name}</SectionContent>
            <SectionLabel>Claimable</SectionLabel>
            <SectionContent>{laffUser.claimable}</SectionContent>
          </Section>
        </SectionWrapper>
        <SectionWrapper>
          <Section sectionTitle="Game Setting">
            <select>
              <option value="guessing_number_game">guessing number game</option>
            </select>
            <br />
            <br />
            <Input
              type="number"
              value={initReward}
              label="Reward"
              min="0"
              onChange={e => this.updateFiled('initReward', e.target.value)}
            />
            <StyledButton onClick={() => this.startGame()}>
            GO
            </StyledButton>
          </Section>
        </SectionWrapper>
        <SectionWrapper>
          <Section sectionTitle="Active Game">
            { currentGame && (
              <Link prefetch href={`/game/${currentGame}`} as="/game">
                <StyledButton>
                    Go To Game
                </StyledButton>
              </Link>
            ) }
          </Section>
        </SectionWrapper>
      </Layout>
    )
  }
}

Dashboard.propTypes = {
  contracts: PropTypes.object, /* eslint-disable-line */
  web3: PropTypes.object, /* eslint-disable-line */
}

export default withContracts(Dashboard)
