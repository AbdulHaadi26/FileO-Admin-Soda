import React from 'react';
import Container from '../container';
import ErrorReg from '../../assets/static/errorReg.svg';

export default () => <Container>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h6 className="errTH">Invalid Url Supplied<div className="faM" /></h6>
        <img src={ErrorReg} alt="error" className="img-err" />
        <a className="btn btn-success" style={{ marginTop: '30px' }} href="https://demo1login.file-o.com/">Go Back to Home</a>
    </div>
</Container>
