import uuid from "react-uuid";
import { SET_ALERT, REMOVE_ALERT } from "./types";

//  dispatch can be used bc of Thunk middleware
// UUID - for a random universal id on the fly for the alerts
export const setAlert = (msg, alertType, timeout = 5000) => (dispatch) => {
  const id = uuid();
  // Call/dispatch the setAlert action.type
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });

  // Setting a time/5sec to dispatch the removeAlert actionType
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
