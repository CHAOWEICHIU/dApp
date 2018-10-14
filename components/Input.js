import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const StyledTextWrapper = styled.div`
  display: flex;
  align-items: flex-end;
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
  width: 300px;
  padding: 0 20px;
  border-radius: 10px;
`

const StyledText = styled.div`
  font-size: 30px;
  color: white;
  margin-right: 10px;
  font-weight: 300;
`

const Input = ({ label, ...props }) => (
  <StyledTextWrapper>
    <StyledText>{label}</StyledText>
    <InputPadding>
      <StyledInput {...props} />
    </InputPadding>
  </StyledTextWrapper>
)

Input.propTypes = {
  label: PropTypes.string.isRequired,
}

export default Input
