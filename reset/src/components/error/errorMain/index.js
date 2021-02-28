import React from 'react';
import Loader from '../../../assets/error.svg';
const mH = { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' };
const mT = { marginTop: '30px' };
const eT = { color: '#2d3436', textAlign: 'center', fontSize: '50px', fontWeight: '700', fontFamily: 'Amatic SC, cursive' };
export default () => <div className="col-12" style={mH}>
    <img src={Loader} className="col-lg-4 col-12" style={mT} alt="Office Gif" />
    <h3 className="col-lg-6 col-12" style={eT}>Oop's Somthing Unexpected Has Occured</h3>
</div>