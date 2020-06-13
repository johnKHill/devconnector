import { REGISTER_SUCCESS, REGISTER_FAIL } from "../actions/types";

const initialState = {
  // Get the token if it;s there from localStorage
  token: localStorage.getItem("token"),
  isAuthenticated: null,
  loading: true,
  user: null,
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case REGISTER_SUCCESS:
      // set the token returned into localStorage
      localStorage.setItem("token", payload.token);
      return {
        ...state,
        payload,
        isAuthenticated: true,
        loading: false,
      };
    case REGISTER_FAIL:
      // Remove the token from localStorage if there is one
      localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
}
