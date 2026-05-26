import { createSlice } from "@reduxjs/toolkit";

type ReduxAuthState = {
    isLoggedin : boolean;
    userData : any;
};

const initialState : ReduxAuthState = {
    isLoggedin : false,
    userData : null,
};

const AuthSlice = createSlice({
    name : "auth",
    initialState : initialState,
    reducers : {
        login : (state, action) => {
            state.isLoggedin = true;
            state.userData = action.payload;
        },
        logout : (state) => {
            state.isLoggedin = false;
            state.userData = null;
        }
    }
});

export const {login, logout} = AuthSlice.actions;
export const AuthReducer = AuthSlice.reducer;