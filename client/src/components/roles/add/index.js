import React, { lazy, Suspense, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { registerRole } from '../../../redux/actions/rolesAction';
import Cross from '../../../assets/cross.svg';
import Plus from '../../../assets/plus.svg';
import '../style.css';
import RegisterC from '../../containers/registerContainer';
import Popover from '../../popover';
const InputText = lazy(() => import('../../inputs/inputText'));
const InputTextA = lazy(() => import('../../inputs/inputTextArea'));
const rS = { marginTop: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'row' };
const tS = { marginTop: '16px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const dS = { paddingLeft: '6px', paddingTop: '10px', paddingBottom: '10px', width: '95%', display: 'flex', flexDirection: 'row', alignItems: 'center' };
const hS = { fontWeight: '400', fontSize: '14px', marginTop: '4px' };
const tM = { width: '12px', height: '12px', marginLeft: '12px', cursor: 'pointer', backgroundImage: `url('${Cross}')` }

const Add = ({ registerRole, id, list }) => {
    const [name, setN] = useState(''), [errname, setErrN] = useState(false), [listName, setLN] = useState([]), [desc, setD] = useState(''), [listIds, setLI] = useState([]), [rList, setRL] = useState([]), [tempId, setTI] = useState(''), [tempName, setTN] = useState('');

    useEffect(() => {
        if (list && list.length > 0) {
            setRL(list); 
            setTI(list[0]._id); 
            setTN(list[0].name);
        } else {
            setRL([]); 
            setTI(''); 
            setTN('');
        }
    }, [list]);

    const handleSubmit = e => {
        e.preventDefault();
        var data = { _id: id, name: name, list: listIds, desc: desc ? desc : '' };
        name ? registerRole(data) : setErrN(true);
    }

    const onhandleInput = e => { errname && setErrN(false); setN(e.target.value); }
    const onhandleInputD = e => setD(e.target.value);

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
            tempRId = tempRId.filter(item => item._id !== _id);
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
        <h6 style={hS} >{item.name}</h6>
        <div onClick={e => handleCancel(item.name, item._id)} style={tM} />
    </div>);

    const renderList = rList => rList.map(item => <option key={item._id} data-key={item._id} data-name={item.name}>{item.name}</option>);

    return <RegisterC onSubmit={handleSubmit} text={'Add Role'}>
        <Suspense fallback={<></>}>
            <InputText t={`NAME`} plh={`Enter name`} tp={'text'} val={name} handleInput={onhandleInput} err={errname} />
            <InputTextA t={`DESCRIPTION`} plh={`Enter description`} tp={'text'} val={desc} handleInput={onhandleInputD} />
        </Suspense>
        <h6 style={tS}>ASSIGN FOLDERS <Popover sty={{ marginLeft: '6px', marginBottom: '-2px' }} text={'A specific folder will be assigned to a specific role so that the person entitled to that role can see the files related to the folder.'} url={`https://docs.file-o.com:4242/doc/topic/9/content/0`} /></h6>
        <div style={rS}>
            <select style={{ width: '90%' }} className="form-control" onChange={e => handleSelect(e)}>
                {rList && rList.length > 0 && renderList(rList)}
            </select>
            <div className="btnAddRole" onClick={e => handleAdd()}><div style={{ backgroundImage: `url('${Plus}')`, width: '16px', height: '16px' }} /></div>
        </div>
        {renderOwnList()}
    </RegisterC>
}

export default connect(null, { registerRole })(Add);