import React from 'react';
import Logo from '../assets/logo.svg';
import { baseUrl } from '../utils/api';
import './style.css';

export default ({ children }) => <form className="sp-w col-12 p-0">
    <div className="f-div col-lg-8 col-12">
        <div className="horz" style={{ justifyContent: 'center', marginBottom: '30px' }}>
            <img src={Logo} alt="File Logo" className="logo" onClick={e => window.open(baseUrl)} style={{ cursor: 'pointer' }} />
            <h3 className="h" onClick={e => window.open(baseUrl)} style={{ cursor: 'pointer' }} >File-O</h3>
        </div>
        {children}
        <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '14px', color: 'gray' }}>Start using <a href={baseUrl} rel="noopener noreferrer" target="_blank">File-O</a> and signup as Individual/Freelancer or Business/Team for free.</p>
    </div>
</form>