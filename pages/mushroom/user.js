import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Query } from 'react-apollo'
import { compose } from 'recompose'
import Loader from '../../components/Loader'
import { H1 } from '../../components/Text'
import { GET_WALLET_USER } from '../../lib/queries'
import Layout from '../../components/Layout'
import withPolling from '../../lib/withPolling'
import {
  Container,
  MushroomContainer,
  MushroomContainerTopArea,
  MushroomContainerBottomArea,
} from '../../components/Mushroom'
import MushroomHeader from '../../containers/MushroomHeader'
import Header from '../../containers/Header'

const StyledH1 = styled(H1)`
  color: black;
  margin: 0;
`

const ProfileImg = styled.img`
  border-radius: 100%;
  width: 150px;
  height: 150px;
  border: 1px solid black;
`

const InputImg = styled(ProfileImg)`
  width: 50px;
  height: 50px;
`

const ProfileSection = styled.div`
  width: 100%;
  margin-top: 20px;
  flex: 3;
  display: flex;
  align-items: center;
  justify-content: center;
`

const HalfSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: ${props => (props.left ? 'flex-start' : 'center')};
  align-items: center;
`

const InputSection = styled(ProfileSection)`
  margin: 0 5%;
  width: 90%;
  flex: 2;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  border-bottom: 2px solid black;
  padding-bottom: 10px;
  margin-bottom: 20px;
`

const StyledButton = styled.div`
  width: 300px;
  height: 50px;
  background: pink;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid black;
  cursor: pointer;
`

class MushroomUserPage extends React.PureComponent {
  static async getInitialProps(ctx) {
    return {
      params: {
        url: ctx.req ? ctx.req.params['0'] : ctx.pathname,
      },
    }
  }

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
    const { params, walletAddress } = this.props
    console.log('params', params)

    return (
      <Layout mushroom>
        <Header mushroom />
        <Container src="/static/mushroom-mall-background.png">
          <MushroomHeader pathname={params.url} />
          <Query
            query={GET_WALLET_USER}
            variables={{ address: walletAddress }}
            skip={!walletAddress}
          >
            {({ data, loading }) => {
              if (loading || !data) {
                return (
                  <React.Fragment>
                    <Loader size={5} dotsCount={5} mushroom />
                  </React.Fragment>
                )
              }
              const { wallet: { user } } = data
              const registered = user
              return registered
                ? (
                  <MushroomContainer>
                    <MushroomContainerTopArea>
                      <ProfileSection>
                        <ProfileImg src={data.wallet.user.imageMushroom} />
                      </ProfileSection>
                      <InputSection>
                        <HalfSection left>
                          <InputImg src={data.wallet.user.imageMushroom} />
                          <StyledH1>300 菇菇幣</StyledH1>
                        </HalfSection>
                        <HalfSection>
                          <StyledButton>BUY</StyledButton>
                        </HalfSection>
                      </InputSection>
                    </MushroomContainerTopArea>
                    <MushroomContainerBottomArea>
                            MushroomContainerBottomArea

                    </MushroomContainerBottomArea>
                  </MushroomContainer>
                )
                : (
                  <div>yet registered</div>
                )
            }}
          </Query>
        </Container>
      </Layout>
    )
  }
}

MushroomUserPage.propTypes = {
  params: PropTypes.any, /* eslint-disable-line */
  contractMethods: PropTypes.any, /* eslint-disable-line */
  walletAddress: PropTypes.string.isRequired,
}

export default compose(
  withPolling,
)(MushroomUserPage)
