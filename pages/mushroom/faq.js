import React from 'react'
import PropTypes from 'prop-types'
import Layout from '../../components/Layout'
import {
  Container,
} from '../../components/Mushroom'
import MushroomHeader from '../../containers/MushroomHeader'

class MushroomFaqPage extends React.PureComponent {
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
        <Container src="/static/mushroom-landing-background.png">
          <MushroomHeader pathname={params.url} />
          FAQ
        </Container>
      </Layout>
    )
  }
}

MushroomFaqPage.propTypes = {
  params: PropTypes.any, /* eslint-disable-line */
}

export default MushroomFaqPage
