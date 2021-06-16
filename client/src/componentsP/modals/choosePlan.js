import React, { useEffect, useState } from 'react';
import Modal from '../containers/modalBgContainer';
import { billingReminder } from '../../redux/actions/organizationActions';
import { connect } from 'react-redux';
import { ModalProcess } from '../../redux/actions/profileActions';
import { getPackagesP, generateTrialOrder } from '../../redux/actions/file-OActions';
const iG = { marginTop: '2px', width: '95%' };
const tS = { marginTop: '12px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const eS = { marginTop: '16px', marginBottom: '12px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };

const ModalB = ({ billingReminder, packages, getPackagesP, ModalProcess, onNext, generateTrialOrder }) => {

    const onhandleModal = () => {
        billingReminder(0);
    };

    const [pkg, setPkg] = useState(''), [pkgs, setPkgs] = useState([]), [pkgVal, setPKGV] = useState(0), [pkgErr, setPErr] = useState(false), [pkgSErr, setPSErr] = useState(false);

    useEffect(() => {
        getPackagesP({ size: 2 });
    }, [getPackagesP]);

    useEffect(() => {
        let pkges;
        if (packages && packages.length > 0) {
            pkges = packages.sort(function (a, b) {
                return a.size - b.size;
            });
        }
        if (pkges && pkges.length > 0) {
            setPKGV(pkges[0].size);
            setPkg(pkges[0]);
        }
        setPkgs(pkges);
    }, [packages]);

    const submitForm = async () => {
        let data = { pkgId: pkg._id, price: (Number(pkg ? pkg.price : 0)) + (1 * 275) };
        if (pkg && pkg._id && pkg.size > 2) {
            let orderId = await generateTrialOrder(data);
            onhandleModal();
            if (orderId) onNext(orderId);

        }
        else ModalProcess({ title: 'Storage', text: 'You have selected the plan which is your current active plan.', isErr: true });
    };

    const onhandlePKG = e => {
        setPKGV(e.target.value);
        if (e.target.value % 5 === 0 && pkgErr) setPErr(false);
        else if (e.target.value % 5 !== 0 && !pkgErr) setPErr(true);

        let tempP = pkgs, isBool = false;
        if (e.target.value > 2) {
            setPSErr(false);
            if (tempP && tempP.length > 0 && e.target.value % 5 === 0) {
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


    return <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => { e.preventDefault(); submitForm(); }}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Choose Your Plan</h3>
            <hr />
            <div className="col-12" style={{ padding: '6px 24px' }}>
                <h6 style={tS}>STORAGE SIZE</h6>
                <div className="input-group" style={iG}>
                    <input type={'number'} min={0} max={100} step={5} className="form-control" placeholder={'Enter package'} value={pkgVal} onChange={e => onhandlePKG(e)} />
                    <div class="input-group-append">
                        <span class="input-group-text">GB</span>
                    </div>
                </div>
                {!pkgSErr && pkgErr && <div style={eS}>The package size should be a multiple of 5 e.g 5, 10, 15...upto 100.</div>}
                {pkgSErr && <div style={eS}>The package size should be greater than the current plan.</div>}
                <h6 style={tS}>PRICE</h6>
                <h6 style={{ fontSize: '16px', color: 'green', fontWeight: '500', width: '90%' }}>
                    PKR {(Number(pkg ? pkg.price : 0)) + (1 * 275)}
                </h6>
            </div>
            <hr />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '12px 18px', marginTop: '12px' }}>
                <button className="btn btn-danger" type="button" onClick={e => billingReminder(0)}
                    style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>Dismiss</button>
                <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>Pay Now</button>
            </div>
        </form>
    </Modal>
};

const mapStateToProps = state => {
    return {
        packages: state.Package.packages,
    }
};

export default connect(mapStateToProps, { billingReminder, getPackagesP, ModalProcess, generateTrialOrder })(ModalB);
