import styled from 'styled-components'

export const Container = styled.div`
  margin: 50px 250px 0 250px;
  width: calc(100% - 500px);
  height: 80vh;
  background: pink;
`

const radius = 40

export const MushroomContainerTopArea = styled.div`
  display: flex;
  flex-direction: column;
  flex: 10;
  margin-bottom: 20px;
  background: pink;
  border-radius: ${radius}px ${radius}px 0 0;
`

export const MushroomContainerBottomArea = styled.div`
  display: flex;
  flex-direction: column;
  flex: 2;
  background: pink;
  border-radius: 0 0 ${radius}px ${radius}px;
`

export const MushroomContainer = styled.div`
  height: 70%;
  display: flex;
  flex-direction: column;
  width: calc(80%);
  margin: 40px 10%;
`
