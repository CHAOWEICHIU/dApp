import styled from 'styled-components'

export const Container = styled.div`
  margin: 50px 250px 0 250px;
  width: calc(100% - 500px);
  height: 80vh;
  background-image: ${props => `url('${props.src}')`};
  background-position: center;
  background-repeat: no-repeat;
  background-size: auto;
  
`

export const Cool = styled.div`
  margin: 100px 250px 0 250px;
  width: calc(100% - 500px);
  height: 90vh;
`
