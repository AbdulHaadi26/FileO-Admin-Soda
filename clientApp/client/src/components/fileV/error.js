import React from 'react';
import '../style.css';
import Container from '../container';
import ErrorReg from '../../assets/static/errorReg.svg';
import { baseUrl } from '../../utils/api';

export default function (props) {
    function errorType(n) {
        return n === 1 || n === 5 ? 'File Does Not Exist' : n === 2 ? 'The Url For File Has Expired' : n === 3 ? 'File Exceeds Size Limit' : n === 4 ? 'Storage Space Reached' : 'The Url Does Not Exist'
    }

    return <Container>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h6 className="errTH">{errorType(props.eT)}<div className="faM" /></h6>
            <img src={ErrorReg} alt="error" className="img-err" />
            <a className="btn btn-success" style={{ marginTop: '30px' }} href={baseUrl} rel="noopener noreferrer" target="_blank">Go Back to Home</a>
        </div>
    </Container>
}