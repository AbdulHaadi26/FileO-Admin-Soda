import React, { lazy, Suspense, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { registerRole } from '../../../redux/actions/project_rolesAction';
import '../style.css';
import RegisterC from '../../containers/registerContainer';
import Cross from '../../../assets/cross.svg';
import Plus from '../../../assets/plus.svg';
const InputText = lazy(() => import('../../inputs/inputText'));
const InputTextA = lazy(() => import('../../inputs/inputTextArea'));
const dF = { marginTop: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'row' };
const dF2 = { width: '90%', marginTop: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' };
const tS = { marginTop: '16px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const dS = { paddingLeft: '6px', paddingTop: '10px', paddingBottom: '10px', width: '95%', display: 'flex', flexDirection: 'row', alignItems: 'center' };
const hS = { fontWeight: '400', fontSize: '14px', marginTop: '4px' };
const tM = { width: '12px', height: '12px', marginLeft: '12px', cursor: 'pointer', backgroundImage: `url('${Cross}')` };

const Add = ({ registerRole, id, pId, list }) => {
    const [name, setN] = useState(''), [errn, setErrN] = useState(false), [listName, setLN] = useState([]), [listIds, setLI] = useState([]), [tempId, setTI] = useState(''),
        [tempName, setTN] = useState(''), [rList, setRL] = useState([]), [desc, setD] = useState('');

    useEffect(() => {
        if (list.length > 0) {
            setRL(list); setTI(list[0]._id); setTN(list[0].name);
        } else {
            setRL([]); setTI(''); setTN('');
        }
    }, [list, setRL, setTI, setLI])

    const handleSubmit = e => {
        e.preventDefault();
        var data = { _id: id, name: name, list: listIds, pId: pId, desc: desc ? desc : '' };

        name ? registerRole(data) : setErrN(true);
    }

    const onhandleN = e => setN(e.target.value);

    const onhandleD = e => {
        if (e.target.value.split(' ').length <= 250) setD(e.target.value);
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
            setLI(tempRId); setLN(tempRName); setRL(tempAdd)
            setTI(tempAdd[0]._id);
            setTN(tempAdd[0].name);
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
            if (tempR && tempR.length > 0) {
                setTI(tempR[0]._id);
                setTN(tempR[0].name);
            } else {
                setTI('');
                setTN('');
            }
        }
    }

    const renderOwnList = () => listName.length > 0 && listName.map(item => <div style={dS} key={item._id}>
        <h6 style={hS} >{item.name}</h6>
        <div onClick={e => handleCancel(item.name, item._id)} style={tM} />
    </div>);

    const renderList = rList => rList.map(item => <option key={item._id} data-key={item._id} data-name={item.name}>{item.name}</option>);

    return <RegisterC onSubmit={handleSubmit} text={'Add Role'}>
        <Suspense fallback={<></>}>
            <InputText t={`ROLE NAME`} plh={`Enter name`} tp={'text'} val={name} handleInput={onhandleN} err={errn} />
            <InputTextA t={`ROLE DESCRIPTION`} plh={`Enter description`} tp={'text'} val={desc} handleInput={onhandleD} err={false} />
            <div style={dF2}>
                <p className="word-count">{desc.split(" ").length} / 250</p>
            </div>
        </Suspense>
        <h6 style={tS}>ASSIGN FOLDERS</h6>
        <div style={dF}>
            <select style={{ width: '90%' }} className="form-control" onChange={e => handleSelect(e)}>
                {rList && rList.length > 0 && renderList(rList)}
            </select>
            <div className="btnAddRole" onClick={e => handleAdd()}><div style={{ backgroundImage: `url('${Plus}')`, width: '16px', height: '16px' }} /></div>
        </div>
        {renderOwnList()}
    </RegisterC>
}

export default connect(null, { registerRole })(Add);