import React from 'react'
import moment from 'moment'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Link from 'next/link'
import find from 'lodash/find'
import { compose } from 'recompose'
import { Query } from 'react-apollo'
import {
  GET_GAME_INFORMATION,
  GET_WALLET_USER,
} from '../../lib/queries'
import Header from '../../containers/Header'
import withPolling from '../../lib/withPolling'
import Section, {
  SectionWrapper,
  SectionLabel,
  SectionContent,
  SectionImgWrapper,
} from '../../components/Section'
import Loader from '../../components/Loader'
import Layout from '../../components/Layout'
import Input from '../../components/Input'
import { Select, Option } from '../../components/Select'
import { List, ListItem } from '../../components/List'

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

const gameOptions = [
  {
    inputKey: 'guessing_number_game',
    inputName: 'Number Guessing Game',
    rules: [
      'The person who purchase the number that has not bought more than twice',
      'If all numbers that were purchased are all purchased more than twice, banker will win',
      'Integer Only',
    ],
  },
]

const Spacer = styled.div`
  width: 100%;
  height: 40px;
`

const GameImage = styled.img`
  width: 100px;
  border-radius: 100%;
`

class GameList extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      initReward: '',
      selectedGameKeyName: gameOptions[0].inputKey,
      currentTime: moment(),
    }
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({ currentTime: moment() })
    }, 1000)
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  updateFiled = (key, value) => this.setState({ [key]: value })

  startGame = (fee) => {
    const { contractMethods: { startNumberGame }, walletAddress } = this.props
    startNumberGame({ address: walletAddress, fee })
      .then(() => ({}))
      .catch(err => console.log('err', err))
  }

  render() {
    const {
      walletAddress,
    } = this.props
    const {
      currentTime,
      selectedGame,
      initReward,
      selectedGameKeyName,
    } = this.state

    return (
      <Query
        query={GET_WALLET_USER}
        variables={{ address: walletAddress }}
        skip={!walletAddress}
      >
        {queryUserWallet => (
          <Query query={GET_GAME_INFORMATION}>
            {({ data, loading }) => {
              const isLoading = loading || queryUserWallet.loading
              const hasRegistered = (
                queryUserWallet.data
                && queryUserWallet.data.wallet
                && queryUserWallet.data.wallet.user
              )
              return (
                <Layout>
                  <Header />
                  { isLoading && <Loader /> }
                  { !isLoading && !hasRegistered && (
                    <SectionWrapper>
                      <Section sectionTitle="User Name">
                        <SectionLabel>Register Info</SectionLabel>
                        <SectionContent>
                          You need to register first before you start the game
                        </SectionContent>
                        <Link prefetch href="/user/register">
                          <StyledButton>
                            Register
                          </StyledButton>
                        </Link>
                      </Section>
                    </SectionWrapper>
                  ) }

                  { !isLoading && hasRegistered && (
                    <SectionWrapper>
                      {data.gameInformation.games.map(game => (
                        <Section sectionTitle="Active Game" key={`${game.id}-section`}>
                          <SectionImgWrapper>
                            <GameImage src={game.bankerWallet.user.image} />
                          </SectionImgWrapper>
                          <SectionLabel>Pot Amount</SectionLabel>
                          <SectionContent>
                            {game.potAmountWinning}
                            <SectionLabel>Count Down</SectionLabel>
                          </SectionContent>
                          <SectionContent>
                            {moment.utc(moment(game.endTime).diff(currentTime)).format('HH:mm:ss')}
                          </SectionContent>
                          <Link prefetch href={`/game/${game.id}`}>
                            <StyledButton>
                              Go To Game
                            </StyledButton>
                          </Link>
                        </Section>
                      ))}
                    </SectionWrapper>
                  ) }


                  { !isLoading && hasRegistered && (
                    <SectionWrapper>
                      <Section sectionTitle="Game Start Setting">
                        <Select>
                          {gameOptions.map(gameOption => (
                            <Option
                              key={gameOption.inputKey}
                              value={gameOption.inputKey}
                            >
                              {gameOption.inputName}
                            </Option>
                          ))}
                        </Select>
                        <List>
                          {selectedGame && selectedGame.rules.map(rule => (
                            <ListItem key={rule}>
                              {rule}
                            </ListItem>
                          ))}
                        </List>
                        <Spacer />
                        <Input
                          isDisabled
                          disabled
                          type="text"
                          value={find(gameOptions, { inputKey: selectedGameKeyName }).inputName}
                          label="Game"
                        />
                        <Spacer />
                        {
                            [
                              { value: 'ETH', label: 'Currency' },
                              { value: '5', label: 'Snapshot Winner' },
                              { value: '0.22', label: 'Snapshot Number' },
                              { value: '0.55', label: 'Buy Number' },
                            ]
                              .map(x => (
                                <React.Fragment key={`${x.value}-${x.label}`}>
                                  <Input
                                    isDisabled
                                    type="text"
                                    value={x.value}
                                    label={x.label}
                                  />
                                  <Spacer />
                                </React.Fragment>
                              ))
                          }

                        <Input
                          type="number"
                          value={initReward || data.gameInformation.feeGameActivation}
                          label="Initial Pot Amount"
                          min={data.gameInformation.feeGameActivation}
                          onChange={e => this.updateFiled('initReward', e.target.value)}
                        />
                        <StyledButton
                          onClick={() => this.startGame(
                            initReward || data.gameInformation.feeGameActivation,
                          )}
                        >
                          GO
                        </StyledButton>
                      </Section>
                    </SectionWrapper>
                  ) }
                </Layout>
              )
            }}
          </Query>
        )}
      </Query>
    )
  }
}

GameList.propTypes = {
  contractMethods: PropTypes.object, /* eslint-disable-line */
  walletAddress: PropTypes.string.isRequired,
}

export default compose(
  withPolling,
)(GameList)
