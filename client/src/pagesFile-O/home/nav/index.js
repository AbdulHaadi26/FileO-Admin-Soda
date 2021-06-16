import React, { useState } from 'react';
import { connect } from 'react-redux';
import Link from 'react-router-dom/Link';
import Square from '../../../assetsFile-O/square.svg';
import Logo from '../../../assets/logo.svg';
import history from '../../../utils/history';
import './style.css';

const Topnav = ({ width, nav }) => {
    const [isN, setN] = useState(false);

    const renderLinks = () => {
        return <div className="sub-nav">
            <Link className={`link ${nav === 0 ? 'active' : ''}`} to='/home' onClick={e => {
                setN(false);
            }}>Home</Link>
            <Link className={`link ${nav === 2 ? 'active' : ''}`} to='/pricing' onClick={e => {
                setN(false);
            }}>Plans {'&'} Pricing</Link>
            <Link className={`link ${nav === 3 ? 'active' : ''}`} to='/contact' onClick={e => {
                setN(false);
            }}>Contact Us</Link>
            <Link className="link" to='/login'>Login</Link>
            <Link className="button" to='/pricing'>Get Started</Link>
        </div>
    };

    return <div className="top-nav">
        {(width === 0 || width > 992) && <>
            <div className="mr-auto logo" onClick={e => history.push('/')}
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: 'fit-content', cursor: 'pointer' }}>
                <img src={Logo} alt="Logo" />
                <h3>File-O</h3>
            </div>
            {renderLinks()}
        </>}
        {width !== 0 && width < 992 && <>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: isN ? '24px' : '0px' }}>
                <div className="mr-auto logo" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: 'fit-content' }}>
                    <img src={Logo} alt="Logo" />
                    <h3>File-O</h3>
                </div>
                <button className="burger" onClick={e => setN(!isN)}>
                    <img src={Square} alt="Burger" style={{ width: '16px', height: '16px' }} />
                </button>
            </div>
            {isN && renderLinks()}
        </>}
    </div>
}

const mapStateToProps = state => {
    return {
        nav: state.Nav.nav
    }
};

export default connect(mapStateToProps)(Topnav);