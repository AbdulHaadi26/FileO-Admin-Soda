import { userConstants } from '../constants';
export default next => async dispatch => localStorage.getItem('token') !== null ? next() : dispatch({ type: userConstants.GPErr });