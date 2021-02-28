import React from 'react';
import Logo from '../../assets/static/cwaret-logo.svg';
import './style.css';
export default React.memo(() => <div className="pb-w">
    <img src={Logo} alt="Cwaret" className="clogo" />
    <h6 className="t mr-auto">Powered by CWare Technologies</h6>
    <h6 className="st">Copyright © 2017  CWare Technologies, Inc.</h6>
</div>);