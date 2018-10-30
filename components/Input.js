import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const StyledTextWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  opacity: ${props => (props.isDisabled ? 0.4 : 1)};
`

const StyledInput = styled.input`
  background: rgb(38, 52, 60);
  border: transparent;
  height: 40px;
  width: 100%;
  text-decoration: none;
  outline: none;
  color: white;
  font-size: 20px;
`
const InputPadding = styled.div`
  background: rgb(38, 52, 60);
  width ${props => (props.hasLabel ? '300px' : '100%')};
  padding: 0 20px;
`

const StyledText = styled.div`
  font-size: 18px;
  color: white;
  margin-right: 10px;
  font-weight: 300;
  width: 100px;
`

const Input = ({ label, isDisabled, ...props }) => (
  <StyledTextWrapper isDisabled={isDisabled}>
    { label && (<StyledText>{label}</StyledText>) }
    <InputPadding hasLabel={label}>
      <StyledInput {...props} disabled={isDisabled} />
    </InputPadding>
  </StyledTextWrapper>
)

Input.propTypes = {
  label: PropTypes.string, /* eslint-disable-line */
}

export default Input
