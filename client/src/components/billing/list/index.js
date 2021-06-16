import React, { useEffect, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import Tabnav from '../../tabnav';
import ListItems from './item';
import GBill from '../../../assets/tabnav/G-PaidBill.svg';
import BBill from '../../../assets/tabnav/B-PaidBill.svg';
import GPBill from '../../../assets/tabnav/G-UnpaidBill.svg';
import BPBill from '../../../assets/tabnav/B-UnpaidBill.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import EasyPaisa from '../../../components/modals/easyPaisa';
import SelectTypeE from '../../../components/modals/selectTypeE';
import ViewBill from '../modals/viewBill';
import history from '../../../utils/history';

let icons = [{ G: GBill, B: BBill }, { G: GPBill, B: BPBill }, { G: GPBill, B: BPBill }];

const dF = {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '12px',
    width: '100%',
    flexWrap: 'wrap'
};

const eS = {
    textAlign: 'center',
    marginTop: '50px'
};

const List = ({
    list, tabNav, org, setTN, Organization
}) => {
    const [ord, setO] = useState(0), [oId, setOId] = useState(''), [type, setType] = useState(''), [bill, setBill] = useState(false);


    const [width, setWidth] = useState(0);

    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    });

    const updateWindowDimensions = () => setWidth(window.innerWidth);


    const setTNB = (n) => {
        history.push(`/organization/${org}/bill/list/page/${n}`);
        setTN(n)
    };

    return <div className="col-11 p-w p-0">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">Billing</h4>
            <div style={{ marginLeft: 'auto' }} />
            <div className={`order ${ord < 2 ? 'orderA' : ''}`} style={{ marginLeft: '12px', marginTop: '0px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                <img src={ord === 1 ? CalAsc : CalDes} alt="Icon" style={{ width: '100%', marginTop: '0px' }} />
                <span className="tooltip">Sort By Date</span>
            </div>
        </div>
        <Tabnav items={['UnPaid Bills', 'Paid Bills']} i={tabNav} setI={setTNB} icons={icons} />

        <div style={dF}>
            {list && list.length > 0 && <ListItems ord={ord} list={list} setOId={setOId} setB={setBill} />}
        </div>

        {(!list || list.length <= 0) && <div><h6 className="str-n" style={eS}>No bill found</h6></div>}
        {oId && !type && <SelectTypeE onhandleModal={e => {
            setOId('');
        }} onNext={item => {
            setType(item === 1 ? 'MA_PAYMENT_METHOD' : 'CC_PAYMENT_METHOD');
        }} />}
        {oId && type && <EasyPaisa onHandleModal={e => {
            setType('');
            setOId('');
        }} order={oId} type={type} />}

        {bill && Organization && <ViewBill setOId={setOId} width={width} onhandleModal={e => setBill(false)} Bill={bill} organization={Organization && Organization.org}  />}
    </div>
}

const mapStateToProps = state => {
    return {
        list: state.Bill.list,
        Organization: state.Organization.data
    }
};

export default connect(mapStateToProps)(List);