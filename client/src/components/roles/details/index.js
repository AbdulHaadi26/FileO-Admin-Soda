import React, { lazy, Suspense, useState, useEffect } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { updateRoleCat, updateRoleTag } from '../../../redux/actions/rolesAction';
import Cross from '../../../assets/cross.svg';
import Plus from '../../../assets/plus.svg';
import Tabnav from '../../tabnav';
const RoleText = lazy(() => import('../../edits/editText'));
const RoleTextA = lazy(() => import('../../edits/editTextArea'));
const ModalDelete = lazy(() => import('../modeDel'));
const ModalAttach = lazy(() => import('../modelAttach'));
const dS = { paddingLeft: '6px', paddingTop: '10px', paddingBottom: '10px', width: '95%', display: 'flex', flexDirection: 'row', alignItems: 'center' };
const hS = { fontWeight: '400', fontSize: '14px', marginTop: '4px' };
const rS = { marginTop: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'row' };
const daS = { marginTop: '20px', marginLeft: '10px' };
const pS = { marginTop: '20px', marginLeft: '12px', fontSize: '12px' };
const tM = { width: '12px', height: '12px', marginLeft: '12px', cursor: 'pointer', backgroundImage: `url('${Cross}')` }
const fW = { fontWeight: '700' };

const Details = ({ Role, updateRoleCat, updateRoleTag, tabNav, setTaN }) => {
    var tempList = Role.catList;
    const { role } = Role;
    const { category, _id, name, org, description } = role;
    const [rList, setRL] = useState([]), [tempId, setTI] = useState(''), [tempName, setTN] = useState(''), [selectList, setSL] = useState([]),
        [modalAtt, setModAtt] = useState(false), [num, setNum] = useState(0), [modalDel, setMD] = useState(false);

    useEffect(() => {
        var tList = tempList.filter(item => !category.some(obj => item._id === obj._id));
        setRL(role.category);
        if (tList.length > 0) {
            setTI(tList[0]._id); setTN(tList[0].name); setSL(tList);
        }
    }, [tempList, role, category])

    const handleModalDel = (e, val) => setMD(val);

    const handleModalAttach = (e, val) => setModAtt(val);

    const onhandleModal = mv => setNum(mv);

    const handleUpdateCat = e => {
        e.preventDefault();
        var listId = [];
        rList.map(item => listId.push(item._id));
        var data = { list: listId, _id: _id, org: org };
        updateRoleCat(data);
    };

    const renderOwnList = () => rList.length > 0 && rList.map(item => <div style={dS} key={item._id}>
        <h6 style={hS} >{item.name}</h6>
        <div onClick={e => handleCancel(item.name, item._id)} style={tM} />
    </div>);

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) {
            setTI(e.target.options[selectedIndex].getAttribute('data-key')); setTN(e.target.options[selectedIndex].getAttribute('data-name'));
        }
    };

    const handleCancel = (name, _id) => {
        if (_id) {
            var tempRName = rList;
            tempRName = tempRName.filter(item => item.name !== name);
            var tempAdd = selectList;
            tempAdd.push({ _id: _id, name: name });
            setRL(tempRName); setSL(tempAdd); setTI(tempAdd[0]._id); setTN(tempAdd[0].name);
        }
    };

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
    };

    const tagRole = () => {
        var data = { _id: _id, org: org };
        updateRoleTag(data);
    };

    const renderList = rList => rList.map(item => <option key={item._id} data-key={item._id} data-name={item.name}>{item.name}</option>);

    return <div className="col-11 r-w p-0">
        <h4 className="h">{name ? name : ''}</h4>
        <Tabnav items={['Details', 'Folders', 'Permissions']} i={tabNav} setI={setTaN} />
        {tabNav === 0 && <Suspense fallback={<></>}>
            <RoleText name={'name'} head={'Role'} val={name} title={'NAME'} modal={num === 1 ? true : false} num={1} handleModal={onhandleModal} type={'text'} refAct='role' id={_id} org={org} />
            <RoleTextA name={'description'} head={'Description'} val={description} title={'DESCRIPTION'} skip={true} modal={num === 2 ? true : false} num={2} handleModal={onhandleModal} type={'text'} refAct='role' id={_id} org={org} />
        </Suspense>}
        {tabNav === 1 && <>
            <div style={rS}>
                <select style={{ width: '90%', marginTop: '20px' }} className="form-control" onChange={e => handleSelect(e)}>
                    {selectList && selectList.length > 0 && renderList(selectList)}
                </select>
                <div className="btnAddRole" style={{ marginTop: '20px' }} onClick={e => handleAdd()}><div style={{ backgroundImage: `url('${Plus}')`, width: '16px', height: '16px' }} /></div>
            </div>
            {renderOwnList()}
            <div className="col-12 p-0 permBtn">
                <button className="btn btn-primary" style={{ marginTop: '16px', alignSelf: 'right' }} onClick={e => handleUpdateCat(e)}>
                    Update Folders
            </button>
            </div>
        </>}
        {tabNav === 2 && <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '12px' }}>
            <button  className="btn btn-primary" style={daS} onClick={e => setModAtt(true)}>Tag to all Users</button>
            <button className="btn btn-danger" style={daS} onClick={e => setMD(true)}>Delete Role</button>
            <p style={pS}><b style={fW}>Note: </b>This action will only delete role if no role is assigned to the role.</p>
        </div>}
        {modalDel && <Suspense fallback={<></>}><ModalDelete org={org} id={_id} onhandleModalDel={handleModalDel} /></Suspense>}
        {modalAtt && <Suspense fallback={<></>}><ModalAttach onYes={tagRole} onhandleModalDel={handleModalAttach} /></Suspense>}
    </div>

}

export default connect(null, { updateRoleCat, updateRoleTag })(Details);