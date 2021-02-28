import React from 'react';
import '../style.css';
import history from '../../../utils/history';
import ErrText from '../../../assets/static/errTxt.svg';

export default ({ text }) => <div className="err-m">
    <img src={ErrText} alt="error" className="err-img" />
    <h5 className="eT">{text}</h5>
    <button className="btn btn-success" onClick={e => history.goBack()}>Go Back</button>
</div>