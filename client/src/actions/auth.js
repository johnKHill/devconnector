import axios from "axios";
import { setAlert } from "./alert";
import { REGISTER_SUCCESS, REGISTER_FAIL } from "./types";

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
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }

    // If not, then dispatch fail
    dispatch({ type: REGISTER_FAIL });
  }
};
