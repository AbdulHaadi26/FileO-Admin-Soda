import React from 'react';
import '../style.css';
import ErrText from '../../../assets/static/errTxt.svg';
import history from '../../../utils/history';
export default () => <div className="err-m2">
    <img src={ErrText} alt="error" className="err-img" />
    <h5 className="eT">User Storage Limit Reached. Please Contact Administrator.</h5>
    <button className="btn btn-success" onClick={e => history.goBack()}>Go Back</button>
</div>