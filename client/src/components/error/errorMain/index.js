import React from 'react';
import { connect } from 'react-redux';
import Loader from '../../../assets/error.svg';
import { logOut } from '../../../redux/actions/userActions';
const btnStyle = { marginTop: '20px', marginbottom: '20px', marginLeft: '12px', marginRight: '12px' };
const mH = { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' };
const mT = { marginTop: '30px' };
const eT = { color: '#2d3436', textAlign: 'center', fontSize: '50px', fontWeight: '700' };
const bC = { marginBottom: '30px', display: 'flex', flexDirection: 'row', justifyContent: 'center' };
const ErrorMain = ({ logOut }) => <div className="col-12" style={mH}>
    <img src={Loader} className="col-lg-4 col-12" style={mT} alt="Office Gif" />
    <h3 className="col-lg-6 col-12" style={eT}>Oop's somthing unexpected has occurred</h3>
    <div className="col-lg-5 col-12" style={bC}>
        <button className="btn btn-info col-5" style={btnStyle} onClick={e => window.location.reload()}>Retry</button>
        <button className="btn btn-danger col-5" style={btnStyle} onClick={e => logOut()}>Logout</button>
    </div>
</div>

export default connect(null, { logOut })(ErrorMain);