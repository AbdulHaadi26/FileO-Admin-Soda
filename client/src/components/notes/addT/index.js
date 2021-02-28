import React, { useState, lazy, Suspense, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import '../snow.css';
import { registerTask, deleteRec } from '../../../redux/actions/noteActions';
import returnType from '../../types';
import RegisterC from '../../containers/registerContainer';
import Attach from '../../../assets/attach.svg';
import MP from '../../../assets/mp2.svg';
import VC from '../../../assets/vc1.svg';
import Cross from '../../../assets/cross.svg';
import CreateFileModal from '../../user_files/addModal';
const ModalFolder = lazy(() => import('../modals/attachFolder'));
const CB = lazy(() => import('./cb'));
const ModalRec = lazy(() => import('../modelRec'));
const ModalRecV = lazy(() => import('../modelRecVideo'));
const ModalFile = lazy(() => import('../modelView'));
const Modal = lazy(() => import('../modals/attachFile'));
const InputText = lazy(() => import('../../inputs/inputText'));
const ReactQuill = lazy(() => import('react-quill'));
const iG = { marginTop: '2px', width: '90%' };
const tM = { width: '12px', height: '12px', cursor: 'pointer', backgroundImage: `url('${Cross}')`, marginLeft: '12px' };
const iS = { margin: '16px 0px 8px 0px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const eS = { width: '100%', fontWeight: 700, color: '#b33939', fontSize: '12px', marginTop: '8px' };
const bSE = { borderBottom: 'solid 1px #dcdde1' };

const Add = ({ org, _id, registerTask, setting, deleteRec }) => {
    const [note, setNote] = useState(''), [v, setV] = useState(''), [c, setC] = useState('#ffffcc'), [active, setAct] = useState(false), [at, setAT] = useState([]), [MD, setMD] = useState(false),
        [errV, setErrV] = useState(false), [f, setF] = useState(''), [ModalF, setMF] = useState(''), [MC, setMC] = useState(false), [MCV, setMCV] = useState(false), [ct, setCT] = useState([]), [lEx, setLEX] = useState(false),
        [fd, setFD] = useState(''), [t, setT] = useState(2), [cbEditable, setCBE] = useState(false), [modal, setModal] = useState(false), [MF, setMDF] = useState(false),
        [due, setDue] = useState(''), [status, setStatus] = useState('Open'), [errD, setErrD] = useState(false);
    const node = useRef({});

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setAct(false);
        }
    };

    const handleSubmit = e => {
        e.preventDefault();
        var arr = [], cats = [];
        if (c && v && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: v, text: note, org: org, _id: _id, color: c,
                fileList: arr, recId: fd && fd._id ? fd._id : '',
                editable: cbEditable, catList: cats, isTask: true,
                status: status, due: due
            };
            registerTask(data);
        } else {
            !v && setErrV(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    }

    const handleModalView = (e, val) => setMF(val);


    const handleInputD = e => { setDue(e.target.value.substring(0, 10)); errD && setErrD(false); }

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && setStatus(e.target.options[selectedIndex].getAttribute('data-name'));
    }

    const onhandleModal = (file, val) => {
        if (file) {
            var tempFile = at ? at : [];
            var bool = false;
            tempFile.map(tF => {
                if (tF._id === file._id) bool = true;
                return tF;
            });
            if (!bool) {
                var fl = { _id: file._id, name: file.name, type: file.type, url: file.url, date: new Date(Date.now()).toISOString() };
                tempFile.push(fl);
            }
            setAT(tempFile);
        }
        setModal(val);
    }

    const attachFile = (e, file) => {
        var bool = false;
        var tempFile = at;
        tempFile.map(tF => {
            if (tF._id === file._id) bool = true;
            return tF;
        });
        if (!bool) {
            var fl = { _id: file._id, name: file.name, type: file.type, url: file.url, date: new Date(Date.now()).toISOString() };
            tempFile.push(fl);
        }
        setAT(tempFile);
        setMD(false);
    }

    const attachCat = (e, cat) => {
        var bool = false;
        var tempCat = ct;
        tempCat.map(tF => {
            if (tF._id === cat._id) bool = true;
            return tF;
        });
        if (!bool) {
            let fl = { _id: cat._id, name: cat.name, uId: cat.uId, date: new Date(Date.now()).toISOString() };
            tempCat.push(fl);
        }
        setCT(tempCat);
        setMDF(false);
    }

    const removeFile = id => {
        var tempFile = at;
        tempFile = tempFile.filter(tF => tF._id !== id);
        setAT(tempFile);
    }

    const removeCat = id => {
        let tempFile = ct;
        tempFile = tempFile.filter(tF => tF._id !== id);
        setCT(tempFile);
    }

    const renderColor = () => ['#ffffcc', '#7efff5', '#ff9ff3', '#7bed9f', '#f8c291', '#f7f1e3'].map(col => <div key={col} style={{ width: '30px', height: '30px', border: col === c ? '1px solid black' : '', marginLeft: '6px', backgroundColor: col, cursor: 'pointer' }} onClick={e => setC(col)} />);

    const renderFile = () => at && at.length > 0 && at.map(a => <div key={a._id} className="nt-f-w">
        <img src={returnType(a.type)} alt="type" onClick={e => { setT(2); setF(a); setMF(true); }} />
        <h6 onClick={e => { setT(2); setF(a); setMF(true); }}>{`${a.name}`}</h6>
        <div style={tM} onClick={e => removeFile(a._id)} />
    </div>);

    const renderCat = () => ct && ct.length > 0 && ct.map(a => <div key={a._id} className="nt-f-w">
        <h6>{`${a.name}`}</h6>
        <div style={tM} onClick={e => removeCat(a._id)} />
    </div>);

    const handleModal = (e, val) => setMD(val);
    const handleModalCat = (e, val) => setMDF(val);
    const handleCBE = e => setCBE(e.target.checked);
    const handleModalC = (e, val) => setMC(val);
    const handleModalCV = (e, val) => setMCV(val);
    const handleInput = e => { setV(e.target.value); setErrV(false); }
    const handleRec = fData => { setFD(fData); setMC(false); setMCV(false); }
    const handleNote = value => {
        setNote(value);
        lEx && setLEX(false)
    }

    const removeRec = fId => {
        var data = { _id: fId };
        deleteRec(data);
        setFD('');
    }

    return <RegisterC onSubmit={handleSubmit} text={'Add Task'}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', position: 'relative' }}>
            <button className="btn btn-primary btn-send" type="submit">Add Task</button>
        </div>
        <Suspense fallback={<></>}> <InputText t={'TITLE'} plh={`Enter task title`} tp={'text'} val={v} handleInput={handleInput} err={errV} /> </Suspense>
        <h6 style={iS}>Task</h6>
        <Suspense fallback={<></>}> <ReactQuill theme="snow" value={note} onChange={handleNote} style={{ width: '90%' }} /></Suspense>
        {lEx && <div style={{ width: '90%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', position: 'relative' }}>
            <h6 style={eS}>Note Size Exceeds 100mb.</h6>
        </div>}
        <h6 style={iS}>DUE DATE</h6>
        <div className="input-group" style={iG}>
            <input type={'date'} min={(new Date(Date.now()).toISOString()).slice(0, 10)} className="form-control" placeholder={'Select Date'} value={due}
                onChange={e => handleInputD(e)} />
        </div>
        {errD && <div style={eS}>This field is required</div>}
        <h6 style={iS}>STATUS</h6>
        <select className="form-control" style={{ width: '90%' }} defaultValue={status} onChange={e => handleSelect(e)}>
            {['Open', 'In Progress', 'On Hold', 'Completed', 'Closed'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
        </select>
        <h6 style={iS}>SHARING PERMISSIONS</h6>
        {<Suspense fallback={<></>}>
            <CB i={'cbEditable'} t='Editable' c={cbEditable} onhandleCB={handleCBE} />
        </Suspense>}
        <h6 style={iS}>ATTACH FOLDER</h6>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {renderCat()}
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', position: 'relative' }}>
            <button className="btn btn-dark" type='button' onClick={e => setMDF(true)}>Attach folder
            <div className="faS" style={{ backgroundImage: `url('${Attach}')` }} /></button>
        </div>
        <h6 style={iS}>ATTACH FILE</h6>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {renderFile()}
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', position: 'relative' }}>
            <button className="btn btn-dark" type='button' onClick={e => setAct(true)}>Attach file
            <div className="faS" style={{ backgroundImage: `url('${Attach}')` }} /></button>
            <div ref={node} className="dropdown-content" style={{ display: `${active ? 'flex' : 'none'}` }}>
                <h6 className='s-l' style={bSE} onClick={e => {
                    setAct(false); setMD(true);
                }}>Attach From My Space</h6>
                <h6 className='s-l' onClick={e => {
                    setAct(false); setModal(true);
                }}>Attach From PC</h6>
            </div>
        </div>
        <h6 style={iS}>RECORDING</h6>
        {fd ? <div className="nt-f-w">
            <img src={returnType(fd.type)} alt="type" onClick={e => { setT(1); setF(fd); setMF(true); }} />
            <h6 onClick={e => { setT(1); setF(fd); setMF(true); }}>{`${fd.name}`}</h6>
            <div style={tM} onClick={e => removeRec(fd._id)} />
        </div> : <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <button className="btn btn-dark" type='button' onClick={e => setMCV(true)} style={{ marginRight: '12px' }}>Record video<div className="faS" style={{ backgroundImage: `url('${VC}')` }} /></button>
                <button className="btn btn-dark" type='button' onClick={e => setMC(true)}>Record audio<div className="faS" style={{ backgroundImage: `url('${MP}')` }} /></button>
            </div>}
        <h6 style={iS}>COLOR</h6>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {renderColor()}
        </div>
        {modal && <CreateFileModal id={org} _id={_id} setting={setting && setting.setting} onhandleModal={onhandleModal} />}
        {ModalF && f && <Suspense fallback={<></>}> <ModalFile file={f} onhandleModalView={handleModalView} t={t} /> </Suspense>}
        {MF && <Suspense fallback={<></>}> <ModalFolder _id={_id} org={org} onAttach={attachCat} onhandleModal={handleModalCat} /> </Suspense>}
        {MD && <Suspense fallback={<></>}> <Modal _id={_id} org={org} onAttach={attachFile} onhandleModal={handleModal} /> </Suspense>}
        {MC && <Suspense fallback={<></>}> <ModalRec noteName={v} _id={_id} org={org} onhandleModal={handleModalC} fileL={setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5} onSubmit={handleRec} /> </Suspense>}
        {MCV && <Suspense fallback={<></>}> <ModalRecV noteName={v} _id={_id} org={org} onhandleModal={handleModalCV} fileL={setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5} onSubmit={handleRec} /> </Suspense>}
    </RegisterC>
}

const mapStateToProps = state => {
    return {
        setting: state.setting.data
    }
}

export default connect(mapStateToProps, { registerTask, deleteRec })(Add);