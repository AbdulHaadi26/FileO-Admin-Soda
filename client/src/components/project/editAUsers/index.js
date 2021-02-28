import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { editAssignEmployee, delEmployee } from '../../../redux/actions/projectActions';
import Cross from '../../../assets/cross.svg';
import Plus from '../../../assets/plus.svg';
import '../style.css';
import User from '../../../assets/static/user.png';
import Tabnav from '../../tabnav';
const mT = { marginTop: '16px' };
const dF = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const eS = { marginTop: '30px', marginBottom: '22px', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const tS = { marginTop: '16px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const dS = { paddingLeft: '6px', paddingTop: '10px', paddingBottom: '10px', width: '95%', display: 'flex', flexDirection: 'row', alignItems: 'center' };
const h6S = { fontWeight: '400', fontSize: '14px' };
const iS = { width: '80px', height: '80px', marginRight: '12px', borderRadius: '1000px' };
const nS = { marginTop: '16px', marginBottom: '24px', textAlign: 'center', fontSize: '16px', fontWeight: '400' };
const mR = { marginTop: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'row' };
const mB = { marginTop: '16px' };
const tM = { width: '16px', height: '16px', cursor: 'pointer', backgroundImage: `url('${Cross}')` }

const EditAUser = ({ editAssignEmployee, pId, Emp, delEmployee, tabNav, setTaN }) => {
    const [id, setId] = useState(''), [name, setN] = useState(''), [image, setI] = useState(''), [org, setOrg] = useState(''),
        [errR, setErrR] = useState(false), [listName, setLN] = useState([]), [listIds, setLI] = useState([]), [rList, setRL] = useState([]),
        [tempId, setTI] = useState(''), [tempName, setTN] = useState('');

    useEffect(() => {
        if (Emp && Emp.user) {
            const { userRoles, userId } = Emp.user;
            var list = Emp.roleList;
            list = list && list.length > 0 && list.filter(item => !userRoles.some(obj => item._id === obj._id));
            var ids = [];
            userRoles && userRoles.length > 0 && userRoles.map(item => ids.push(item._id))
            if (list && list.length > 0) { setRL(list); setTI(list[0]._id); setTN(list[0].name); } else { setRL([]); setTI(''); setTN(''); }
            if (userId) {
                setId(userId._id); setN(userId.name); setLN(userRoles ? userRoles : []); setLI(ids); setI(userId.image); setOrg(Emp.user.org);
            }
        }
    }, [Emp])

    const handleSubmit = e => {
        e.preventDefault();
        if (listIds && listIds.length > 0) {
            var data = { _id: id, roles: listIds, pId: pId };
            editAssignEmployee(data);
        } else setErrR(true);
    }

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) {
            setTI(e.target.options[selectedIndex].getAttribute('data-key'));
            setTN(e.target.options[selectedIndex].getAttribute('data-name'));
        }
    }

    const handleCancel = (name, _id) => {
        if (_id) {
            var tempRId = listIds;
            tempRId = tempRId.filter(item => item !== _id);
            var tempRName = listName;
            tempRName = tempRName.filter(item => item.name !== name);
            var tempAdd = rList;
            tempAdd.push({ _id: _id, name: name });
            setLI(tempRId); setLN(tempRName); setTI(tempAdd[0]._id); setTN(tempAdd[0].name);
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
            setLI(Lid); setLN(Lname); setRL(tempR);
            if (tempR.length > 0) {
                setTI(tempR[0]._id); setTN(tempR[0].name);
            } else {
                setTI(''); setTN('');
            }
        }
    }

    const renderOwnList = () => listName.length > 0 && listName.map(item => <div style={dS} key={item._id}>
        <h6 className="mr-auto" style={h6S} >{item.name}</h6>
        <div onClick={e => handleCancel(item.name, item._id)} style={tM} />
    </div>)

    const renderList = rList => rList.map(item => <option key={item._id} data-key={item._id} data-name={item.name}>{item.name}</option>);

    var data = { pId: pId, _id: id, org: org };

    return <div className="col-11 p-w p-0">
        <h4 className="h">Project</h4>
        <Tabnav items={['Assign User']} i={tabNav} setI={setTaN} />
        <form className="modal-content" style={mT} onSubmit={e => handleSubmit(e)}>
            <div className="modal-body">
                <div className="col-12 p-0" style={dF}>
                    <img src={image ? image : User} alt="user" style={iS} />
                    <h6 style={nS}>{name}</h6>
                </div>
                <hr style={{ width: '100%' }} />
                <h6 style={tS}>ROLES</h6>
                <div style={mR}>
                    <select style={{ width: '90%' }} className="form-control" onChange={e => handleSelect(e)}>
                        {rList && rList.length > 0 && renderList(rList)}
                    </select>
                    <div className="btnAddRole" onClick={e => handleAdd()}><div style={{ backgroundImage: `url('${Plus}')`, width: '16px', height: '16px' }} /></div>
                </div>
                {renderOwnList()}
                {errR && <div style={eS}> Select a role </div>}
            </div>
            <div className="modal-footer" style={mB}>
                <button className="btn btn-danger" type='button' onClick={e => delEmployee(data)}>Remove user</button>
                <button className="btn btn-primary" type='submit'>Update user</button>
            </div>
        </form>
    </div>
}

export default connect(null, { editAssignEmployee, delEmployee })(EditAUser);