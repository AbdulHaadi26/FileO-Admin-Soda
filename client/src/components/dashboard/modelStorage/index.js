import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ModalBg from '../../containers/modalStrContainer';
import Cross from '../../../assets/cross.svg';
import { getPackages } from '../../../redux/actions/organizationActions';
import '../style.css';
import { ModalProcess } from '../../../redux/actions/profileActions';
const Storage = lazy(() => import('./storage'));
const iG = { marginTop: '2px', width: '95%' };
const mS = { width: '100%', textAlign: 'center', marginTop: '12px', fontSize: '18px', fontWeight: '400' };
const tS = { marginTop: '12px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const eS = { marginTop: '16px', marginBottom: '12px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };

const Modal = ({
    onhandleModal, data_uploaded, combined_plan, available, percent, packages, getPackages, org, submitData, active_plan, ModalProcess
}) => {
    const [pkg, setPkg] = useState(''), [pkgs, setPkgs] = useState([]), [pkgVal, setPKGV] = useState(combined_plan), [pkgErr, setPErr] = useState(false), [pkgSErr, setPSErr] = useState(false);

    useEffect(() => {
        combined_plan && getPackages({ size: Math.floor(Math.round(combined_plan - 1)) });
    }, [combined_plan, getPackages]);

    useEffect(() => {
        let pkges;
        if (packages && packages.length > 0) {
            pkges = packages.sort(function (a, b) {
                return a.size - b.size;
            });
        }
        if (pkges && pkges.length > 0) setPkg(pkges[0]);
        setPkgs(pkges);
    }, [packages]);


    const submitForm = e => {
        e.preventDefault();
        let data = {
            org: org,
            pkgId: pkg._id,
            current_plan: active_plan._id,
            price: (pkg.size - combined_plan) * 5
        };
        if (pkg && pkg._id && active_plan._id !== pkg._id && pkg.size > active_plan.size) submitData(data, pkg);
        else if (active_plan._id === pkg._id) {
            ModalProcess({ title: 'Storage', text: 'You have selected the plan which is your current active plan.', isErr: true });
            onhandleModal(e);
        }
    };

    const onhandlePKG = e => {
        setPKGV(e.target.value);
        if (e.target.value % 50 === 0 && pkgErr) setPErr(false);
        else if (e.target.value % 50 !== 0 && !pkgErr) setPErr(true);

        let tempP = pkgs, isBool = false;
        if (e.target.value > combined_plan) {
            setPSErr(false);
            if (tempP && tempP.length > 0 && e.target.value % 50 === 0) {
                tempP.map(i => {
                    if (i.size === Number(e.target.value)) {
                        setPkg(i);
                        isBool = true;
                    }
                    return i;
                });
            } else setPErr(true);
            if (isBool) setPErr(false);
            else setPErr(true);
        } else setPSErr(true);
    };

    return <ModalBg handleModal={onhandleModal}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <img src={Cross} alt="Cross" style={{ width: '16px', height: '16px', cursor: 'pointer' }} onClick={e => onhandleModal(e, false)} />
        </div>
        <h6 style={mS}>Upgrade Storage</h6>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="col-lg-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Storage data_uploaded={data_uploaded} combined_plan={available} />
                <div className="col-lg-9" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="col-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <h6 style={{ fontSize: '16px', color: 'grey', fontWeight: '500', textAlign: 'center' }}>{data_uploaded ? data_uploaded.toFixed(2) : 0} GB </h6>
                        <h6 style={{ fontSize: '12px', color: 'grey', fontWeight: '400', textAlign: 'center' }}>{Math.floor(percent)}% Used</h6>
                    </div>
                    <div style={{ width: '2px', height: '36px', backgroundColor: 'grey', marginTop: '-4px' }}></div>
                    <div className="col-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <h6 style={{ fontSize: '16px', color: 'grey', fontWeight: '500', textAlign: 'center' }}>{combined_plan ? combined_plan.toFixed(2) : 0} GB </h6>
                        <h6 style={{ fontSize: '12px', color: 'grey', fontWeight: '400', textAlign: 'center' }}>Current Plan</h6>
                    </div>
                </div>
            </div>
            <form className="col-lg-6" style={{ display: 'flex', flexDirection: 'column', margin: '18px 0px', alignItems: 'center', border: '2px solid #dfe6e9', borderRadius: '4px', padding: '24px 12px' }} onSubmit={submitForm}>
                <h6 style={{ fontSize: '16px', color: 'grey', fontWeight: '400', textAlign: 'center' }}>Upgrade Storage </h6>
                <h6 style={tS}>STORAGE SIZE</h6>
                <div className="input-group" style={iG}>
                    <input type={'number'} min={0} max={5000} step={50} className="form-control" placeholder={'Enter package'} value={pkgVal} onChange={e => onhandlePKG(e)} />
                    <div className="input-group-append">
                        <span className="input-group-text">GB</span>
                    </div>
                </div>
                {!pkgSErr && pkgErr && <div style={eS}>The package size should be a multiple of 50 e.g 50, 100, 150...upto 5000.</div>}
                {pkgSErr && <div style={eS}>The package size should be greater than the current plan.</div>}
                <h6 style={tS}>PRICE</h6>
                <h6 style={{ fontSize: '16px', color: 'green', fontWeight: '500', width: '90%' }}>
                    PKR {pkg ? ((Number(pkg.size) - Number(combined_plan))  * 5) : 0}
                </h6>
                <button className="btn btn-str">Upgrade</button>
            </form>
        </div>
    </ModalBg>
}

const mapStateToProps = state => {
    return {
        packages: state.Organization.packages
    }
}

export default connect(mapStateToProps, { getPackages, ModalProcess })(Modal);