import React, { lazy, Suspense, useEffect, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { updateEmpRole, updateEmpProfile } from '../../../redux/actions/employeeActions';
import Plus from '../../../assets/plus.svg';
import Cross from '../../../assets/cross.svg';
import Tabnav from '../../tabnav';
import Popover from '../../popover';
const Storage = lazy(() => import('./UserStorage'));
const ModalDelete = lazy(() => import('../modeDel'));
const ModelPro = lazy(() => import('../modelPro'));
const EText = lazy(() => import('../../edits/editText'));
const EImage = lazy(() => import('../../edits/editImage'));
const EPass = lazy(() => import('../../edits/editPasswordSingle'));
const CheckBox = lazy(() => import('./cb'));
const dS = { marginTop: '20px', marginLeft: '10px', width: 'fit-content' };
const pS = { marginTop: '20px', marginLeft: '10px', fontSize: '12px' };
const fW = { fontWeight: '700' };
const sS = { width: '90%', marginTop: '20px', marginLeft: '6px' };
const bS = { marginTop: '36px', alignSelf: 'right' };
const h6S = { fontWeight: '400', fontSize: '14px' };
const diS = { marginBottom: '20px', display: 'flex', flexDirection: 'row', marginTop: '12px' };
const tM = { width: '16px', height: '16px', cursor: 'pointer', backgroundImage: `url('${Cross}')` };
const dS2 = { paddingLeft: '6px', paddingTop: '10px', paddingBottom: '10px', width: '95%', display: 'flex', flexDirection: 'row', alignItems: 'center' };

const Details = ({ org, setting, Emp, updateEmpProfile, updateEmpRole, Org, tabNav, setTaN }) => {
    const { settingsId, combined_plan } = Org.org;
    const { name, email, image, _id, roles, active, storageLimit, userType, clientView, storageUploaded } = Emp.user;
    const [num, setNum] = useState(0), [sA, setSA] = useState(false), [uT, setUT] = useState(0), [tN, setTN] = useState('User'),
        [modalDel, setMD] = useState(false), [storage, setST] = useState(1), [listName, setLN] = useState([]), [listIds, setLId] = useState([]), [rList, setRL] = useState([]),
        [tempId, setTId] = useState(''), [tempName, setTPN] = useState(''), [modalPro, setModP] = useState(false);

    var pkgs = settingsId && settingsId.packages && settingsId.packages.length > 0 ? settingsId.packages : [1, 2, 3, 4, 5];

    if (pkgs && pkgs.length > 0) {
        pkgs = pkgs.filter(i => i < combined_plan);
    };

    useEffect(() => {
        setST(storageLimit ? storageLimit : settingsId && settingsId.packages && settingsId.packages.length > 0 ? settingsId.packages[0] : 1); setUT(userType); setTN(userType === 1 ? 'Project Manager' : userType === 2 ? 'Administrator' : 'User');
        var list = Emp.roleList;
        list = list && list.length > 0 && list.filter(item => !roles.some(obj => item._id === obj._id));
        var ids = [];
        roles && roles.length > 0 && roles.map(item => ids.push(item._id));
        if (list && list.length > 0) {
            setRL(list);
            setTId(list[0]._id);
            setTPN(list[0].name);
        } else { setRL([]); setTId(''); setTPN(''); }
        setLN(roles ? roles : []); setLId(ids);
    }, [Emp, setSA, setST, storageLimit, roles, userType, settingsId]);

    let percent = 0;

    if (storageLimit && storageUploaded) {
        percent = (Number(storageUploaded) * 100) / Number(storageLimit);
    }

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) {
            setTId(e.target.options[selectedIndex].getAttribute('data-key'));
            setTPN(e.target.options[selectedIndex].getAttribute('data-name'));
        }
    }

    const handleSelectGB = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && setST(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const handleModalDel = (e, val) => setMD(val);
    const handleModalPro = (e, val) => setModP(val);

    const handlePerm = e => {
        e.preventDefault();
        let data = { _id: _id, ids: listIds, org: org };
        updateEmpRole(data);
    }

    const onhandleModal = val => setNum(val);

    const onhandleSt = e => {
        let data = { field: 'storage', value: storage, _id: _id, org: org };
        updateEmpProfile(data);
    }

    const renderList = () => pkgs.map(item => <option key={item} data-key={item}>{item} GB</option>);

    const renderDelete = () => !sA && <>
        <button className="btn btn-danger" style={dS} onClick={e => setMD(true)}>Delete User</button>
        <p style={pS}><b style={fW}>Note: </b>This action will delete delete profile and login details.</p>
    </>

    const handleUptT = e => {
        e.preventDefault();
        let data = { _id: _id, field: 'userT', org: org, value: uT };
        if (userType === 1) {
            setModP(true);
        } else {
            updateEmpProfile(data);
        }
    }

    const updateUserType = e => {
        e.preventDefault();
        let data = { _id: _id, field: 'userT', org: org, value: uT };
        setModP(false);
        updateEmpProfile(data);
    }

    const renderTypes = () => ['User', 'Project Manager', 'Administrator'].map((i, k) => <option key={k} data-name={i} data-key={k}>{i}</option>);

    const handleSelectT = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) { setUT(e.target.options[selectedIndex].getAttribute('data-key')); setTN(e.target.options[selectedIndex].getAttribute('data-name')); }
    }

    const handleCB = () => {
        var data = { field: 'active', value: !active, _id: _id, org: org };
        updateEmpProfile(data);
    }

    const handleCBC = () => {
        var data = { field: 'clientView', value: !clientView, _id: _id, org: org };
        updateEmpProfile(data);
    }

    const handleCancel = (name, _id) => {
        if (_id) {
            var tempRId = listIds;
            tempRId = tempRId.filter(item => item !== _id);
            var tempRName = listName;
            tempRName = tempRName.filter(item => item.name !== name);
            var tempAdd = rList;
            tempAdd.push({ _id: _id, name: name });
            setLId(tempRId); setLN(tempRName); setTId(tempAdd[0]._id); setTPN(tempAdd[0].name);
        }
    }

    const handleAdd = () => {
        if (tempId && tempName) {
            var Lid = listIds;
            Lid.push(tempId);
            var Lname = listName;
            Lname.push({ _id: tempId, name: tempName });
            var tempR = rList;
            tempR = tempR.filter(item => item._id !== tempId);
            setLId(Lid); setLN(Lname); setRL(tempR);
            if (tempR.length > 0) {
                setTId(tempR[0]._id); setTPN(tempR[0].name);
            } else {
                setTId(''); setTPN('');
            }
        }
    }

    const renderOwnList = () => listName.length > 0 && listName.map(item => <div style={dS2} key={item._id}>
        <h6 className="mr-auto" style={h6S} >{item.name}</h6>
        <div onClick={e => handleCancel(item.name, item._id)} style={tM} />
    </div>);

    const renderRList = rList => rList.map(item => <option key={item._id} data-key={item._id} data-name={item.name}>{item.name}</option>);

    return <div className="col-11 e-w p-0">
        <h4 className="h">User</h4>
        <Tabnav items={['Details', 'Permissions', 'Access', 'Roles', 'Storage']} i={tabNav} setI={setTaN} />
        {tabNav === 0 && <Suspense fallback={<></>}>
            <EImage name={'image'} head={'Photo'} modal={num === 1 ? true : false} num={1} imgSize={setting && setting.maxImageSize ? setting.maxImageSize : 1} handleModal={onhandleModal} val={image} refAct='employee' id={_id} />
            <EText name={'name'} head={'Name'} val={name} title={'NAME'} modal={num === 2 ? true : false} num={2} handleModal={onhandleModal} type={'text'} refAct='employee' id={_id} org={org} />
            <EText name={'email'} head={'Email'} val={email} title={'EMAIL'} modal={num === 3 ? true : false} num={3} handleModal={onhandleModal} type={'text'} refAct='employee' id={_id} org={org} />
            <EPass name={'password'} head={'Password'} val={''} title={'PASSWORD'} modal={num === 4 ? true : false} num={4} handleModal={onhandleModal} refAct='employee' id={_id} org={org} />
        </Suspense>}
        {tabNav === 1 && <Suspense fallback={<></>}>
            {Emp && Emp.user && Emp.user.userType < 2 ? <>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CheckBox val={active} id={'cbActive'} t={'Active'} eT={'This action will activate the user account. User will be able to sign in the system.'} onhandleCB={handleCB} />
                    <CheckBox val={clientView} id={'cbClient'} t={'Client View'} eT={'This action will enable/disable client view in the dashboard for the employee/Project Manager.'} url={`https://docs.file-o.com:4242/doc/topic/1/content/0`} onhandleCB={handleCBC} />
                    {renderDelete()}
                </div>
            </> : <h6 style={{ fontSize: '14px', fontWeight: '400', marginTop: '24px' }}>Permission denied.</h6>}
        </Suspense>}
        {tabNav === 2 && <>
            <div style={diS}>
                <select style={sS} className="form-control" onChange={e => handleSelectT(e)} value={tN}>
                    {renderTypes()}
                </select>
                <Popover text={'User Type gives the features that are available to a user depending on the type of user selected.'} sty={{ marginLeft: '6px', marginTop: '32px' }} url={`https://docs.file-o.com:4242/doc/topic/2/content/1`} />
            </div>
            <div className="col-12 p-0 permBtn">
                <button className="btn btn-primary" style={bS} onClick={e => handleUptT(e)}> Update Type</button>
            </div>
        </>}
        {tabNav === 3 && <>
            <div style={diS}>
                <select style={{ width: '90%' }} className="form-control" onChange={e => handleSelect(e)}>
                    {rList && rList.length > 0 && renderRList(rList)}
                </select>
                <div className="btnAddRole" onClick={e => handleAdd()}><div style={{ backgroundImage: `url('${Plus}')`, width: '16px', height: '16px' }} /></div>
            </div>
            {renderOwnList()}
            <div className="col-12 p-0 permBtn" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Popover text={'Roles are a method of providing service entitlements to persons within the organization.'} sty={{ marginRight: '6px', marginTop: '36px' }} url={`https://docs.file-o.com:4242/doc/topic/9/content/0`} />
                <button className="btn btn-primary" style={bS} onClick={e => handlePerm(e)}>Update Role</button>
            </div>
        </>}
        {tabNav === 4 && <>
            {Emp && Emp.user && Emp.user.userType <= 2 ? <>
                <div className="str-dsh" style={{ marginTop: '12px' }}>
                    <h6 style={{ fontSize: '18px', color: 'grey', fontWeight: '500' }}>Overall Storage:</h6>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h6 style={{ fontSize: '14px', color: 'grey' }}>{storageUploaded ? storageUploaded.toFixed(2) : 0} GB / {storageLimit ? storageLimit.toFixed(2) : 0} GB</h6>
                        <div className="progress" style={{ height: '6px', width: '100%' }}>
                            <div className="progress-bar" role="progressbar" style={{ width: `${percent}%` }} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}></div>
                        </div>
                    </div>
                    <h6 style={{ fontSize: '16px', color: 'grey', fontWeight: '400' }}>{Math.floor(percent)}% Used</h6>
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                    <div className="col-lg-6 p-0">
                        {Emp && Emp.user && <Storage storageAvailable={Emp.user.storageAvailable} storageUploaded={Emp.user.storageUploaded} />}
                    </div>
                    <div className="col-lg-6" style={{ margin: '12px 0px' }}>
                        <select style={sS} className="form-control" onChange={e => handleSelectGB(e)} value={`${storage} GB`}>
                            {renderList()}
                        </select>
                        <div className="col-12 p-0">
                            <button className="btn btn-primary" style={bS} onClick={e => onhandleSt(e)}> Update Storage</button>
                        </div>
                    </div>
                </div>
            </> : <h6 style={{ fontSize: '14px', fontWeight: '400', marginTop: '24px' }}>Storage cannot be assigned to Administrator.</h6>}
        </>}
        {modalDel && <Suspense fallback={<></>}><ModalDelete org={org} id={_id} onhandleModalDel={handleModalDel} /></Suspense>}
        {modalPro && <Suspense fallback={<></>}><ModelPro onhandleModalDel={handleModalPro} onHide={updateUserType} /></Suspense>}
    </div>
}

export default connect(null, { updateEmpRole, updateEmpProfile })(Details);