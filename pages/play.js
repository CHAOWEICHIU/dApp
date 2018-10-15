import React from 'react'
import styled, { keyframes } from 'styled-components'
import Layout from '../components/Layout'
import Section from '../components/Section'

const LineWrapper = styled.div`
  display: flex;
  align-items: flex-end;
`

const EthImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 100%;
  background: #0B1C29;
  padding: 10px;
  margin-right: 10px;
`

const Color = styled.div`
  color: #458890;
`

const SectionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`

const shakingAnimation = keyframes`
  100% {
    transform: translateX(10px) translateY(10px);
  }
`

const NumberLine = styled.div`
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px white solid;
  color: white;
  cursor: pointer;
  user-select: none;
  transition: color 1s;
  &:hover {
    animation: ${shakingAnimation} 10ms linear infinite;
    color: red;
    border: 1px red solid;
  }
`

const FullWidthNumberLine = NumberLine.extend`
  width: 97%;
  margin-bottom: 25px;
`

const NumbersContainer = styled.div`
  display: grid;
  grid-column-gap: 10px;
  grid-template-columns: auto auto auto;
  grid-auto-rows: 125px;
  width: 100%;
  height: 500px;
  overflow: scroll;
`

const NumbersContainerWrapper = styled.div`
  width: 100%;
  height: 500px;
  overflow: scroll;
`


const StyledButton = styled.div`
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px gray solid;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0 20px;
  font-size: 30px;
  opacity: ${props => (props.isDisabled ? 0.2 : 1)};
  cursor: ${props => (props.isDisabled ? 'default' : 'pointer')};
`

const Input = styled.input`
  width: 100%;
  background: rgb(38, 52, 60);
  color: white;
  height: 40px;
  text-decoration: none;
  outline: none;
  font-size: 20px;
  border: transparent;
`

const StyledInput = Input.extend`
  width: 100%;
  margin-right: ${props => (props.marginRight ? '2%' : '0')}
  ${props => props.isDisabled && `
    opacity: 0.4;
    cursor: default;
    pointer-events: none;
  `}
`

const StyledInputWrapper = styled.div`
  display: flex;
`

const Spacer = styled.div`
  width: 100%;
  height: 150px;
`

const NoticeMessage = styled.div`
  width: 845px;
  min-height: 50px;
  background: rgb(20,28,30);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
  border: 1px rgba(120,120,120, 0.7) solid;
`

const YellowText = styled.span`
  color:#FF9A00;
  margin-right: 5px;
  font-weight: 700;
  letter-spacing: 2px;
`
const WhiteText = styled.span`
  color: white;
  margin-right: 5px;
  letter-spacing: 2px;
`

const apiData = {
  totalBoughtKey: 231412,
  totalMoneyInLotteryPool: 21421,
  totalMoneyInWinningPool: 441221,
  totalMoneyInPassiveIncomePool: 21341,
}

class Play extends React.PureComponent {
  state = {
    tempNumber: '',
    tempNumberFrom: '',
    tempNumberTo: '',
    numbers: [],
    numberRanges: [],
  }

  removeTarget = (key, index) => {
    const targets = this.state[key] /* eslint-disable-line */
    this.setState({
      [key]: [
        ...targets.slice(0, index),
        ...targets.slice(index + 1),
      ],
    })
  }

  updateFiled = (key, value) => this.setState({ [key]: value })

  render() {
    const {
      numbers,
      tempNumber,
      numberRanges,
      tempNumberFrom,
      tempNumberTo,
    } = this.state

    const isValidNumberInput = !(tempNumber === '')
    const isValidNumberRangeInput = !(tempNumberFrom === '' || tempNumberTo === '')

    return (
      <Layout>
        <SectionContainer>
          <Section sectionTitle="Money Pool">
            <LineWrapper>
              <EthImg src="static/eth.svg" />
              <Color>
                $
                {apiData.totalMoneyInLotteryPool}
              </Color>
            </LineWrapper>
          </Section>
          <Section sectionTitle="Total Bought Numbers">
            <LineWrapper>
              <EthImg src="static/eth.svg" />
              <Color>102,412</Color>
            </LineWrapper>
          </Section>
        </SectionContainer>
        <SectionContainer>
          <Section sectionTitle="Passive Income">
            <LineWrapper>
              <EthImg src="static/eth.svg" />
              <Color>To earn 0.0931 every number is bought</Color>
            </LineWrapper>
          </Section>
          <Section sectionTitle="Lottery Pool">
            <LineWrapper>
              <EthImg src="static/eth.svg" />
              <Color>13.45</Color>
            </LineWrapper>
          </Section>
        </SectionContainer>

        <Spacer />

        <SectionContainer>
          <NoticeMessage>
            <WhiteText>Spend 204 to win</WhiteText>
            <YellowText>
              310421 ETH
            </YellowText>
          </NoticeMessage>
          <NoticeMessage>
            <WhiteText>You have 21% chance to win</WhiteText>
            <YellowText>
              13.45 ETH
            </YellowText>
          </NoticeMessage>
        </SectionContainer>

        <SectionContainer>
          <Section sectionTitle="Number">
            <Input
              type="number"
              min="0"
              onChange={e => this.updateFiled('tempNumber', e.target.value)}
              value={tempNumber}
            />
            <StyledButton
              isDisabled={!isValidNumberInput}
              onClick={() => {
                if (!isValidNumberInput) return
                this.setState({
                  tempNumber: '',
                  numbers: [tempNumber, ...numbers],
                })
              }}
            >
              +
            </StyledButton>
            {
              numbers.length === 0
                ? <NumbersContainerWrapper />
                : (
                  <NumbersContainer>
                    {numbers.map((value, index) => (
                      <NumberLine
                        onClick={() => this.removeTarget('numbers', index)}
                        key={value}
                      >
                        {value}
                      </NumberLine>
                    ))}
                  </NumbersContainer>
                )
            }
          </Section>
          <Section sectionTitle="Range Number">
            <StyledInputWrapper>
              <StyledInput
                value={tempNumberFrom}
                onChange={e => this.updateFiled('tempNumberFrom', e.target.value)}
                marginRight
                type="number"
                min="0"
              />
              <StyledInput
                value={tempNumberTo}
                onChange={e => this.updateFiled('tempNumberTo', e.target.value)}
                isDisabled={tempNumberFrom === ''}
                type="number"
                min={tempNumberFrom === '' ? '0' : tempNumberFrom}
              />
            </StyledInputWrapper>
            <StyledButton
              isDisabled={!isValidNumberRangeInput}
              onClick={() => {
                if (!isValidNumberRangeInput) return
                this.setState({
                  tempNumberFrom: '',
                  tempNumberTo: '',
                  numberRanges: [
                    { from: tempNumberFrom, to: tempNumberTo },
                    ...numberRanges,
                  ],
                })
              }}
            >
              +
            </StyledButton>
            {
              numberRanges.length === 0
                ? <NumbersContainerWrapper />
                : (
                  <NumbersContainerWrapper>
                    {numberRanges.map((numberRange, index) => (
                      <FullWidthNumberLine
                        key={`${numberRange.from}-${numberRange.to}`}
                        onClick={() => this.removeTarget('numberRanges', index)}
                      >
                        {numberRange.from}
                        -
                        {numberRange.to}
                      </FullWidthNumberLine>
                    ))}
                  </NumbersContainerWrapper>
                )

            }
          </Section>
        </SectionContainer>
      </Layout>
    )
  }
}

export default Play
