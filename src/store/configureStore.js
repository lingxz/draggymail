import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga'
import { Record, fromJS } from "immutable"
import rootReducer from '../reducers';
import createHelpers from './createHelpers';
import createLogger from './logger';
import rootSaga from '../sagas';

export default function configureStore(initialState, helpersConfig) {
  console.log(helpersConfig)
  const helpers = createHelpers(helpersConfig);
  const sagaMiddleware = createSagaMiddleware();
  // const middleware = [sagaMiddleware, thunk.withExtraArgument(helpers)];
  const middleware = [sagaMiddleware]

  let enhancer;

  if (__DEV__) {
    middleware.push(createLogger());

    // https://github.com/zalmoxisus/redux-devtools-extension#redux-devtools-extension
    let devToolsExtension = f => f;
    if (process.env.BROWSER && window.devToolsExtension) {
      devToolsExtension = window.devToolsExtension();
    }

    enhancer = compose(
      applyMiddleware(...middleware),
      devToolsExtension,
    );
  } else {
    enhancer = applyMiddleware(...middleware);
  }

  // See https://github.com/rackt/redux/releases/tag/v3.1.0
  const store = createStore(rootReducer, fromJS(initialState), enhancer);
  sagaMiddleware.run(rootSaga, helpers);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (__DEV__ && module.hot) {
    module.hot.accept('../reducers', () =>
      // eslint-disable-next-line global-require
      store.replaceReducer(require('../reducers').default),
    );
  }

  return store;
}
