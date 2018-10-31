import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Link from 'next/link'
import withContracts from '../../lib/withContracts'
import Section from '../../components/Section'
import Layout from '../../components/Layout'
import Input from '../../components/Input'
import Loader from '../../components/Loader'

const SectionWrapper = styled.div`
  padding: 10px;
  display: flex;
  width: 100%;
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

class RegisterUserPage extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      user: {
        address: '',
        balance: '0',
        name: '',
        claimable: '0',
        laff: '',
      },
      laff: {
        address: '',
        balance: '0',
        name: '',
        claimable: '0',
        laff: '',
      },
      tempName: '',
      nameTaken: false,
      tempLaffId: '',
      laffIdExist: true,
      userLoading: true,
    }
  }

  componentDidMount() {
    this.polling = setInterval(this.updateUserInfo, 2000)
  }

  componentWillUnmount() {
    if (this.polling) {
      clearInterval(this.polling)
    }
  }

  updateUserInfo = () => {
    const {
      getCurrentMetaAccount,
      contractMethods: {
        getUserInformationWithAddress,
        getUserInformationWithId,
      },
    } = this.props
    const { user, laff } = this.state
    getCurrentMetaAccount()
      .then(accAddress => getUserInformationWithAddress(accAddress))
      .then((userInfo) => {
        if (!userInfo.name) {
          return this.setState({
            user: Object.assign({}, user, userInfo),
            userLoading: false,
          })
        }
        return getUserInformationWithId(userInfo.laff)
          .then((laffInfo) => {
            this.setState({
              user: Object.assign({}, user, userInfo),
              laff: Object.assign({}, laff, laffInfo),
              userLoading: false,
            })
          })
      })
  }

  registerUser = () => {
    const { contractMethods: { registerUser } } = this.props
    const { tempName, tempLaffId, user } = this.state
    registerUser({
      name: tempName,
      laffId: tempLaffId,
      accountAddress: user.address,
    })
      .then(() => this.updateUserInfo())
      .catch(err => console.log('err', err))
  }

  render() {
    const {
      tempName,
      user,
      laff,
      nameTaken,
      tempLaffId,
      laffIdExist,
      userLoading,
    } = this.state
    const {
      contractMethods: {
        playerNameTaken,
        playerIdExist,
      },
    } = this.props
    const registered = user.name
    const validInputs = (!nameTaken && laffIdExist && tempName && tempLaffId)

    if (userLoading) {
      return (
        <Layout>
          <Loader />
        </Layout>
      )
    }

    return (
      <Layout>
        <SectionWrapper>
          <Section sectionTitle="Current Wallet Info">
            <SectionLabel>Address</SectionLabel>
            <SectionContent>{user.address}</SectionContent>
            <SectionLabel>Balance</SectionLabel>
            <SectionContent>{user.balance}</SectionContent>
          </Section>
          { registered && (
            <Section sectionTitle="Your Info">
              <SectionLabel>Name</SectionLabel>
              <SectionContent>{user.name}</SectionContent>
              <SectionLabel>Claimable</SectionLabel>
              <SectionContent>{user.claimable}</SectionContent>
            </Section>
          ) }
        </SectionWrapper>
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
        { registered && (
          <SectionWrapper>
            <Section sectionTitle="Laff Info">
              <SectionLabel>Address</SectionLabel>
              <SectionContent>{laff.address}</SectionContent>
              <SectionLabel>Balance</SectionLabel>
              <SectionContent>{laff.balance}</SectionContent>
              <SectionLabel>Name</SectionLabel>
              <SectionContent>{laff.name ? laff.name : ''}</SectionContent>
              <SectionLabel>Claimable</SectionLabel>
              <SectionContent>{laff.claimable}</SectionContent>
            </Section>
          </SectionWrapper>
        ) }

        { !registered && (
          <SectionWrapper>
            <Section sectionTitle="Register Form">
              <SectionLabel>Name</SectionLabel>
              <Input
                value={tempName}
                onChange={(e) => {
                  const newValue = e.target.value
                  this.setState({
                    tempName: newValue,
                  })
                  playerNameTaken(newValue)
                    .then((taken) => {
                      if (taken && nameTaken === false) {
                        this.setState({
                          nameTaken: true,
                        })
                      }
                      if (!taken && nameTaken === true) {
                        this.setState({
                          nameTaken: false,
                        })
                      }
                    })
                }}
              />
              { nameTaken && (
                <Warning>
                  Name Has Been taken
                </Warning>
              ) }
              <Spacer />
              <SectionLabel>Laff Id</SectionLabel>
              <Input
                type="number"
                min="0"
                value={tempLaffId}
                onChange={(e) => {
                  const newValue = e.target.value
                  this.setState({
                    tempLaffId: newValue,
                  })
                  playerIdExist(newValue)
                    .then((exist) => {
                      if (!exist && laffIdExist) {
                        this.setState({ laffIdExist: false })
                      }
                      if (exist && !laffIdExist) {
                        this.setState({ laffIdExist: true })
                      }
                    })
                }}
              />
              { !laffIdExist && (
                <Warning>
                  Id is not exist
                </Warning>
              ) }
              <Spacer />
              <StyledButton
                disable={!validInputs}
                onClick={() => this.registerUser()}
              >
                Register
              </StyledButton>
            </Section>
          </SectionWrapper>
        ) }
      </Layout>
    )
  }
}

RegisterUserPage.propTypes = {
  contracts: PropTypes.object, /* eslint-disable-line */
  web3: PropTypes.object, /* eslint-disable-line */
  contractMethods: PropTypes.object, /* eslint-disable-line */
  getCurrentMetaAccount: PropTypes.func.isRequired,
}

export default withContracts(RegisterUserPage)
