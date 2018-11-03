import React from 'react'
import PropTypes from 'prop-types'
import Layout from '../../components/Layout'
import {
  Container,
} from '../../components/Mushroom'
import MushroomHeader from '../../containers/MushroomHeader'

class MushroomUsPage extends React.PureComponent {
  static async getInitialProps(ctx) {
    return {
      params: {
        url: ctx.req ? ctx.req.params['0'] : ctx.pathname,
      },
    }
  }

  render() {
    const { params } = this.props
    return (
      <Layout mushroom>
        <Container src="/static/mushroom-us-background.png">
          <MushroomHeader pathname={params.url} />
          US
        </Container>
      </Layout>
    )
  }
}

MushroomUsPage.propTypes = {
  params: PropTypes.any, /* eslint-disable-line */
}

export default MushroomUsPage
