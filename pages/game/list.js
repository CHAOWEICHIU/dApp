import React from 'react'
import moment from 'moment'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Link from 'next/link'
import withContracts from '../../lib/withContracts'
import Section, { SectionWrapper, SectionLabel, SectionContent } from '../../components/Section'
import Layout from '../../components/Layout'
import Input from '../../components/Input'

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

const StyledSection = styled(Section)`
  opacity: 0.5;
  ${props => !props.disable && `
    &:hover {
      opacity: 1;
    }
  `}
`

class GameList extends React.PureComponent {
  constructor(props) {
    super(props)
    const { web3, contracts: { playerBook, numberGame } } = this.props
    this.state = {
      games: [],
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
      minInitReward: '',
    }
    this.web3 = web3
    this.playerBook = playerBook
    this.numberGame = numberGame
  }


  componentDidMount() {
    const { contractMethods: { getGameActivationFee } } = this.props
    getGameActivationFee().then(fee => this.setState({ minInitReward: fee, initReward: fee }))
    this.polling = setInterval(this.updateUserInfo, 2000)
    this.gamePolling = setInterval(this.getGames, 2000)
  }

  componentDidUpdate(prevProps, prevState) {
    const { user, laffUser } = this.state
    const {
      contractMethods: {
        getUserInformationWithId,
        getUserInformationWithAddress,
      },
    } = this.props
    if (user.address && user.address !== prevState.user.address) {
      /* eslint-disable no-underscore-dangle */
      getUserInformationWithAddress(user.address)
        .then((currentUser) => {
          this.setState({
            user: Object.assign(
              {},
              user,
              {
                claimable: currentUser.claimable,
                name: currentUser.name,
              },
            ),
          })
          getUserInformationWithId(currentUser.laff)
            .then(data => this.setState({
              laffUser: Object.assign(
                {},
                laffUser,
                {
                  claimable: data.claimable,
                  name: data.name,
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
    if (this.gamePolling) {
      clearInterval(this.gamePolling)
    }
  }

  getGames = () => {
    const { contractMethods: { getGames } } = this.props
    getGames().then(games => this.setState({ games }))
  }

  updateUserInfo = () => {
    const { getCurrentMetaAccount, contractMethods: { getUserInformationWithAddress } } = this.props
    const { user } = this.state
    getCurrentMetaAccount()
      .then(accAddress => getUserInformationWithAddress(accAddress))
      .then(info => this.setState({
        user: Object.assign({}, user, info),
      }))
  }

  updateFiled = (key, value) => this.setState({ [key]: value })

  startGame = () => {
    const { contractMethods: { startNumberGame } } = this.props
    const { user, initReward } = this.state
    startNumberGame({ address: user.address, fee: initReward })
      .then((res) => {
        console.log('res', res)
      })
      .catch(err => console.log('err', err))
  }

  render() {
    const {
      games,
      user,
      laffUser,
      initReward,
      minInitReward,
    } = this.state

    const activeGames = games.filter(game => game.status === 'active')
    const inActiveGames = games.filter(game => game.status === 'finished')
    const canStartGame = (user.name) && (activeGames.length === 0)

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
          <Section sectionTitle="Laff User Book">
            <SectionLabel>Name</SectionLabel>
            <SectionContent>{laffUser.name}</SectionContent>
            <SectionLabel>Claimable</SectionLabel>
            <SectionContent>{laffUser.claimable}</SectionContent>
          </Section>
        </SectionWrapper>
        { canStartGame && (
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
                min={minInitReward}
                onChange={e => this.updateFiled('initReward', e.target.value)}
              />
              <StyledButton onClick={() => this.startGame()}>
              GO
              </StyledButton>
            </Section>
          </SectionWrapper>
        ) }
        <SectionWrapper>
          {activeGames.length > 0 && activeGames.map(activeGame => (
            <Section sectionTitle="Active Game" key={`${activeGame.id}-section`}>
              <SectionLabel>Game Index</SectionLabel>
              <SectionContent>{activeGame.id}</SectionContent>
              <br />
              <Link prefetch href={`/game/${activeGame.id}`}>
                <StyledButton>
                    Go To Game
                </StyledButton>
              </Link>
            </Section>
          ))}
        </SectionWrapper>
        {inActiveGames.length !== 0 && (
          <SectionWrapper>
            {inActiveGames.map(game => (
              <StyledSection
                sectionTitle={`Game ID ${game.id}`}
                key={`${game.id}-styled-section`}
                disable
              >
                <SectionLabel>ID</SectionLabel>
                <SectionContent>{game.id}</SectionContent>
                <SectionLabel>Banker Name</SectionLabel>
                <SectionContent>{game.banker.name}</SectionContent>
                <SectionLabel>Game Period</SectionLabel>
                <SectionContent>
                  {moment(game.startTime).format('YYYY-MM-DD HH:mm:ss')}
                  {' ~ '}
                  {moment(game.endTime).format('YYYY-MM-DD HH:mm:ss')}
                </SectionContent>
                <SectionLabel>Game Status</SectionLabel>
                <SectionContent>{game.status}</SectionContent>
              </StyledSection>
            ))}
          </SectionWrapper>
        )}
      </Layout>
    )
  }
}

GameList.propTypes = {
  contracts: PropTypes.object, /* eslint-disable-line */
  web3: PropTypes.object, /* eslint-disable-line */
  contractMethods: PropTypes.object, /* eslint-disable-line */
  getCurrentMetaAccount: PropTypes.func, /* eslint-disable-line */
}

export default withContracts(GameList)
