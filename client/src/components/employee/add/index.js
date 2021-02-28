import React, { useEffect, lazy, Suspense, useState } from 'react';
import { connect } from 'react-redux';
import { registerUser, registerUserN } from '../../../redux/actions/employeeActions';
import Resizer from 'react-image-file-resizer';
import RegisterC from '../../containers/registerContainer';
import Plus from '../../../assets/plus.svg';
import Cross from '../../../assets/cross.svg';
import Popover from '../../popover';
import { ModalProcess } from '../../../redux/actions/profileActions';
const InputPassword = lazy(() => import('../../inputs/inputPass'));
const InputText = lazy(() => import('../../inputs/inputText'));
const CheckBox = lazy(() => import('./cb'));
const Image = lazy(() => import('./image'));
const dS = { paddingLeft: '6px', paddingTop: '10px', paddingBottom: '10px', width: '95%', display: 'flex', flexDirection: 'row', alignItems: 'center' };
const h6S = { fontWeight: '400', fontSize: '14px' };
const tS = { marginTop: '16px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const eSE = { marginTop: '16px', marginBottom: '12px', marginLeft: '1%', width: '89%', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const sS = { width: '90%', marginTop: '20px' };
const diS = { marginTop: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'row' };
const tM = { width: '16px', height: '16px', cursor: 'pointer', backgroundImage: `url('${Cross}')` };

const Add = ({ setting, list, registerUser, registerUserN, id, count, ModalProcess, Org }) => {
    const [name, setN] = useState(''), [errn, setEN] = useState(false), [errP, setEP] = useState(false), [err, setErr] = useState(false), [mt, setMT] = useState(''), [uT, setUT] = useState(0), [listName, setLN] = useState([]), [listIds, setLId] = useState([]), [rList, setRL] = useState([]),
        [tempId, setTId] = useState(''), [tempName, setTN] = useState(''), [img, setI] = useState(''), [image, setImg] = useState(''), [iS, setIS] = useState(false), [fN, setFN] = useState(''), [cbC, setCBC] = useState(false), [errPF, setErrPF] = useState(false), [cPass, setCP] = useState(''),
        [password, setP] = useState(''), [email, setE] = useState(''), [errE, setEEM] = useState(false), [errM, setErrM] = useState(false), [errR, setErrR] = useState(false),
        [errWS, setEWS] = useState(false), [errB, setEB] = useState(false), [cbA, setCBA] = useState(false), [erre, setEE] = useState(false), [fs, setFS] = useState(0), [errPM, setErrPM] = useState(false);

    var size = setting && setting.maxImageSize ? setting.maxImageSize : 1;

    // eslint-disable-next-line
    const reCE = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    // eslint-disable-next-line
    const reWS = /\s/g;
    const rN = /^[a-zA-Z -]*$/;
    // eslint-disable-next-line
    const rP = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    useEffect(() => {
        if (list && list.length > 0) {
            setRL(list); setTId(list[0]._id); setTN(list[0].name);
        } else {
            setRL([]); setTId(''); setTN('');
        }
    }, [list]);

    const handleCB = e => setCBA(e.target.checked);
    const handleCBC = e => setCBC(e.target.checked);
    const handleN = e => { if (rN.test(e.target.value) || e.target.value === '') setN(e.target.value); errn && setEN(false); }
    const handleE = e => { setE(e.target.value); erre && setEE(false); }
    const handleP = e => { setP(e.target.value); errP && setEP(false); errPF && setErrPF(false); }
    const handleCP = e => { setCP(e.target.value); errM && setErrM(false); errPM && setErrPM(false); }

    const handleSubmit = e => {
        e.preventDefault();
        if (name && email && password && count < Org.userCount) {
            if (!reCE.test(email)) setEEM(true);
            else if (reWS.test(email)) setEWS(true);
            else if (!rP.test(password)) setErrPF(true);
            else if (password !== cPass) setErrPM(true);
            else {
                if (mt && fN && fs && iS) {
                    var data = { _id: id, name: name, email: email, password: password, ids: listIds, active: cbA, image: fN, mimeType: mt, fileSize: fs, userType: uT, clientView: cbC };
                    registerUser(data, image);
                } else {
                    var dataN = { _id: id, name: name, email: email, password: password, ids: listIds, active: cbA, userType: uT, clientView: cbC };
                    registerUserN(dataN);
                }
            }
        } else {
            !name && setEN(true); !email && setEE(true); !password && setEP(true); !cPass && setErrM(true);
            count >= Org.userCount && ModalProcess({ title: 'User', text: 'Please upgrade your package.' });
        }
    }

    const handleImagePreview = e => {
        try {
            if (e.target.files && e.target.files[0]) {
                let file = e.target.files[0];
                setMT(file.type); setFN(file.name); setFS(file.size);
                if (file.type === 'image/x-png' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/jpg' || file.type === 'image/jpeg') {
                    Resizer.imageFileResizer(file, 200, 200, 'JPEG', 80, 0, uri => setI(URL.createObjectURL(uri)), 'blob');
                    if (file.size <= (1024 * 1024 * size)) Resizer.imageFileResizer(file, 200, 200, 'JPEG', 80, 0, uri => {
                        if (uri.size <= 1024 * 50) {
                            setImg(uri); setIS(true);
                        } else setErrR(true);
                        setErr(false); setEB(false);
                    }, 'blob');
                    else setErr(true);
                } else setEB(true);
            } else setEB(true);
        } catch { setEB(true); }
    }

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) {
            setTId(e.target.options[selectedIndex].getAttribute('data-key'));
            setTN(e.target.options[selectedIndex].getAttribute('data-name'));
        }
    };

    const renderTypes = () => ['User', 'Project Manager', 'Administrator'].map((i, k) => <option key={k} data-key={k}>{i}</option>);

    const handleSelectT = (e) => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && setUT(e.target.options[selectedIndex].getAttribute('data-key'))
    };

    const handleCancel = (name, _id) => {
        if (_id) {
            var tempRId = listIds;
            tempRId = tempRId.filter(item => item !== _id);
            var tempRName = listName;
            tempRName = tempRName.filter(item => item.name !== name);
            var tempAdd = rList;
            tempAdd.push({ _id: _id, name: name });
            setLId(tempRId); setLN(tempRName); setTId(tempAdd[0]._id); setTN(tempAdd[0].name);
        }
    };

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
                setTId(tempR[0]._id); setTN(tempR[0].name);
            } else {
                setTId(''); setTN('');
            }
        }
    };

    const renderOwnList = () => listName.length > 0 && listName.map(item => <div style={dS} key={item._id}>
        <h6 className="mr-auto" style={h6S} >{item.name}</h6>
        <div onClick={e => handleCancel(item.name, item._id)} style={tM} />
    </div>);

    const renderList = rList => rList.map(item => <option key={item._id} data-key={item._id} data-name={item.name}>{item.name}</option>);

    return <RegisterC onSubmit={handleSubmit} text={'Add User'}>
        <Suspense fallback={<></>}>
            <Image img={img} err={err} errBroken={errB} errR={errR} size={size} onhandleImagePreview={handleImagePreview} />
        </Suspense>
        <hr width="100%" />
        <Suspense fallback={<></>}>
            <InputText t={`NAME`} plh={`Enter name`} tp={'text'} val={name} handleInput={handleN} err={errn} />
            <InputText t={`EMAIL`} plh={`Enter email`} tp={'text'} val={email} handleInput={handleE} err={erre} />
            {!erre && errE && <div style={eSE}>Provided email format is incorrect.</div>}
            {!erre && !errE && errWS && <div style={eSE}>Email address contains white space.</div>}
            <InputPassword t={'PASSWORD'} plh={'Enter password'} val={password} handleInput={handleP} err={errP} />
            {!errP && errPF && <div style={eSE}>Passwords should be minimum 8 characters with one numeric, one capital and one special character.</div>}
            <InputText t={'CONFIRM PASSWORD'} plh={'Enter password'} tp={'password'} val={cPass} handleInput={handleCP} err={errM} />
            {!errM && errPM && <div style={eSE}>Both Passwords do not match.</div>}
        </Suspense>
        <h6 style={tS}>PERMISSION</h6>
        <Suspense fallback={<></>}>
            <CheckBox val={cbA} id={'cbActive'} t={'Active'} eT={'This action will activate the user account. User will be able to sign in the system.'} onhandleCB={handleCB} />
        </Suspense>
        <Suspense fallback={<></>}>
            <CheckBox val={cbC} id={'cbClient'} t={'Client View'} eT={'This action will enable/disable client view in the dashboard for the employee/Project Manager.'} url={`https://docs.file-o.com:4242/doc/topic/1/content/0`} onhandleCB={handleCBC} />
        </Suspense>
        <hr width="100%" />
        <h6 style={tS}>USER TYPE <Popover sty={{ marginLeft: '6px', marginBottom: '-2px' }} text={'User Type gives the features that are available to a user depending on the type of user selected.'} url={`https://docs.file-o.com:4242/doc/topic/2/content/1`} /></h6>
        <select style={sS} className="form-control" onChange={e => handleSelectT(e)}>
            {renderTypes()}
        </select>
        <h6 style={tS}>ROLE <Popover sty={{ marginLeft: '6px', marginBottom: '-2px' }} text={'Roles are a method of providing service entitlements to persons within the organization.'} url={`https://docs.file-o.com:4242/doc/topic/9/content/0`} /></h6>
        <div style={diS}>
            <select style={{ width: '90%' }} className="form-control" onChange={e => handleSelect(e)}>
                {rList && rList.length > 0 && renderList(rList)}
            </select>
            <div className="btnAddRole" onClick={e => handleAdd()}><div style={{ backgroundImage: `url('${Plus}')`, width: '16px', height: '16px' }} /></div>
        </div>
        {renderOwnList()}
    </RegisterC>
}

export default connect(null, { registerUser, registerUserN, ModalProcess })(Add);