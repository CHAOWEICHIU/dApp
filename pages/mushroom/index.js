import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import random from 'lodash/random'
import MushroomScore from '../../components/MushroomScore'
import Loader from '../../components/Loader'
import withPolling from '../../lib/withPolling'
import { MUSHROOM_GAME } from '../../lib/queries'
import Header from '../../containers/Header'
import Layout from '../../components/Layout'
import {
  Container,
} from '../../components/Mushroom'
import MushroomHeader from '../../containers/MushroomHeader'

const BoxContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const Box = styled.div`
  flex: 1;
  margin: 0 30px;
  background: pink;
  border: 1px solid white;
  border-radius: 30px;
`

const Item = styled.div`
  display: flex;
  flex-direction: column;
`

const ScoreText = styled.div`
  color: black;
  font-size: 30px;
`
const Coin = styled.img`
  border-radius: 100%;
  width: 50px;
`
const Section = styled.div`
  display: flex;
  height: 50px;
  align-items: flex-end;
`

const AddressText = styled.div`
  font-size: 20px;
  color: black;
`
const Center = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 50px;
`
const Img = styled.img`
  width: 50%;
  border-radius: 100%;
`

class MushroomHomePage extends React.PureComponent {
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
      count: 0,
    }
  }

  componentDidMount() {
    this.time = setInterval(() => {
      const { count } = this.state
      this.setState({ count: count + random(0, 10) })
    }, 300)
  }

  componentWillUnmount() {
    if (this.time) {
      clearInterval(this.time)
    }
  }

  render() {
    const {
      params,
    } = this.props

    const {
      count,
    } = this.state
    
    return (
      <Layout mushroom>
        <Header mushroom />
          <MushroomHeader pathname={params.url} />
          <MushroomScore count={count} />
          {/* <Query
            query={MUSHROOM_GAME}
            variables={{ address: '0x35Ec829835aa5CEe0654287ACbDF33e8cea7BEDA' }}
          >
            {({ data, loading }) => {
              // if (!data || loading) return (
                //<Loader mushroom />
              //)

              return (
                <React.Fragment>
                  
                </React.Fragment>
              )
            }}
          </Query> */}
      </Layout>
    )
  }
}

MushroomHomePage.propTypes = {
  params: PropTypes.any, /* eslint-disable-line */
  walletAddress: PropTypes.string.isRequired,
}

export default withPolling(MushroomHomePage)
