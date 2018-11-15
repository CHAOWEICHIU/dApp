import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Link from 'next/link'
import { compose } from 'recompose'
import { Query } from 'react-apollo'
import withPolling from '../../lib/withPolling'
import { GET_WALLET_USER, GET_PLAYERBOOK_PLAYER } from '../../lib/queries'
import Header from '../../containers/Header'
import Section, {
  SectionContent,
  SectionWrapper,
  SectionLabel,
  SectionImgWrapper,
} from '../../components/Section'
import Layout from '../../components/Layout'
import Input from '../../components/Input'
import Loader from '../../components/Loader'

const Spacer = styled.div`
  width: 100%;
  height: 40px;
`

const StyledButton = styled.div`
  width: 330px;
  height: 15px;
  border: 1px white solid;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => (props.disable ? `
    pointer-events: none;
    opacity: 0.3;
    user-select: none;
  ` : `
    opacity: 1;
    cursor: pointer;
  `)}
  
`
const Warning = styled.div`
  font-size: 15px;
  color: #FF6491;
`

const UserImg = styled.img`
  width: 80%;
`
class RegisterUserPage extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      tempName: '',
      tempLaffId: '',
    }
  }

  registerUser = () => {
    const { contractMethods: { registerUser }, walletAddress } = this.props
    const { tempName, tempLaffId } = this.state
    registerUser({
      name: tempName,
      laffId: tempLaffId,
      accountAddress: walletAddress,
    })
      .then(() => ({}))
      .catch(err => console.log('err', err))
  }

  render() {
    const {
      walletAddress,
    } = this.props

    const {
      tempName,
      tempLaffId,
    } = this.state


    return (
      <Layout>
        <Header />
        <Query
          query={GET_WALLET_USER}
          variables={{ address: walletAddress }}
          skip={!walletAddress}
        >
          {({ data, loading }) => {
            if (loading || !data) {
              return (
                <React.Fragment>
                  <Spacer />
                  <Loader size={5} dotsCount={5} />
                </React.Fragment>
              )
            }
            const { wallet: { user } } = data
            const registered = user
            return (
              <React.Fragment>
                { !registered && (
                  <SectionWrapper>
                    <Section sectionTitle="Register Form">
                      <SectionLabel>Name</SectionLabel>
                      <Input
                        value={tempName}
                        onChange={e => this.setState({ tempName: e.target.value })}
                      />
                      <Query
                        query={GET_PLAYERBOOK_PLAYER}
                        variables={{ name: tempName }}
                        skip={!tempName}
                      >
                        {(queryResponse) => {
                          if (!tempName) return null
                          if (queryResponse.loading || !queryResponse.data) {
                            return <Loader size={3} />
                          }
                          if (!queryResponse.data.playerBook.player) return null
                          return (
                            <Warning>
                            Name Has Been taken
                            </Warning>
                          )
                        }}
                      </Query>
                      <Spacer />
                      <SectionLabel>Laff Id</SectionLabel>
                      <Input
                        type="number"
                        min="0"
                        value={tempLaffId}
                        onChange={e => this.setState({ tempLaffId: e.target.value })}
                      />
                      <Query
                        query={GET_PLAYERBOOK_PLAYER}
                        variables={{ id: Number(tempLaffId) }}
                        skip={!tempLaffId}
                      >
                        {(queryResponse) => {
                          if (!tempLaffId) return null
                          if (queryResponse.loading) {
                            return <Loader size={3} />
                          }
                          if (queryResponse.data.playerBook.player) return null
                          return (
                            <Warning>
                            Id is not exist
                            </Warning>
                          )
                        }}
                      </Query>
                      <Spacer />
                      <Query
                        query={GET_PLAYERBOOK_PLAYER}
                        variables={{ name: tempName }}
                        skip={!tempName}
                      >
                        {queryResponseFirst => (
                          <Query
                            query={GET_PLAYERBOOK_PLAYER}
                            variables={{ id: Number(tempLaffId) }}
                            skip={!tempLaffId}
                          >
                            {(queryResponseSecond) => {
                              const canSubmit = queryResponseFirst.data
                              && queryResponseSecond.data
                              && queryResponseFirst.data.playerBook
                              && queryResponseSecond.data.playerBook
                              && (
                                !queryResponseFirst.data.playerBook.player
                                && queryResponseSecond.data.playerBook.player
                              )
                              return (
                                <StyledButton
                                  disable={!canSubmit}
                                  onClick={() => {
                                    if (canSubmit) {
                                      this.registerUser()
                                    }
                                  }}
                                >
                                Register
                                </StyledButton>
                              )
                            }}
                          </Query>
                        )}
                      </Query>
                    </Section>
                  </SectionWrapper>
                ) }

                { registered && (
                <SectionWrapper>
                  <Section sectionTitle="Game">
                    <SectionLabel>Notice</SectionLabel>
                    <SectionContent>Ready for your first game?</SectionContent>
                    <Link prefetch href="/game/list">
                      <StyledButton>
                        Game Center
                      </StyledButton>
                    </Link>
                  </Section>
                </SectionWrapper>
                ) }
                { registered && user.affiliate.user && (
                <SectionWrapper>
                  <Section sectionTitle="Laff Info">
                    <SectionImgWrapper>
                      <UserImg src={user.affiliate.user.image} />
                    </SectionImgWrapper>
                    <SectionLabel>Address</SectionLabel>
                    <SectionContent>{user.affiliate.address}</SectionContent>
                    <SectionLabel>Balance</SectionLabel>
                    <SectionContent>{user.affiliate.balance}</SectionContent>
                    <SectionLabel>Name</SectionLabel>
                    <SectionContent>{user.affiliate.user.name}</SectionContent>
                    <SectionLabel>Claimable</SectionLabel>
                    <SectionContent>{user.affiliate.user.claimable}</SectionContent>
                  </Section>
                </SectionWrapper>
                ) }

              </React.Fragment>
            )
          }}
        </Query>
      </Layout>
    )
  }
}

RegisterUserPage.propTypes = {
  contractMethods: PropTypes.object, /* eslint-disable-line */
  walletAddress: PropTypes.string, /* eslint-disable-line */
}

export default compose(
  withPolling,
)(RegisterUserPage)
