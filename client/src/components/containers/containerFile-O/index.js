import React from 'react';
import Topnav from './topnav';
import Footer from '../../footer';
import './style.css';

export default ({ children, width }) => {
    return <div className="contain">
        <Topnav width={width} />
        {children}
        <Footer/>
    </div>
};
