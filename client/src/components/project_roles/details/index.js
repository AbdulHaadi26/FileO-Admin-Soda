import React, { lazy, Suspense, useState, useEffect } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { updateRoleCat } from '../../../redux/actions/project_rolesAction';
import Cross from '../../../assets/cross.svg';
import Plus from '../../../assets/plus.svg';
import Tabnav from '../../tabnav';
const RoleText = lazy(() => import('../../project_edits/editText'));
const RoleTextA = lazy(() => import('../../project_edits/editTextArea'));
const ModalDelete = lazy(() => import('../modeDel'));
const pS = { marginTop: '20px', marginLeft: '12px', fontSize: '12px' };
const dS = { paddingLeft: '6px', paddingTop: '10px', paddingBottom: '10px', width: '95%', display: 'flex', flexDirection: 'row', alignItems: 'center' };
const hS = { fontWeight: '400', fontSize: '14px', marginTop: '4px' };
const mT = { marginTop: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'row' };
const fS = { width: '90%', marginTop: '20px' };
const bS = { marginTop: '16px', alignSelf: 'right' };
const daS = { marginTop: '20px', marginLeft: '10px', width: 'fit-content' };
const fW = { fontWeight: '700' };
const tM = { width: '12px', height: '12px', marginLeft: '12px', cursor: 'pointer', backgroundImage: `url('${Cross}')` };

const Details = ({ Role, updateRoleCat, tabNav, setTaN }) => {
    const { _id, name, org, description } = Role.role;
    const [rList, setRL] = useState([]), [tempId, setTI] = useState(''), [tempName, setTN] = useState(''), [selectList, setSL] = useState([]), [pId, setPID] = useState(''), [num, setNum] = useState(0),
        [modalDel, setMD] = useState(false);

    useEffect(() => {
        var tempList = [];
        tempList = Role.catList;
        if (Role.role.category && Role.role.category.length > 0) {
            tempList = tempList.filter(item => !Role.role.category.some(obj => item._id === obj._id));
        }
        setRL(Role.role.category && Role.role.category.length > 0 ? Role.role.category : []); setSL(tempList);
        setPID(Role.role.pId);
        if (tempList.length > 0) {
            setTI(tempList[0]._id); setTN(tempList[0].name);
        }
    }, [Role])

    const handleModalDel = (e, val) => setMD(val);
    const onhandleModal = mV => setNum(mV);

    const handleUpdateCat = e => {
        e.preventDefault();
        var listId = [];
        rList.map(item => listId.push(item._id));
        var data = { list: listId, _id: _id, org: org, pId: pId };
        updateRoleCat(data);
    }

    const renderOwnList = () => rList.length > 0 && rList.map(item => <div style={dS} key={item._id}>
        <h6 style={hS} >{item.name}</h6>
        <div onClick={e => handleCancel(item.name, item._id)} style={tM} />
    </div>);

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) {
            setTI(e.target.options[selectedIndex].getAttribute('data-key'));
            setTN(e.target.options[selectedIndex].getAttribute('data-name'));
        }
    }

    const handleCancel = (name, _id) => {
        if (_id) {
            var tempRName = rList;
            tempRName = tempRName.filter(item => item.name !== name);
            var tempAdd = selectList;
            tempAdd.push({ _id: _id, name: name });
            setRL(tempRName); setSL(tempAdd); setTI(tempAdd[0]._id); setTN(tempAdd[0].name);
        }
    }

    const handleAdd = () => {
        if (tempId && tempName) {
            var Lname = rList;
            Lname.push({ _id: tempId, name: tempName });
            var tempR = selectList;
            tempR = tempR.filter(item => item._id !== tempId);
            setRL(Lname); setSL(tempR);
            if (tempR.length > 0) {
                setTI(tempR[0]._id); setTN(tempR[0].name);
            } else {
                setTI(''); setTN('');
            }
        }
    }

    const renderList = rList => rList.map(item => <option key={item._id} data-key={item._id} data-name={item.name}>{item.name}</option>);

    return <div className="col-11 r-w p-0">
        <h4 className="h">{name ? name : ''}</h4>
        <Tabnav items={['Details', 'Folders']} i={tabNav} setI={setTaN} />
        {tabNav === 0 && <>
            <Suspense fallback={<></>}><RoleText name={'name'} head={'Name'} val={name} title={'NAME'} modal={num === 1 ? true : false} num={1} handleModal={onhandleModal} type={'text'} refAct='role' id={_id} org={org} pId={pId} /></Suspense>
            <Suspense fallback={<></>}><RoleTextA name={'description'} head={'Description'} val={description} title={'DESCRIPTION'} skip={true}
                modal={num === 2 ? true : false} num={2} handleModal={onhandleModal} type={'text'} refAct='role' id={_id} org={org} pId={pId} /></Suspense>

            <button className="btn btn-danger" style={daS} onClick={e => setMD(true)}>Delete Role</button>
            <p style={pS}><b style={fW}>Note: </b>This action will only delete role if no employee is assigned to the role.</p>
        </>}
        {tabNav === 1 && <>
            <div style={mT}>
                <select style={fS} className="form-control" onChange={e => handleSelect(e)}>
                    {selectList && selectList.length > 0 && renderList(selectList)}
                </select>
                <div className="btnAddRole" style={{ marginTop: '20px' }} onClick={e => handleAdd()}><div style={{ backgroundImage: `url('${Plus}')`, width: '16px', height: '16px' }} /></div>
            </div>
            {renderOwnList()}
            <div className="col-12 p-0 permBtn">
                <button className="btn btn-primary" style={bS} onClick={e => handleUpdateCat(e)}>Update Folders</button>
            </div>
        </>}
        {modalDel && <Suspense fallback={<></>}><ModalDelete pId={pId} id={_id} onhandleModalDel={handleModalDel} /></Suspense>}
    </div>
}

export default connect(null, { updateRoleCat })(Details);