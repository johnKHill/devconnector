import axios from "axios";
import { setAlert } from "./alert";
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_PROFILE,
} from "./types";

import setAuthToken from "../utils/setAuthToken";

// Load User
export const loadUser = () => async (dispatch) => {
  // check localStorage
  if (localStorage.token) {
    // set the headers
    setAuthToken(localStorage.token);
  }
  // Make request
  try {
    const res = await axios.get("/api/auth");
    // Dispatch for 'success'
    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

// Register User
export const register = ({ name, email, password }) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  //  Preparing the data to send
  const body = JSON.stringify({ name, email, password });

  try {
    // Response from the backend
    const res = await axios.post("/api/users", body, config);

    // if everything turns out ok, then dispatch success and a token
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });

    dispatch(loadUser());
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }

    // If not, then dispatch fail
    dispatch({ type: REGISTER_FAIL });
  }
};

// Login User
export const login = (email, password) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  //  Preparing the data to send
  const body = JSON.stringify({ email, password });

  try {
    // Response from the backend
    const res = await axios.post("/api/auth", body, config);

    // if everything turns out ok, then dispatch success and a token
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });

    dispatch(loadUser());
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }

    // If not, then dispatch fail
    dispatch({ type: LOGIN_FAIL });
  }
};

// Logout User
export const logout = () => (dispatch) => {
  dispatch({ type: CLEAR_PROFILE });
  dispatch({ type: LOGOUT });
};
