import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import PropTypes from 'prop-types'
import { div } from '../utils/calculation'
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
  cursor: pointer;
  width: 300px;
  height: 30px;
  padding: 10px;
  border: 1px white solid;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
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
    const { web3, contracts: { playerBook } } = this.props
    this.state = {
      ready: false,
      totalPlayerCount: 0,
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
    }
    this.web3 = web3
    this.playerBook = playerBook
  }

  componentDidMount() {
    this.polling = setInterval(this.updateUserInfo, 2000)
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
  }

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

  render() {
    const { state } = this
    const {
      user,
      laffUser,
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
        {
          [
            { label: 'Money Pool', key: 'pool' },
          ]
            .map(x => (
              <Input
                value={state[x.key] || ''}
                key={x.key}
                label={x.label}
                onChange={e => this.updateFiled(x.key, e.target.value)}
              />
            ))
        }
        <Link prefetch href="/play">
          <StyledButton>
            GO
          </StyledButton>
        </Link>

      </Layout>
    )
  }
}

Dashboard.propTypes = {
  contracts: PropTypes.object, /* eslint-disable-line */
  web3: PropTypes.object, /* eslint-disable-line */
}

export default withContracts(Dashboard)
