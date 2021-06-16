import { ModalProcess } from './profileActions';
import { logOut } from './userActions';
export default next => async dispatch => {
    if (localStorage.getItem('token') !== null) next()
    else {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true  }));
    }
}