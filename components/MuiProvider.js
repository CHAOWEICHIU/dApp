import React, { Component } from 'react'

const decorator = ComposedComponent => class extends Component {
  static async getInitialProps(ctx) {
    const { req } = ctx
    const isServer = !!req
    const userAgent = req ? req.headers['user-agent'] : navigator.userAgent

    // Second param here is initial redux state on the server
    let pageProps = {}

    if (ComposedComponent.getInitialProps) {
      pageProps = await ComposedComponent.getInitialProps(ctx)
    }

    return {
      ...pageProps,
      isServer,
      userAgent,
    }
  }

  constructor(props) {
    super(props)
  }

  render() {
    return (
      // <MuiThemeProvider muiTheme={getMuiTheme({ userAgent: this.props.userAgent })}>
        <ComposedComponent
          {...this.props}
        />
      // </MuiThemeProvider>
    )
  }
}

export default decorator
