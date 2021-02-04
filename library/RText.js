import ReactNative from 'react-native'
import PropTypes from 'prop-types'
import RLanguage from './RLanguage'
import React, { Component } from 'react'
import _ from 'lodash'
React.PropTypes = PropTypes

const BUSINESS_ID = 'RText'

let RTextConfig = null

export default class RText {
  static mount () {
    // inject navigation into RN Text comps
    // rewrite render function of RN Text comps
    if (typeof _.get(ReactNative, 'Text.render') === 'function') {
      const RawText = ReactNative.Text
      delete ReactNative.Text
      ReactNative.Text = RText.createRTextComps(RawText)
    }
    if (typeof _.get(ReactNative, 'Text.prototype.render') === 'function') {
      ReactNative.Text.contextTypes = {
        navigation: PropTypes.object
      }
      ReactNative.Text.contextType = {
        navigation: PropTypes.object
      }
      const rawTextRender = ReactNative.Text.prototype.render
      ReactNative.Text.prototype.render = function (...args) {
        const newProps = this.props
        delete this.props
        this.props = {
          ...newProps,
          // replace children by RText config
          children: RLanguage.getTextByChildren(newProps.children, this, RTextConfig)
        }
        return rawTextRender.apply(this, args)
      }
    }
  }
  static init (initParams = {}) {
    // request RText config file
    RLanguage.requestConfig(initParams.configUrl, BUSINESS_ID)
    .then(configJson => {
      // check config format
      if (configJson === null) {
        return
      }
      RTextConfig = configJson
    })
  }
  static createRTextComps (RawText) {
    return class RTextComnps extends Component {
      render () {
        const props = {
          ...this.props,
          children: undefined
        }
        return <RawText {...props}>{this.props.children}</RawText>
      }
    }
  }
  static setRoute (route = {}) {
    RLanguage.setRoute(route)
  }
}

RText.mount()
