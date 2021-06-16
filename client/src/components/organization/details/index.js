import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import '../style.css';
import '../strStyle.css';
import { connect } from 'react-redux';
import Tabnav from '../../tabnav';
import { billingReminder, downgradePackage, generateOrderUpt, updateOrganization, getLowerPackageCount } from '../../../redux/actions/organizationActions';
import ModalStorage from '../modelStorage';
import ModalStorageD from '../modelStorageD';
import More from '../../../assets/more.svg';
import BInfo from '../../../assets/tabnav/B-information.svg';
import GInfo from '../../../assets/tabnav/G-information.svg';
import BPlan from '../../../assets/tabnav/B-Plan.svg';
import GPlan from '../../../assets/tabnav/G-Plan.svg';
import { ModalProcess } from '../../../redux/actions/profileActions';
import EasyPaisa from '../../../components/modals/easyPaisa';
import SelectTypeE from '../../../components/modals/selectTypeE';

const OText = lazy(() => import('../../edits/editText'));
const OTextArea = lazy(() => import('../../edits/editTextArea'));
const OImage = lazy(() => import('../../edits/editImage'));
const Storage = lazy(() => import('./storage'));
const t = { textAlign: 'right' };

let icons = [
    { G: GInfo, B: BInfo },
    { G: GPlan, B: BPlan },
    { G: GPlan, B: BPlan }
];

const Details = ({ setting, Org, tabNav, setTN, downgradePackage, ModalProcess, generateOrderUpt, billingReminder, getLowerPackageCount }) => {
    const [modal, setModal] = useState(false), [active, setAct] = useState(false), [down, setDown] = useState(false);

    const {
        _id, name, email, contact, address, data_uploaded, combined_plan,
        bucketSize, available, active_plan, logo, countryCode, last_upgraded,
        last_bill, isTrail
    } = Org;

    const node = useRef({});

    useEffect(() => {

        const handleClick = e => {
            if (tabNav === 1 && node && node.current && !node.current.contains(e.target)) {
                setAct(false);
            }
        };
        document.addEventListener('mousedown', handleClick, true);
    }, [tabNav]);



    const [num, setNum] = useState(0);

    const [oId, setOId] = useState(''), [type, setType] = useState('');


    const generateOrder = async (data) => {
        let order = await generateOrderUpt(data);

        if (order) {
            setOId(order);
        }
        setModal(false);
    };

    const onhandleModal = mv => setNum(mv);


    let org = Org;

    let percent = 0;

    if (combined_plan && data_uploaded) {
        percent = (Number(data_uploaded) * 100) / Number(combined_plan);
    }

    let data = {
        labels: ['Free Space', 'Used Space'],
        datasets: [{ data: [((combined_plan - bucketSize) > 0 ? (combined_plan - bucketSize) : 0).toFixed(4), bucketSize.toFixed(4)], backgroundColor: ['#40739e', '#e1b12c'], hoverBackgroundColor: ['#487eb0', '#fbc531'] }]
    };


    return <div className="col-11 o-w p-0">
        <h4 className="h">Organization</h4>
        <Tabnav items={['Information', 'Plan']} i={tabNav} setI={setTN} icons={icons} />
        {tabNav === 0 && <Suspense fallback={<></>}>
            <OImage name={'image'} head={'Company Logo'} modal={num === 1 ? true : false} num={1} imgSize={setting && setting.maxImageSize ? setting.maxImageSize : 1} handleModal={onhandleModal} val={logo} refAct='organization' id={_id} />
            <OText name={'name'} notEdit={true} head={'Name'} val={name} title={'NAME'} modal={num === 2 ? true : false} num={2} handleModal={onhandleModal} type={'text'} refAct='organization' id={_id} />
            <OText name={'email'} head={'Email'} val={email} title={'EMAIL'} modal={num === 3 ? true : false} num={3} handleModal={onhandleModal} type={'text'} refAct='organization' id={_id} />
            <OText name={'contact'} notEdit={true} head={'Contact Number'} code={countryCode} val={contact} title={'CONTACT NUMBER'} modal={num === 4 ? true : false} num={4} handleModal={onhandleModal} type={'text'} refAct='organization' id={_id} />
            <OTextArea skip={true} name={'address'} head={'Address'} val={address} title={'ADDRESS'} modal={num === 5 ? true : false} num={5} handleModal={onhandleModal} type={'text'} refAct='organization' id={_id} />
        </Suspense>}
        {tabNav === 1 && <>
            <div className="oI">
                <h6 className="dyna mr-auto">Active Plan</h6>
                <h6 className="static" style={t}>{active_plan && active_plan.name ? active_plan.name : 'None'}</h6>
            </div>
            <div className="str-dsh">
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <h6 style={{ fontSize: '18px', color: 'grey', fontWeight: '500', marginRight: '12px' }}>Overall Storage:</h6>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h6 style={{ fontSize: '14px', color: 'grey' }}>{bucketSize ? bucketSize.toFixed(2) : 0} GB / {combined_plan ? combined_plan.toFixed(2) : 0} GB</h6>
                        <div className="progress" style={{ height: '6px', width: '100%' }}>
                            <div className="progress-bar" role="progressbar" style={{ width: `${percent}%` }} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}></div>
                        </div>
                    </div>
                </div>
                <h6 className="mtS" style={{ fontSize: '16px', color: 'grey', fontWeight: '400' }}>{Math.floor(percent)}% Used</h6>

                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <button className="btn btn-str mtS" type="button" onClick={e => !isTrail ? setModal(true) : billingReminder(2)}>Upgrade Storage</button>
                    <h6 className={`order`} style={{ position: 'relative', marginTop: '0px', marginBottom: '0px', marginLeft: '12px' }} onClick={e => setAct(!active)}>
                        <div style={{ width: '14px', height: '14px', backgroundImage: `url('${More}')` }} />
                        <div className="dropdown-content-c" ref={node} style={{ display: `${active ? 'flex' : 'none'}`, height:'fit-content' }}>
                            <h6 className='s-l' onClick={async e => {
                                if (!isTrail) {
                                    setAct(false);
                                    if (await getLowerPackageCount({ lowerSize: data_uploaded, upperSize: combined_plan })) {
                                        setDown(true);
                                    } else {
                                        ModalProcess({ title: 'Downgrade Storage', text: 'Please free up space before downgrading storage.', isErr: true });
                                    }
                                } else ModalProcess({ title: 'Trial Account', text: 'Please upgrade your account to paid version.', isErr: true });
                            }}>Downgrade Plan</h6>
                        </div>
                    </h6>
                </div>
            </div>

            {modal && <ModalStorage data_uploaded={data_uploaded} active_plan={active_plan} last_upgraded={last_upgraded}
                combined_plan={combined_plan} available={available} percent={percent} org={org && org._id}
                onhandleModal={e => {
                    setModal(false);
                }} submitData={(data, pkg) => {
                    generateOrder(data);
                }} />}

            {down && <ModalStorageD data_uploaded={data_uploaded} active_plan={active_plan} last_upgraded={last_upgraded}
                combined_plan={combined_plan} available={available} last_bill={last_bill} percent={percent} org={org && org._id}
                onhandleModal={e => {
                    setDown(false);
                }} submitData={async (data, pkg) => {
                    setDown(false);
                    await downgradePackage(data);
                    ModalProcess({ title: 'Storage', text: `Your storage has been downgraded. RS ${Number(active_plan.price) - Number(pkg.price)} will be adjusted in next billing cycle.` });
                }} />}

            {active_plan && active_plan.name && <Suspense fallback={<></>}>
                <Storage data={data} />
            </Suspense>}

            {oId && !type && <SelectTypeE onhandleModal={e => {
                setOId('');
            }} onNext={item => {
                setType(item === 1 ? 'MA_PAYMENT_METHOD' : 'CC_PAYMENT_METHOD');
            }} />}
            {oId && type && <EasyPaisa onHandleModal={e => {
                setType('');
                setOId('');
            }} order={oId} type={type} />}

        </>}

    </div>
}

export default connect(null, { updateOrganization, downgradePackage, ModalProcess, generateOrderUpt, billingReminder, getLowerPackageCount })(Details);