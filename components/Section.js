import React from 'react'
import PropTypes from 'prop-types'
import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  0% {
    opacity: 0.1;
    transform: translateY(-80px);
  }
  70% {
    opacity: 0.6;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`

const SectionContainer = styled.div`
  width: 400px;
  border: 1px rgba(120,120,120, 0.7) solid;
  margin: 20px;
  animation: ${() => fadeIn} 1s ease-in-out both;
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

export const SectionLabel = styled.div`
  color: gray;
  font-size: 14px;
`
export const SectionContent = styled.div`
  color: white;
  font-size: 16px;
  margin-bottom: 10px;
  min-height: 20px;
`

export const SectionWrapper = styled.div`
  padding: 30px;
  display: flex;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
`

export const SectionImgWrapper = styled.div`
  display:flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`

const Section = ({
  sectionTitle,
  children,
  withoutPadding,
  className,
}) => (
  <SectionContainer className={className}>
    <SectionTitleText>{sectionTitle}</SectionTitleText>
    <SectionTextWrapper withoutPadding={withoutPadding}>
      {children}
    </SectionTextWrapper>
  </SectionContainer>
)

Section.propTypes = {
  sectionTitle: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.array,
  ]).isRequired,
  withoutPadding: PropTypes.bool,
  className: PropTypes.string, /* eslint-disable-line */
}

Section.defaultProps = {
  withoutPadding: false,
}

export default Section
