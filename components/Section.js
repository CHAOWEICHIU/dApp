import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const SectionWrapper = styled.div`
  width: 400px;
  border: 1px rgba(120,120,120, 0.7) solid;
  margin: 20px;
`
const SectionTitleText = styled.div`
  color: rgb(119,136,153);
  background: rgba(6,9,14,0.95);
  font-size: 18px;
  width: calc(100% - 20px);
  padding: 10px;
  border-bottom: 1px rgba(120,120,120, 0.7) solid;
`
const SectionTextWrapper = styled.div`
  ${props => !props.withoutPadding && 'padding: 20px;'}
`

const Section = ({ sectionTitle, children, withoutPadding }) => (
  <SectionWrapper>
    <SectionTitleText>{sectionTitle}</SectionTitleText>
    <SectionTextWrapper withoutPadding={withoutPadding}>
      {children}
    </SectionTextWrapper>
  </SectionWrapper>
)

Section.propTypes = {
  sectionTitle: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  withoutPadding: PropTypes.bool,
}

Section.defaultProps = {
  withoutPadding: false,
}

export default Section
