import React from 'react';
import Modal from '../containers/modalBgContainer';
import Logo from '../../assets/logo.svg';
import history from '../../utils/history';
import { billingReminder } from '../../redux/actions/organizationActions';
import { connect } from 'react-redux';

const ModalB = ({ billingReminder, profile, type }) => {

    const onhandleModal = () => {
        billingReminder(0);
    };

    let daysLeft = 0, date;

    if (profile.trail_end_date && profile.isTrail) {
        let date1 = new Date(profile.trail_end_date);
        let date2 = new Date(Date.now());

        date = date1;

        let Difference_In_Time = date1.getTime() - date2.getTime();
        let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);


        daysLeft = Math.floor(Difference_In_Days);
        daysLeft = daysLeft < 0 ? 0 : Math.floor(Difference_In_Days);
    };


    return daysLeft <= 7 ? <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => {
            e.preventDefault();
            billingReminder(2)
        }}>
            <div style={{ display: 'flex', flexDirection: 'row', padding: '6px 24px', marginTop: '12px' }}>
                <img src={Logo} alt="File Logo" onClick={e => history.push(`/home`)} style={{ cursor: 'pointer', width: '60px', height: '60px' }} />
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', marginLeft: '12px', marginBottom: '-16px' }}>
                    <h1 onClick={e => history.push(`/home`)} style={{ cursor: 'pointer', marginTop: '8px', letterSpacing: '3px', color: '#2f3542', fontWeight: '700', fontSize: '24px' }} >File-O</h1>
                    <p style={{ fontSize: '11px' }}>Workspace Collaboration {'&'} File Sharing</p>
                </div>
            </div>
            <div className="col-12" style={{ padding: '6px 24px', display: 'flex', flexDirection: 'row', marginTop: '24px', alignItems: 'center' }}>
                <div className="col-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '80%', height: '24px', backgroundColor: 'red', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', boxShadow: `0px 1px 3px 0px rgba(0, 0, 0, 0.13)` }}></div>
                    <div style={{
                        width: '80%', backgroundColor: '#ecf0f1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        , borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', boxShadow: `0px 1px 3px 0px rgba(0, 0, 0, 0.23)`
                    }}>
                        <h6 style={{ fontSize: '32px', fontWeight: '700', marginTop: '12px' }}>{daysLeft}</h6>
                        <h6 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px' }}>Days</h6>
                    </div>
                    <h6 style={{ fontSize: '14px', fontWeight: '500', marginTop: '12px' }}>left in Free Trial</h6>
                </div>
                <div className="col-8" style={{ display: 'flex', flexDirection: 'column' }}>
                    {date && <h6 style={{ fontSize: '16px', fontWeight: '600' }}>Your Free Trial period of File-O will end on {date.toUTCString().substr(0, 17)}.</h6>}
                    <h6 style={{ fontSize: '14px', fontWeight: '400', marginTop: '12px' }}>To continue using File-O please use a subscription plan.</h6>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: '#ecf0f1', justifyContent: 'flex-end', padding: '12px 18px', marginTop: '12px' }}>
                <button className="btn btn-danger" type="button" onClick={e => billingReminder(0)}
                    style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>Dismiss</button>
                <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>Choose Plan</button>
            </div>
        </form>
    </Modal> : <></>
};

export default connect(null, { billingReminder })(ModalB);
