import React from 'react'
import styled from 'styled-components'
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc'
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

const NumberLine = styled.div`
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px white solid;
  color: white;
  cursor: pointer;
  user-select: none;
`
const NumbersContainer = styled.div`
  display: grid;
  grid-column-gap: 10px;
  grid-template-columns: auto auto auto;
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

const SortableItem = SortableElement(({ num }) => <NumberLine>{num}</NumberLine>)

const SortableNumbersContainer = SortableContainer(({ numbers }) => (
  <NumbersContainer>
    {numbers.map((value, index) => <SortableItem key={value} num={value} index={index} />)}
  </NumbersContainer>
))

class Play extends React.PureComponent {
  state = {
    tempNumber: '',
    numbers: [],
  }

  onSortEnd({ oldIndex, newIndex }) {
    const { numbers } = this.state
    this.setState({
      numbers: arrayMove(numbers, oldIndex, newIndex),
    })
  }

  updateFiled = (key, value) => this.setState({ [key]: value })

  render() {
    const { numbers, tempNumber } = this.state
    return (
      <Layout>
        <SectionContainer>
          <Section sectionTitle="Money Pool">
            <LineWrapper>
              <EthImg src="static/eth.svg" />
              <Color>$ 342,131,212</Color>
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
          <Section sectionTitle="Number">
            <Input
              type="number"
              min="0"
              onChange={e => this.updateFiled('tempNumber', e.target.value)}
              value={tempNumber}
            />
            <StyledButton
              isDisabled={tempNumber === ''}
              onClick={() => {
                if (tempNumber === '') return
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
                ? null
                : (
                  <SortableNumbersContainer
                    numbers={numbers}
                    axis="xy"
                    onSortEnd={this.onSortEnd.bind(this)} /* eslint-disable-line */
                  />
                )
            }
          </Section>
          {/* <Section sectionTitle="Range Number">
            <LineWrapper>
              <EthImg src="static/eth.svg" />
              <Color>102,412</Color>
            </LineWrapper>
          </Section> */}
        </SectionContainer>
      </Layout>
    )
  }
}

export default Play
