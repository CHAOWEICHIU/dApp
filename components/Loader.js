import { CircularProgress } from 'material-ui'
import styled from 'styled-components'

const FullWidthCenterContainer = styled.div`
display:flex;
align-items:center;
justify-content:center;
height:100%;
width:100%;
`

export default () => (
  <FullWidthCenterContainer>
    <CircularProgress size={100} thickness={4}/>
  </FullWidthCenterContainer>
)
