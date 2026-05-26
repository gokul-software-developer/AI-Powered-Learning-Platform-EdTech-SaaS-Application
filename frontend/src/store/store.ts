import { AuthReducer } from '@/features/auth-slice';
import {configureStore, combineReducers} from '@reduxjs/toolkit'
import {FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig ={
    key : "root",
    storage,
}

const combinedReducers = combineReducers({
    auth : AuthReducer
});

const persistedReducer = persistReducer(persistConfig, combinedReducers)

export const store = configureStore({
    reducer : persistedReducer,
    middleware : (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck : {
                ignoreActions : [REGISTER, PURGE, FLUSH, REHYDRATE, PAUSE, PERSIST] as any,
            }
        })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;