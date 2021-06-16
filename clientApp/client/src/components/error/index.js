import React from 'react';
import Container from '../container';
import ErrorReg from '../../assets/static/errorReg.svg';
import { baseUrl } from '../../utils/api';

export default () => <Container>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h6 className="errTH">Invalid Url Supplied<div className="faM" /></h6>
        <img src={ErrorReg} alt="error" className="img-err" />
        <a className="btn btn-success" style={{ marginTop: '30px' }} rel="noopener noreferrer" target="_blank" href={baseUrl}>Go Back to Home</a>
    </div>
</Container>
