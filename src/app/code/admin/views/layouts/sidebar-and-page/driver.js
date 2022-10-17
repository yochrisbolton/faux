/********************************************************************************
 * Turbo Drive Progress Bar
 * @license: https://github.com/hotwired/turbo/blob/main/MIT-LICENSE
 * @source: https://github.com/hotwired/turbo/blob/main/src/core/drive/progress_bar.ts
 *******************************************************************************/
function unindent (strings, ...values) {
  const lines = interpolate(strings, values).replace(/^\n/, '').split('\n')
  const match = lines[0].match(/^\s+/)
  const indent = match ? match[0].length : 0
  return lines.map((line) => line.slice(indent)).join('\n')
}

function interpolate (strings, values) {
  return strings.reduce((result, string, i) => {
    const value = values[i] === undefined ? '' : values[i]
    return result + string + value
  }, '')
}

function getMetaElement (name) {
  return document.querySelector(`meta[name="${name}"]`)
}
function getMetaContent (name) {
  const element = getMetaElement(name)
  return element && element.content
}

class ProgressBar {
  constructor () {
    this.hiding = false
    this.value = 0
    this.visible = false
    this.trickle = () => {
      this.setValue(this.value + Math.random() / 100)
    }
    this.stylesheetElement = this.createStylesheetElement()
    this.progressElement = this.createProgressElement()
    this.installStylesheetElement()
    this.setValue(0)
  }

  static get defaultCSS () {
    return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 2147483647;
        transition:
          width ${ProgressBar.animationDuration}ms ease-out,
          opacity ${ProgressBar.animationDuration / 2}ms ${ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `
  }

  show () {
    if (!this.visible) {
      this.visible = true
      this.installProgressElement()
      this.startTrickling()
    }
  }

  hide () {
    if (this.visible && !this.hiding) {
      this.hiding = true
      this.fadeProgressElement(() => {
        this.uninstallProgressElement()
        this.stopTrickling()
        this.visible = false
        this.hiding = false
      })
    }
  }

  setValue (value) {
    this.value = value
    this.refresh()
  }

  installStylesheetElement () {
    document.head.insertBefore(this.stylesheetElement, document.head.firstChild)
  }

  installProgressElement () {
    this.progressElement.style.width = '0'
    this.progressElement.style.opacity = '1'
    document.documentElement.insertBefore(this.progressElement, document.body)
    this.refresh()
  }

  fadeProgressElement (callback) {
    this.progressElement.style.opacity = '0'
    setTimeout(callback, ProgressBar.animationDuration * 1.5)
  }

  uninstallProgressElement () {
    if (this.progressElement.parentNode) {
      document.documentElement.removeChild(this.progressElement)
    }
  }

  startTrickling () {
    if (!this.trickleInterval) {
      this.trickleInterval = window.setInterval(this.trickle, ProgressBar.animationDuration)
    }
  }

  stopTrickling () {
    window.clearInterval(this.trickleInterval)
    delete this.trickleInterval
  }

  refresh () {
    window.requestAnimationFrame(() => {
      this.progressElement.style.width = `${10 + this.value * 90}%`
    })
  }

  createStylesheetElement () {
    const element = document.createElement('style')
    element.type = 'text/css'
    element.textContent = ProgressBar.defaultCSS
    if (this.cspNonce) {
      element.nonce = this.cspNonce
    }
    return element
  }

  createProgressElement () {
    const element = document.createElement('div')
    element.className = 'turbo-progress-bar'
    return element
  }

  get cspNonce () {
    return getMetaContent('csp-nonce')
  }
}
ProgressBar.animationDuration = 300

/********************************************************************************
 * Create SPA type experience
 * @license: MIT
 * @source: web.dev + custom
 *******************************************************************************/
window.addEventListener('DOMContentLoaded', () => {
  captureLinkClick()
  initLazyLoad()

  const observer = new window.MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'SECTION') {
          initLazyLoad()
          captureLinkClick()
        }
      })
    })
  })
  observer.observe(document.querySelector('.main'), {
    childList: true,
    subtree: true
  })
})

window.addEventListener('popstate', () => {
  fetchAndReplace(window.location, true)
})

/**
 * Capture link click and fetch the page
 */
function captureLinkClick () {
  document.querySelectorAll('a').forEach(async (element) => {
    element.removeEventListener('click', test)
    element.addEventListener('click', test)
  })
}

async function test (event) {
  await linkClickHandler(event.currentTarget, event)
}

/**
 * Init lazy load
**/
function initLazyLoad () {
  const lazyImages = [].slice.call(document.querySelectorAll('img.lazy'))

  if ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
    const lazyImageObserver = new window.IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const lazyImage = entry.target
          lazyImage.src = lazyImage.dataset.src
          lazyImage.srcset = lazyImage.dataset.srcset
          lazyImage.classList.remove('lazy')
          lazyImageObserver.unobserve(lazyImage)
        }
      })
    })

    lazyImages.forEach(function (lazyImage) {
      lazyImageObserver.observe(lazyImage)
    })
  }
}

/**
 * Fetch page from server and replace main content
**/
async function fetchAndReplace (url, skipPushState = false) {
  window.tooling.progressBar.visitRequestStarted()

  const response = await (await window.fetch(url.href, { headers: { accept: 'text/html' } })).text()

  document.querySelector('.main').style.minHeight = '50vh'

  document.querySelector('.main').textContent = ''
  window.scrollTo(0, 0)

  const div = document.createElement('div')
  div.innerHTML = response

  document.querySelector('.main').innerHTML = div.querySelector('.main').innerHTML
  document.querySelector('title').textContent = div.querySelector('title').textContent
  document.querySelector('style#page-styles').textContent = div.querySelector('style#page-styles').textContent

  if (!skipPushState) {
    window.history.pushState({}, '', url.href)
  }

  window.tooling.progressBar.visitRequestFinished()
  captureLinkClick()
  initLazyLoad()
  executeLoadedScriptTags()
  window.faux.ajaxButtons.link()
}

function executeLoadedScriptTags () {
  const scripts = document.querySelectorAll('script')
  scripts.forEach((script) => {
    if (script.src === '') {
      // eslint-disable-next-line no-eval
      eval(script.innerHTML)
    }
  })
}

/**
 * Detect link type and handle it if applicable
**/
async function linkClickHandler (element, event) {
  if (element.target === '_top') {
    return
  }
  if (element.target === '_blank') {
    return
  }
  if (element.hasAttribute('download')) {
    return
  }
  if (element.getAttribute('rel') === 'external') {
    return
  }
  if (element.href === window.location.href) {
    event.preventDefault()
    return
  }
  if (element.origin !== window.location.origin) {
    return
  }
  if (element.protocol !== window.location.protocol) {
    return
  }
  if (element.pathname === window.location.pathname && element.search === window.location.search) {
    event.preventDefault()
    return
  }
  event.preventDefault()
  const url = new URL(element.href)

  await fetchAndReplace(url)
}

/**
 * Window level tooling we can call
**/
window.tooling = {
  progressBar: {
    instance: new ProgressBar(),
    showProgressBar: () => {
      window.tooling.progressBar.instance.show()
    },

    visitRequestStarted: () => {
      window.tooling.progressBar.instance.setValue(0)
      window.tooling.progressBar.showProgressBar()
    },

    visitRequestFinished: () => {
      window.tooling.progressBar.instance.setValue(1)
      window.tooling.progressBar.hideVisitProgressBar()
    },

    hideVisitProgressBar: () => {
      window.tooling.progressBar.instance.hide()
    }
  },
  fetchAndReplace: fetchAndReplace
}
