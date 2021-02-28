import React, { useState, useEffect } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { assignEmployee } from '../../../redux/actions/projectActions';
import RegisterC from '../../containers/registerContainer';
import Cross from '../../../assets/cross.svg';
import Plus from '../../../assets/plus.svg';
import Tabnav from '../../tabnav';
import User from '../../../assets/static/user.png';
const eS = { marginTop: '30px', marginBottom: '22px', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const tS = { marginTop: '16px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const dS = { paddingLeft: '6px', paddingTop: '10px', paddingBottom: '10px', width: '95%', display: 'flex', flexDirection: 'row', alignItems: 'center' };
const h6S = { fontWeight: '400', fontSize: '14px' };
const mF = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const iS = { width: '80px', height: '80px', marginRight: '12px', borderRadius: '1000px' };
const nS = { marginTop: '16px', marginBottom: '24px', textAlign: 'left', fontSize: '16px', fontWeight: '400' };
const diS = { marginTop: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'row' };
const tM = { width: '16px', height: '16px', cursor: 'pointer', backgroundImage: `url('${Cross}')` }

const AssignedUsers = ({ assignEmployee, Emp, pId, tabNav, setTaN }) => {
    const { roleList, user } = Emp;
    var list = roleList;

    const [id, setId] = useState(''), [name, setN] = useState(''), [image, setI] = useState(''), [org, setO] = useState(''),
        [errRole, setErrR] = useState(false), [orgName, setON] = useState(''), [listName, setLN] = useState([]), [listIds, setLId] = useState([]), [rList, setRL] = useState([]),
        [tempId, setTId] = useState(''), [tempName, setTN] = useState('');

    useEffect(() => {
        if (list && list.length > 0) {
            setRL(list); setTId(list[0]._id); setTN(list[0].name);
        } else {
            setRL([]); setTId(''); setTN('');
        }
        if (user) {
            setId(user._id); setN(user.name); setI(user.image); setO(user.current_employer && user.current_employer._id ? user.current_employer._id : ''); setON(user.current_employer && user.current_employer.name ? user.current_employer.name : '');
        }
    }, [list, user])

    const handleSubmit = e => {
        e.preventDefault();
        var data = { userId: id, name: name, roles: listIds, org: org, orgName: orgName, pId: pId };
        listIds && listIds.length > 0 ? assignEmployee(data) : setErrR(true);
    }

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) {
            setTId(e.target.options[selectedIndex].getAttribute('data-key'));
            setTN(e.target.options[selectedIndex].getAttribute('data-name'));
        }
    }

    const handleCancel = (e, name, _id) => {
        if (_id) {
            var tempRId = listIds;
            tempRId = tempRId.filter(item => item._id !== _id);
            var tempRName = listName;
            tempRName = tempRName.filter(item => item.name !== name);
            var tempAdd = rList;
            tempAdd.push({ _id: _id, name: name });
            setLId(tempRId); setLN(tempRName); setTId(tempAdd[0]._id); setTN(tempAdd[0].name);
        }
    }

    const handleAdd = e => {
        if (tempId && tempName) {
            var Lid = listIds;
            Lid.push(tempId);
            var Lname = listName;
            Lname.push({ _id: tempId, name: tempName });
            var tempR = rList;
            tempR = tempR.filter(item => item._id !== tempId);
            setLId(Lid); setLN(Lname); setRL(tempR);
            if (tempR.length > 0) {
                setTId(tempR[0]._id); setTN(tempR[0].name);
            } else {
                setTId(''); setTN('');
            }
        }
    }

    const renderOwnList = () => listName.length > 0 && listName.map(item => <div style={dS} key={item._id}>
        <h6 className="mr-auto" style={h6S} >{item.name}</h6>
        <div onClick={e => handleCancel(e, item.name, item._id)} style={tM} />
    </div>);


    const renderList = rList => rList.map(item => <option key={item._id} data-key={item._id} data-name={item.name}>{item.name}</option>);

    return <div className="col-11 p-w p-0">
        <h4 className="h">Project</h4>
        <Tabnav items={['Assign User']} i={tabNav} setI={setTaN} />
        <RegisterC onSubmit={handleSubmit} text={'Assign User'}>
            <div className="col-12 p-0" style={mF}>
                <img src={image ? image : User} alt="user" style={iS} />
                <h6 style={nS}>{name}</h6>
            </div>
            <hr style={{ width: '100%' }} />
            <h6 style={tS}>ROLES</h6>
            <div style={diS}>
                <select style={{ width: '90%' }} className="form-control" onChange={e => handleSelect(e)}>
                    {rList && rList.length > 0 && renderList(rList)}
                </select>
                <div className="btnAddRole" onClick={e => handleAdd(e)}><div style={{ backgroundImage: `url('${Plus}')`, width: '16px', height: '16px' }} /></div>
            </div>
            {renderOwnList()}
            {errRole && <div style={eS}> Select a role </div>}
        </RegisterC>
    </div>
}

export default connect(null, { assignEmployee })(AssignedUsers);