import React from 'react'
import styled, { keyframes } from 'styled-components'
import Link from 'next/link'
import Layout from '../components/Layout'


const BlockChainWrapper = styled.div`
display:flex;
align-items:center;
justify-content:center;
flex-direction:column;
padding:80px 0;
width:70%;
@media(max-width:768px){
  padding: 8vw;
}
`
const BlockChainMarketCap = styled.div`
color:rgb(231,184,67);
font-size:40px;
display:flex;
align-items:center;
justify-content:center;
flex-direction:column;
> div:first-child {
  color:white;
  padding:20px 0 15px 0;
}
@media(max-width:768px){
  font-size:5vw;
  > div:first-child {
    color:white;
    padding:5vw 0 4vw 0;
    font-size:6.5vw;
  }
}
`
const BlockChainTitle = styled.div`
font-size:30px;
@media(max-width:768px){
  font-size:6vw;
}
`
const StoryWord = styled.div`
margin:10px 0 30px 0;
font-size:20px;
color:white;
line-height:40px;
@media(max-width:768px){
  font-size:4vw;
  line-height:6vw;
  margin:2vw 0 4vw 0;
}
`
const WrapperD = styled.div`
padding:20px 0;
width:100%;
background:rgba(6,9,14,0.95);
display:flex;
align-items:center;
justify-content:center;
`

const WrapperC = styled.div`
background:rgba(22,17,31,0.95);
display:flex;
align-items:center;
justify-content:center;
flex-direction:column;
background:black;
padding: 50px 0;
@media(max-width:768px){
  height:auto;
}
`

const ProContainer = styled.div`
display:flex;
align-items:center;
justify-content:center;
@media(max-width:768px){
  margin-top: -10vw;
}
`
const ProWrapper = styled.div`
width:280px;
margin:0 50px;
@media(max-width:768px){
  width: 35vw;
  margin:4vw;
}
`
const ProTitle = styled.h2`
color:#3D4351;
font-size:20px;
margin:0 0 4px 0;
@media(max-width:768px){
  font-size:3.9vw;
  margin:0 0 2vw 0;
}
`
const ProContent = styled.h3`
margin:0;
color:rgba(28, 54, 83, 0.6);
font-size:15px;
letter-spacing:2px;
@media(max-width:768px){
  font-size:3.3vw;
  letter-spacing:1vw;
}
`
const SecondAreaWordWrapper = styled.div`
display:flex;
align-items:center;
justify-content:center;
flex-direction:column;
`
const SecondAreaWord = styled.h1`
color:black;
font-size:25px;
font-weight:500;
margin:0 0 8px 0;
@media(max-width:768px){
  font-size:4.5vw;
  margin: 0 0 5vw 0;
}
`
const WordWrapper = styled.div`
display:flex;
align-items:flex-end;
`
const WrapperA = styled.div`
width:100vw;
height:700px;
background:black;
display:flex;
align-items:center;
justify-content:center;
position:relative;
flex-direction:column;
background:#333844 url("https://www.exodus.io/img/hero.jpg") no-repeat;
background-size: 100%;

@media(max-width:768px){
  height:90vh;
  background:#333844 url("https://www.exodus.io/img/hero.jpg") no-repeat center center;
}
`
const WrapperB = styled.div`
width:100vw;
display:flex;
align-items:center;
justify-content:center;
background:white;
padding: 90px 0;
flex-direction:column;
@media(max-width:768px){
  padding:12vh 0;
  font-size:5vw;
}
`
const BoxContainer = styled.div`
display:flex;
`
const PurchaseButton = styled.a`
display:flex;
align-items:center;
justify-content:center;
border-radius:20px;
border:solid 2px white;
color:white;
outline:none;
width:300px;
padding:8px 0;
background:transparent;
transition-property:color, border-color, background-color;
transition-duration:400ms;
transition-timing-function:ease;
letter-spacing:4px;
&:hover{
  cursor:pointer;
  color:#ff9a00;
  border:solid 2px #ff9a00;
  text-decoration:none;
}
`
const heartFadeInOut = keyframes`
  0% {
    transform: scale(0.7);
    opacity: 1;
  }
  10% {
    transform: scale(1.1);
    opacity: 0.5;
  }
  20% {
    transform: scale(0.7);
    opacity: 1;
  }
  30% {
    transform: scale(0.9);
    opacity: 0.5;
  }
  40% {
    transform: scale(0.7);
    opacity: 1;
  }
  100% {
    transform: scale(0.7);
    opacity: 1;
  }
`

const ETH = styled.img`
  height: 200px;
  animation-name: ${heartFadeInOut}; 
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-duration: 1.5s;
  @media(max-width: 768px){
    height: auto;
    width: 60%;
    margin-left: 20%;
    margin-top: 50px;
  }
`

const MainPage = () => (
  <Layout>
    <WrapperA>
      <WordWrapper>
        <ETH src="/static/eth.svg" />
      </WordWrapper>
    </WrapperA>
    <WrapperB>
      <SecondAreaWordWrapper>
        <SecondAreaWord>Start Your First Scam</SecondAreaWord>
        <SecondAreaWord>『 Coingra 』will handle it all</SecondAreaWord>
        <SecondAreaWord>Let you focus on scamming people</SecondAreaWord>
      </SecondAreaWordWrapper>
      <BoxContainer style={{ marginTop: 80 }}>
        {
          [
            { title: 'Smart Contract', content: 'No need to deploy your own smart contract' },
            { title: 'Dashboard', content: 'To know how much you money you have scammed' },
          ].map(x => (
            <ProContainer key={`${x.title}_ProContainer`}>
              <ProWrapper>
                <ProTitle>{x.title}</ProTitle>
                <ProContent>{x.content}</ProContent>
              </ProWrapper>
            </ProContainer>
          ))
        }
      </BoxContainer>
    </WrapperB>
    <WrapperD>
      <BlockChainWrapper>
        <BlockChainTitle>To be a pioneer in scammer era</BlockChainTitle>
        <StoryWord style={{ color: 'rgb(155,155,155)' }}>
          Are you still scammer but yet to use Blockchain technology for advancing your game?
        </StoryWord>
        <BlockChainMarketCap>
          <div>Current Money Pool</div>
          <div>$ 730,145,138,076</div>
        </BlockChainMarketCap>
      </BlockChainWrapper>
    </WrapperD>
    <WrapperC>
      <Link prefetch href="/dashboard">
        <PurchaseButton>Ready?</PurchaseButton>
      </Link>
    </WrapperC>
  </Layout>
)

export default MainPage
