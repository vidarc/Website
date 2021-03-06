import React from 'react'

import typography from '@mattailes/typography'
import { defineCustomElements } from '@mattailes/ui/dist/loader'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { hydrate, render } from 'react-dom'
import { Provider } from 'react-redux'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

import '@mattailes/ui/www/build/mattailes.css'

import App from './components/App'
import { configureStore, rootSaga, sagaMiddleware } from './ducks'

firebase.initializeApp({
  apiKey: 'AIzaSyCfFUY9_dBsSSrCeqKCJVRgy5YE0YfQU9s',
  authDomain: 'website-b10e5.firebaseapp.com',
  databaseURL: 'https://website-b10e5.firebaseio.com',
  projectId: 'website-b10e5',
  storageBucket: 'website-b10e5.appspot.com',
  messagingSenderId: '896911814889',
  appId: '1:896911814889:web:b447586521925a25408078',
  measurementId: 'G-1WT9RDTR48',
})

const store = configureStore()
sagaMiddleware.run(rootSaga)
const client = new ApolloClient({
  name: 'react-site',
  uri: 'https://us-central1-website-b10e5.cloudfunctions.net/api/graphql',
})

typography.injectStyles()

function renderApp(Component: any, element: HTMLElement, renderFunction: any) {
  renderFunction(
    <ApolloProvider client={client}>
      <Provider store={store}>
        <Component />
      </Provider>
    </ApolloProvider>,
    element
  )
}

function initApp(Component: any, element: HTMLElement) {
  if (element.hasChildNodes()) {
    renderApp(Component, element, hydrate)
  } else {
    renderApp(Component, element, render)
  }

  defineCustomElements(window)
}

const rootElement = document.getElementById('root')
initApp(App, rootElement)

if (module.hot) {
  module.hot.accept('./components/App', () => {
    const Next = import('./components/App')
    renderApp(Next, rootElement, hydrate)
  })
}
