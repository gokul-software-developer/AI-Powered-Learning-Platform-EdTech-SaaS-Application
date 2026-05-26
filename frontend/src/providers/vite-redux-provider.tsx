import React from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { persistor, store } from '@/store/store';

type Props = {
    children : React.ReactNode;
}

const ViteReduxProvider = (props : Props) => {
  return (
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            {props.children}
        </PersistGate>
    </Provider>
  )
}

export default ViteReduxProvider