import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import Layout from '../components/Layout'
import Input from '../components/Input'

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

class Dashboard extends React.PureComponent {
  state = {
    ready: false,
  }

  updateFiled = (key, value) => this.setState({ [key]: value })

  render() {
    const { state } = this
    return (
      <Layout>
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

export default Dashboard
