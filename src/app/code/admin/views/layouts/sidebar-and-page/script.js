/* eslint-disable no-undef */
/**
 * We attach and namespace our utulity functions to avoid
 * collisions and create a predictable pattern for accessing
 * the methods that we need or want to use
 */
window.faux = {
  pageMessages: {
    addPageMessage: function (message) {
      const pageMessageContainer = document.querySelector('.page-message .messages')
      const messageNode = document.createElement('div')
      messageNode.innerText = message
      messageNode.classList.add('message')

      pageMessageContainer.appendChild(messageNode)
    },

    removeAllPageMessages: function () {
      // write empty HTML to page messages container
      document.querySelector('.page-message .messages').innerHTML = ''
    }
  },
  formTools: {
    sendFormAjax: function (e, form) {
      const action = !form.action.includes('://') ? form.action : form.getAttribute('data-action')

      fetch(action, {
        method: 'post',
        body: new URLSearchParams(new FormData(form)),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(response => {
        if (!response.ok) {
          response.json().then(data => {
            window.faux.pageMessages.removeAllPageMessages()
            window.faux.pageMessages.addPageMessage(data.message ?? data.error)
          })
        } else {
          response.json().then(data => {
            const redirectTo = data.redirectTo ?? ''
            window.faux.pageMessages.removeAllPageMessages()
            window.faux.pageMessages.addPageMessage('Success! Redirecting...')
            window.setTimeout(() => {
              if (redirectTo !== '') {
                location.href = redirectTo
              } else {
                location.reload()
              }
            }, 2000)
          })
        }
      })
      e.preventDefault()
    }
  },
  ajaxButtons: {
    link: function () {
      document.querySelectorAll('[data-submit-form]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          const form = document.querySelector('form.content')
          window.faux.formTools.sendFormAjax(e, form)
        })
      })
    }
  }
}

document.addEventListener('DOMContentLoaded', function (_event) {
  document.querySelectorAll('[data-submit-form]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const form = document.querySelector('form.content')
      window.faux.formTools.sendFormAjax(e, form)
    })
  })
})
