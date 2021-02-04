import _ from 'lodash'

const RuleString = 'string'
const RuleRegExp = 'regexp'

let cacheData = {}
let currentRouteName
let currentRouteParams

class RLanguage {
  /**
   * request config file
   * @param {String} url config url (CDN); e.g. https://www.xxxx.com/RText.json
   * @param {Sting} businessId unique key for business; e.g. RText/RView/RButton/RStore
   */
  requestConfig (url, businessId) {
    return fetch(url, {
      method: 'GET',
    }).then(response => response.json())
    .then((data) => {
      try {
        cacheData[businessId] = data
        console.log('\x1B[32m%s\x1B[39m', `request ${businessId} successfully`)
        console.log(`${businessId} data: `, data)
        return cacheData[businessId]
      } catch (error) {
        // catch json() wrong
        console.warn(`${businessId} config should be a JSON format, please check and fix the config file: ${url}`)
        return null
      }
    }).catch(error => {
      // request fail
      if (typeof error === 'string') console.warn(error)
      console.warn(`request config file fail, please check ${url}`)
    })
  }
  getTextByChildren (rawChild, TextComps, rtextConfig) {
    let value = rawChild
    let rawValue = this._handleRawChildToString(rawChild)
    if (!rtextConfig) return value
    const routeName = this._getCurrentRouteName(TextComps)
    const pageConfigs = _.get(rtextConfig, routeName)
    if (typeof routeName === 'string' && pageConfigs && pageConfigs.length) {
      pageConfigs.forEach(item => {
        const itemRule = _.get(item, 'rule', RuleString)
        if (typeof itemRule === 'string' && typeof rawValue === 'string' && this._isParamsMatched(item.params, TextComps)) {
          const cond = String(item.text) || ''
          switch (itemRule.toLowerCase()) {
            case RuleString:
              if (this._isFuzzy(cond)) {
                const realCond = cond.slice(1, -1)
                // fuzzy match
                if (String(rawValue).includes(realCond)) {
                  value = this._replaceString(realCond, item.replacement, rawValue)
                }
              } else {
                // entire match
                if (String(rawValue) === cond) {
                  value = this._replaceString(cond, item.replacement, rawValue)
                }
              }
              break
            case RuleRegExp:
              if (rawValue.match(cond)) {
                value = item.replacement
              }
              break
            default:
              break
          }
        }
      })
    }
    return value
  }

  _handleRawChildToString (rawChild) {
    let rawValue = rawChild
    if (Array.isArray(rawChild)) {
      rawValue = ''
      rawChild.forEach(item => {
        if (typeof item === 'string' || typeof item === 'number') rawValue += String(item)
      })
    }
    return rawValue
  }

  _getCurrentRouteName (Comps) {
    return _.get(Comps, 'context.navigation.state.routeName', '') || currentRouteName
  }

  _getCurrentRouteParams (Comps) {
    return _.get(Comps, 'context.navigation.state.params', {}) || currentRouteParams
  }

  // String replacer
  _replaceString (cond, _repl, rawValue) {
    let value = rawValue
    if (this._isFuzzy(_repl)) {
      // partial replace
      const repl = _repl.slice(1, -1)
      const reg = new RegExp(cond, 'g')
      value = rawValue.replace(reg, repl)
    } else {
      // entire replace
      value = _repl
    }
    return value
  }

  // if fuzzy
  _isFuzzy (str) {
    return str.slice(0, 1) === '%' && str.slice(-1) === '%'
  }

  _isParamsMatched (configParams = {}, Comps) {
    const routeParams = this._getCurrentRouteParams(Comps)
    let isMatched = true
    Object.keys(configParams).forEach(key => {
      isMatched = isMatched && configParams[key] === routeParams[key]
    })
    return isMatched
  }
  setRoute (route = {}) {
    currentRouteName = _.get(route, 'name')
    currentRouteParams = _.get(route, 'params')
  }
}

export default new RLanguage()
