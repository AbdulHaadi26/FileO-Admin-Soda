import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { fetchEmp, fetchEmpSearch, generateOrderEmp } from '../../../redux/actions/employeeActions';
import '../style.css';
import More from '../../../assets/elpW.svg';
import Tabnav from '../../tabnav';
import history from '../../../utils/history';
import BEmp from '../../../assets/tabnav/B-user.svg';
import GEmp from '../../../assets/tabnav/G-user.svg';
import EasyPaisa from '../../../components/modals/easyPaisa';
import SelectTypeE from '../../../components/modals/selectTypeE';
import ModalAdd from './addUser';
import ModalDown from './removeUser';
import Confirmation from './confirmation';
import { downgradeUser } from '../../../redux/actions/organizationActions';
import { ModalProcess } from '../../../redux/actions/profileActions';
import Searchbar from '../../searchbarReusable';

const Storage = lazy(() => import('./storage'));
const List = lazy(() => import('./item'));

let icons = [{ G: GEmp, B: BEmp }];

const ListUser = ({
    fetchEmp, fetchEmpSearch, id, empData, isSuc, type, string, tabNav, setTN,
    offsetMult, limit, limitMult, handleS, handleL, handleLM, handleOFM, handleT,
    disabled, generateOrderEmp, Organization, downgradeUser, ModalProcess
}) => {

    const node = useRef({}), [active, setAct] = useState(false), [oId, setOId] = useState(''), [typeE, setTypeE] = useState(''), [modal, setModaL] = useState(false),
        [modalD, setModaLD] = useState(false), [modalC, setModaLC] = useState(false);

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setAct(false);
        }
    };

    const generateOrder = async (data) => {
        let order = await generateOrderEmp(data);
        order && setOId(order);
        setModaL(false);
    };

    const handleSearch = e => {
        e.preventDefault();
        let data = { offset: 0, limit: 0, string: string, _id: id, type: type.toLowerCase() };
        handleL(12); handleOFM(0); handleLM(0);
        string ? fetchEmpSearch(data) : fetchEmp(data);
    };

    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            let data = { limit: limitMult + i, offset: offsetMult + 1, string: string, _id: id, type: type.toLowerCase() };
            let upgradeLimit = limit + j;
            handleL(upgradeLimit); handleOFM(data.offset); handleLM(data.limit);
            string ? fetchEmpSearch(data) : fetchEmp(data);
        }
    };

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    };

    var count = 0;
    var list = [];

    let userCount = 0, data, addCount = 0;

    if (empData && empData.data) {
        count = empData.count;
        list = empData.data;
        addCount = empData.totalCount;
    };


    if (Organization && Organization.org) {
        userCount = Organization.org.userCount;

        data = {
            labels: ['Paid User', 'Added User'],
            datasets: [{ data: [userCount - addCount, addCount], backgroundColor: ['#40739e', '#e1b12c'], hoverBackgroundColor: ['#487eb0', '#fbc531'] }]
        };
    }

    return <div className="col-11 e-w p-0">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">User</h4>
            <div style={{ marginLeft: 'auto' }} />
            <Searchbar isCreate={true} classN={true ? `col-lg-7 col-12` : 'col-lg-4 col-12'} pad={true} value={string} onHandleInput={val => handleS(val)}
                callFunc={e => {
                    if (addCount < userCount) {
                        !disabled && history.push(`/organization/${id}/employee/add`);
                    } else if (Organization && Organization.org && Organization.org.isTrail) {
                        ModalProcess({ title: 'Trial Account', text: 'Please upgrade your account to paid version.', isErr: true });
                    } else {
                        setModaL(true);
                    }
                }} isElp={true} callSub={e => setAct(!active)}
                holder={'Enter text here'} handleSearch={e => handleSearch(e)} comp={<>
                    <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                    <select className="custom-select col-3" onChange={e => handleSelect(e)} value={type}>
                        <option data-key={'Name'}>Name</option>
                        <option data-key={'Email'}>Email</option>
                    </select>
                </>}>
                <h6 className={`mTHS`} style={{ padding: '10px 8px 6px 8px', position: 'relative', marginTop: '0px', marginBottom: '0px', marginRight: '-3px' }}>
                    <div className="more" onClick={e => setAct(true)} style={{ width: '14px', height: '14px', marginRight: '-3px', backgroundImage: `url('${More}')`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
                    <div className="dropdown-content-c" ref={node} style={{ display: `${active ? 'flex' : 'none'}` }}>
                    <h6 className='s-l' onClick={e => {
                        if (Organization && Organization.org && !Organization.org.isTrail) {
                            setAct(false);
                            if (addCount < userCount) {
                                setModaLC(true);
                            } else {
                                setModaL(true);
                            }


                        } else {
                            ModalProcess({ title: 'Trial Account', text: 'Please upgrade your account to paid version.', isErr: true });
                        }
                    }}>Upgrade Users</h6>
                    <h6 className='s-l' onClick={e => {
                        if (Organization && Organization.org && !Organization.org.isTrail) {
                            setAct(false);
                            if (addCount < userCount) {
                                setModaLD(true);
                            } else {
                                ModalProcess({ title: 'Downgrade User', text: 'Please free/delete users before downgrading.', isErr: true });
                            }

                        } else {
                            ModalProcess({ title: 'Trial Account', text: 'Please upgrade your account to paid version.', isErr: true });
                        }
                    }}>Downgrade Users</h6>
                    </div>
                </h6>
            </Searchbar>
        </div>
        <Tabnav items={['Users']} i={tabNav} setI={setTN} icons={icons} />

        {modalC && <Confirmation count={(userCount ? userCount : 0) - (addCount ? addCount : 0)} onhandleModal={e => setModaLC(false)} onNext={count => setModaL(true)} />}
        {modal && <ModalAdd count={addCount} onhandleModal={e => setModaL(false)} onNext={count => generateOrder({ count, price: count * 275 })} />}
        {modalD && <ModalDown count={addCount} onhandleModal={e => setModaLD(false)} addCount={addCount} userCount={userCount} onNext={async count => {
            await downgradeUser({
                _id: id,
                field: 'downgrade',
                value: count
            });

            setModaLD(false);
        }} />}
        {oId && !typeE && <SelectTypeE onhandleModal={e => {
            setOId('');
        }} onNext={item => {
            setTypeE(item === 1 ? 'MA_PAYMENT_METHOD' : 'CC_PAYMENT_METHOD');
        }} />}

        {oId && typeE && <EasyPaisa onHandleModal={e => {
            setTypeE('');
            setOId('');
        }} order={oId} type={typeE} />}

        <div className="col-12" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            <div className="col-lg-5 col-12">
                {isSuc && list.length > 0 && count > 0 ? <Suspense fallback={<></>}> <List disabled={disabled} list={list} count={count} id={id} onFetch={fetch} /> </Suspense> : <div width="100%"> <h6 className="e-n" width="100%" style={{ textAlign: 'center', marginTop: '50px' }}>No user found</h6> </div>}
            </div>
            <div className="col-lg-1 col-12 hide" style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '2px', height: '80%', backgroundColor: '#dfe6e9' }}></div>
            </div>
            <div className="col-lg-5 col-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {userCount && <Suspense fallback={<></>}>
                    <Storage data={data} />
                </Suspense>}
                <div style={{ width: '100%', marginTop: '12px', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <div className="col-lg-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'gray' }}>{addCount} Users</h4>
                        <h6 style={{ fontSize: '12px', fontWeight: '500', color: 'gray' }}>Added Users</h6>
                    </div>
                    <div className="col-1 hide" style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ width: '2px', height: '80%', backgroundColor: '#dfe6e9' }}></div>
                    </div>
                    <div className="col-lg-5">
                        <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'gray' }}>{userCount} Users</h4>
                        <h6 style={{ fontSize: '12px', fontWeight: '500', color: 'gray' }}>Paid Users</h6>
                    </div>
                </div>
            </div>
        </div>

    </div>
}

const mapStateToProps = state => {
    return {
        empData: state.Employee.list,
        isErr: state.Employee.isErr,
        isSuc: state.Employee.isSuc,
        Organization: state.Organization.data
    }
};

export default connect(mapStateToProps, { fetchEmp, fetchEmpSearch, generateOrderEmp, downgradeUser, ModalProcess })(ListUser);