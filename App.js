import { Provider } from 'react-redux';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { colors } from './src/styles';
import { store, persistor } from './src/redux/store';
import AppView from './src/modules/AppViewContainer';
import _ from 'lodash'
import RText from './library/RText'

RText.init({
  configUrl: 'http://127.0.0.1:3333/cdn/RText.json?a=4'
})


export default function App() {
  const navigationRef = React.useRef(null);
  return (
    <Provider store={store}>
      <NavigationContainer
        onStateChange={(state, state2) => {
          console.log('NavigationContainer state', state)
          const routeLength = _.get(state, 'routes.length')
          RText.setRoute({
            name: _.get(state, `routes[${routeLength - 1}].name`),
            params: _.get(state, `routes[${routeLength - 1}].params`)
          })
        }}
        >
        <PersistGate
          loading={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <View style={styles.container}>
              <ActivityIndicator color={colors.red} />
            </View>
          }
          persistor={persistor}
        >
          <AppView />
        </PersistGate>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
