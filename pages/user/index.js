import React from 'react'
import styled from 'styled-components'
import range from 'lodash/range'
import PropTypes from 'prop-types'
import fetch from 'node-fetch'
import Layout from '../../components/Layout'
import withContracts from '../../lib/withContracts'

/* eslint-disable */

const Container = styled.div`
  padding: 100px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 30px;
`

const Box = styled.div`
  background: rgba(211,232,255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.2;
  position: relative;
  &:hover {
    opacity: 0.7;
    cursor: pointer;
    &:after {
      position: absolute;
      content: ${props => `'${props.name}'`};
      color: white;
      font-size: 30px;
      bottom: 10px;
      left: 30px;
      right: 30px;
    }
  }
`

const Image = styled.img`
  width: 80%;
`

class UserPage extends React.PureComponent {
  constructor(props) {
    super(props)
    // const { contracts: { playerBook }, web3 } = this.props
    this.state = {
      totalPlayerCount: 0,
      players: [],
    }
    // this.playerBook = playerBook
    // this.web3 = web3
  }
  componentDidMount() {
    const playersId = [
      1,
      2,
      3,
      4,
      5,
      6,
    ]

    Promise.all(
      playersId.map(id => fetch(`https://api.cryptokitties.co/kitties/${id}`).then(res => res.json())))
    .then(data => this.setState({ players: data.map(d => ({
      id: d.id,
      img: d.image_url,
      name: d.name,
    }))}))
    // const { web3 } = this.props

    // this
    //   .promiseGetActiveCurrentAccount()
    //   .then(account => {
    //     this.playerBook.methods.registerPlayer(
    //         web3.utils.toHex('lodash'),
    //         0
    //       )
    //     .estimateGas({
    //       from: account,
    //       gasPrice: '100000',
    //       gas: '21000',
    //       value: web3.utils.unitMap.ether,
    //     })
    //     .then(res => {
    //       console.log(res);
          
    //     })
    //     .catch(err => {
    //       console.log(err);
          
    //     })
    //   })
    
    

    
    // this
    //   .promiseGetCurrentTotalPlayerCount()
    //   .then(count => {
    //     this.setState({ totalPlayerCount: count })
    //     this.promiseGetPlayerById(0)
    //     .then(res => {
    //       console.log(res);
          
    //     })
    //   })
  }

  promiseGetActiveCurrentAccount = () => this.web3.eth.getAccounts().then(accounts => accounts[0])

  promiseGetCurrentTotalPlayerCount = () => this.playerBook.methods
    .totalPlayerCount()
    .call()

  promiseGetPlayerById = id => this.playerBook.methods
    .plyr_(id)
    .call()
    .then(res => web3.utils.toUtf8(res.name))

  // promiseRegisterUser = 


  render() {
    const { players } = this.state
    return (
      <Layout>
        <Container>
          {players.length !== 0 && players.map(player => (
            <Box key={player.img} name={player.name}>
              <Image src={player.img} />
            </Box>
          ))}
        </Container>
        
      </Layout>
    )
  }
}

UserPage.propTypes = {
  contracts: PropTypes.object, /* eslint-disable-line */
}

// export default withContracts(UserPage)
export default UserPage
