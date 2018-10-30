import React from 'react'
import styled, { keyframes } from 'styled-components'

const docs = [1, 2, 3, 4, 5]

const CenterComponent = styled.div`
  display:flex;
  justify-content:center;
  padding-top:100px;
`

const resizeAnimation = keyframes`
0%{transform:scale(0.2)}
40%{transform:scale(1)}
80%{transform:scale(0.2)}
100%{transform:scale(0.2)}
`

const Dot = styled.div`
  width:18px;
  height:18px;
  background-color:white;
  border-radius:100%;
  margin:3px;
  animation: ${() => resizeAnimation} 1s infinite ease-in-out both;
  animation-delay:${props => `${props.delay}s`};
`

const ReactStarter = () => (
  <CenterComponent>
    {docs.map((d, di) => <Dot delay={di} key={`${d}_dot`} />)}
  </CenterComponent>
)

export default ReactStarter
