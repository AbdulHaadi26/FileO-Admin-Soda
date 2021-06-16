import React from 'react';
import '../style.css';
import Container from '../../componentsF/container';
import Success from '../../assets/static/success.svg';

export default () => <Container>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h6 className="sucTH">File Upload Successful <div className="faC" /></h6>
        <h6 className="sucT">Thank you for being our valueable customer</h6>
        <img src={Success} alt="Success" className="img-suc" />
    </div>
</Container>