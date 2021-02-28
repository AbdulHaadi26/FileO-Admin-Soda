import React, { useState, Suspense, lazy, useEffect, useRef } from 'react';
import '../style.css';
import '../snow.css';
import { connect } from 'react-redux';
import { updateNote, deleteRec, updateTask, convertNote, updateNoteL, updateTaskL, deleteTask, deleteNote } from '../../../redux/actions/noteActions';
import returnType from '../../types';
import Link from 'react-router-dom/Link';
import MP from '../../../assets/mp2.svg';
import VC from '../../../assets/vc1.svg';
import Cross from '../../../assets/cross.svg';
import Tabnav from '../../tabnav';
import CreateFileModal from '../../user_files/addModal';
import { addComment } from '../../../redux/actions/discussionActions';
import More from '../../../assets/more.svg';
import Discussion from '../../discussion';
import DeleteModal from '../../containers/deleteContainer';
import Assigned from '../modals/shared';
const mT = { marginTop: '16px' };
const Modal = lazy(() => import('../modals/attachFile'));
const ModalFile = lazy(() => import('../modelView'));
const ModalRec = lazy(() => import('../modelRec'));
const ModalRecV = lazy(() => import('../modelRecVideo'));
const FileText = lazy(() => import('../../inputs/inputText'));
const ReactQuill = lazy(() => import('react-quill'));
const ModalFolder = lazy(() => import('../modals/attachFolder'));
const CB = lazy(() => import('./cb'));
const iG = { marginTop: '2px', width: '90%' };
const iS = { margin: '16px 0px 8px 0px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const tM = { width: '12px', height: '12px', cursor: 'pointer', backgroundImage: `url('${Cross}')`, marginLeft: '6px' };
const tM2 = { width: '12px', height: '12px', cursor: 'pointer', backgroundImage: `url('${Cross}')`, marginLeft: '6px', marginTop: '6px' };
const cS = { cursor: 'pointer' };
const cS2 = { cursor: 'pointer', marginTop: '0px' };
const bSE = { borderBottom: 'solid 1px #dcdde1' };
const eS = { marginTop: '16px', marginBottom: '12px', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };

const Details = ({
    org, _id, Note, updateNote, deleteRec, count, setting, Rec, tabNav, convertNote, updateNoteL, deleteTask, deleteNote,
    setTN, updated, profile, discussion, addComment, offset, setOF, updateChat, updateTask, updateTaskL
}) => {
    const [id, setId] = useState(''), [title, setT] = useState(''), [note, setNote] = useState(''), [at, setAT] = useState([]), [modal, setModal] = useState(false),
        [MD, setMD] = useState(false), [modalDel, setMDL] = useState(false), [c, setC] = useState('#ffffcc'), [f, setF] = useState(''), [ModalF, setMF] = useState(false),
        [rec, setRec] = useState(''), [MC, setMC] = useState(false), [MCV, setMCV] = useState(false), [errT, setErrT] = useState(false), [t, setTp] = useState(2),
        [due, setDue] = useState(''), [status, setStatus] = useState('Open'), [cbEditable, setCBE] = useState(false), [ct, setCT] = useState([]),
        [MF, setMDF] = useState(false), [tempFId, setTempFId] = useState(''), [isTask, setIT] = useState(false), [errD, setErrD] = useState(false),
        [tempCId, setTempCId] = useState(''), [lEx, setLEX] = useState(false), [message, setMessage] = useState(''), [activeT, setActT] = useState(false),
        [mdlT, setMDLT] = useState(false), [string1, setS] = useState(''), [limitMult, setLM] = useState(0), [limit, setL] = useState(12), [limitMult2, setLM2] = useState(0),
        [limit2, setL2] = useState(12), [string2, setS2] = useState(''), [typeF, setTF] = useState('Users'), [shMod, setSHMOD] = useState(false);

    const node = useRef({});

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setActT(false);
        }
    };


    let discussions = discussion && discussion.length > 0 ? discussion.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    }) : [];

    useEffect(() => {
        setId(Note._id); setAT(Note.attachment);
        setT(Note.title); setNote(Note.text);
        setRec(Rec); setC(Note.color); setIT(Note.isTask ? true : false);
        setCBE(Note.editable); setCT(Note.catList ? Note.catList : []);
        if (Note.isTask) {
            setDue(Note.due);
            setStatus(Note.status);
        }
    }, [Note, Rec, setId, setAT, setT, setNote]);

    const handleModal = (e, val) => setMD(val);

    const renderDate = date => {
        var serverDate = date;
        var dt = new Date(Date.parse(serverDate));
        var hours = dt.getHours();
        var minutes = dt.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var checkDate = new Date(Date.now());
        checkDate.setDate(checkDate.getDate() - 1);
        var strTime = `${checkDate < dt ? '' : `${date.slice(0, 10)} at `}${hours}:${minutes}  ${ampm}`;
        return strTime;
    }

    const onhandleModal = (file, val) => {
        if (file) {
            var bool = false;
            var tempFile = at ? at : [];
            tempFile.map(tF => {
                if (tF && tF._id && tF._id === file._id) bool = true;
                return tF;
            });
            if (!bool) {
                let fl = { _id: file._id, name: file.name, type: file.type, url: file.url, date: new Date(Date.now()).toISOString() };
                tempFile.push(fl);
            }

            if (Note.isTask) handleUpdateTAuto(tempFile, ct);
            else handleUpdateAuto(tempFile, ct);

        }
        setModal(val);
    }

    const attachFile = (e, file) => {
        let bool = false;
        let tempFile = at ? at : [];
        tempFile.map(tF => {
            if (tF._id === file._id) bool = true;
            return tF;
        });
        if (!bool) {
            let fl = { _id: file._id, name: file.name, type: file.type, url: file.url, date: new Date(Date.now()).toISOString() };
            tempFile.push(fl);
        }

        if (Note.isTask) handleUpdateTAuto(tempFile, ct);
        else handleUpdateAuto(tempFile, ct);
    };

    const handleCBE = (e) => setCBE(e.target.checked);

    const handleFile = (file, i) => {
        setF(file);
        setTp(i);
        setMF(true);
    }

    const removeFile = (isTrue) => {
        if (!isTrue) return setTempFId('');
        let tempFile = at;
        tempFile = tempFile.filter(tF => tF._id !== tempFId);

        if (Note.isTask) handleUpdateTAuto(tempFile, ct);
        else handleUpdateAuto(tempFile, ct);
    }

    const renderColor = () => ['#ffffcc', '#7efff5', '#ff9ff3', '#7bed9f', '#f8c291', '#f7f1e3'].map(col => <div key={col} style={{ width: '30px', height: '30px', border: col === c ? '1px solid black' : '', marginLeft: '6px', backgroundColor: col, cursor: 'pointer' }} onClick={e => setC(col)} />);

    const renderFile = () => {
        if (at && at.length > 0) {
            let list = at.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });

            return list.map(a => <div key={a._id} className="nt-f-w" style={{ alignItems: 'flex-start' }}>
                <img style={cS} src={returnType(a.type)} alt="type" onClick={e => handleFile(a, 2)} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h6 style={cS2} onClick={e => handleFile(a, 2)}>{`${a.name}`}</h6>
                    {a.postedby && a.postedby.name ? <h6 style={{ fontSize: '12px', color: 'gray' }}>By {a.postedby.name} on {a.date && renderDate(a.date)}</h6> :
                        <h6 style={{ fontSize: '12px', color: 'gray' }}>By {profile.name} on {a.date && renderDate(a.date)}</h6>}
                </div>
                <div style={tM} onClick={e => a && a._id && setTempFId(a._id)} />
            </div>)
        }
        return <> </>
    };

    const handleUpdateAuto = (at, ct) => {
        var arr = [], cats = [];
        if (c && title && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable
            };
            updateNote(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    }

    const handleUpdateSilent = () => {
        var arr = [], cats = [];
        if (c && ((title && Note.title !== title) || (note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) && (Note.text !== note)))) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable
            };
            updateNoteL(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    }


    const handleUpdateTAuto = (at, ct) => {
        let arr = [], cats = [];
        if (c && title && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable,
                status: status, due: due
            };
            updateTask(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    }

    const handleUpdateTSilent = () => {
        var arr = [], cats = [];
        if (c && ((title && Note.title !== title) || (note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) && (Note.text !== note)))) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable,
                status: status, due: due
            };
            updateTaskL(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    }

    const handleUpdateRec = (f) => {
        var arr = [], cats = [];
        if (c && title && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: f && f._id ? f._id : '', editable: cbEditable,
                status: status, due: due
            };
            updateTask(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    }

    const handleConfirm = (value) => {
        if (value) {
            setIT(true);
            convertNote({ _id: id });
        }

        return setMDLT(false);
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

        if (Note.isTask) handleUpdateTAuto(at, tempCat);
        else handleUpdateAuto(at, tempCat);
    }

    const removeRec = fId => {
        let data = { _id: fId };
        deleteRec(data);
        setRec('');
    }

    const handleModalCat = (e, val) => setMDF(val);

    const renderCat = () => {

        if (ct && ct.length > 0) {
            let list = ct.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });

            return list.map(a => <div key={a._id} className="nt-f-w" style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {a && a.uId && <Link style={{ marginLeft: '10px', marginTop: '0px' }} to={`/organization/${a.org}/shared/${a.uId._id}/category/${a._id}/list`}>{`${a && a.name}`}</Link>}
                    {a.uId && a.uId.name ? <h6 style={{ marginLeft: '10px', fontSize: '12px', color: 'gray' }}>By {a.uId.name} on {a.date && renderDate(a.date)}</h6> :
                        <h6 style={{ marginLeft: '10px', fontSize: '12px', color: 'gray' }}>By {profile.name} on {renderDate(a.date)}</h6>}
                </div>
                <div style={tM2} onClick={e => a && a._id && setTempCId(a._id)} />
            </div>);
        }

        return <> </>
    };

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);
    const onhandleS = s => setS(s);
    const onhandleL2 = n => setL2(n);
    const onhandleLM2 = n => setLM2(n);
    const onhandleS2 = s => setS2(s);

    const removeCat = (isTrue) => {
        if (!isTrue) return setTempCId('');
        let tempFile = ct;
        tempFile = tempFile.filter(tF => tF._id !== tempCId);

        if (Note.isTask) handleUpdateTAuto(at, tempFile);
        else handleUpdateAuto(at, tempFile);
    }

    const handleModalC = (e, val) => setMC(val);
    const handleModalCV = (e, val) => setMCV(val);
    const handleRec = fData => {
        setRec(fData);
        handleUpdateRec(fData);
        setMC(false);
        setMCV(false);
    }

    const handleModalView = (e, val) => setMF(val);
    const handleInput = e => { setT(e.target.value); errT && setErrT(false); }

    const handleInputD = e => {
        setDue(e.target.value.substring(0, 10));
        handleUpdateTSilentData('due', e.target.value.substring(0, 10));
        errD && setErrD(false);
    }

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-name')) {
            setStatus(e.target.options[selectedIndex].getAttribute('data-name'));
            handleUpdateTSilentData('status', e.target.options[selectedIndex].getAttribute('data-name'));
        }
    }

    const handleUpdateTSilentData = (field, value) => {
        var arr = [], cats = [];
        if (c && title && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: title, text: note, color: c, fileList: arr, catList: cats,
                _id: id, recId: rec && rec._id ? rec._id : '', editable: cbEditable,
                status: status, due: due
            };

            if (field === 'due') data.due = value;
            else if (field === 'status') data.status = value;
            updateTaskL(data);
        } else {
            !title && setErrT(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    }

    return <div className="col-11 nt-w p-0">
        <h4 className="h">{Note.isTask ? 'Task' : 'Note'}</h4>
        <Tabnav items={[title]} i={tabNav} setI={setTN} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px', marginBottom: '12px', alignItems: 'center' }}>
            <h6 className={`order`} style={{ position: 'relative', marginTop: '0px', marginBottom: '-2px' }} onClick={e => setActT(!activeT)}>
                <div style={{ width: '14px', height: '14px', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" ref={node} style={{ display: `${activeT ? 'flex' : 'none'}` }}>
                    {!isTask ?
                        <h6 className='s-l' style={bSE} onClick={e => setSHMOD(true)}>Share Note</h6> :
                        <h6 className='s-l' style={bSE} onClick={e => setSHMOD(true)}>Share Task</h6>}
                    <h6 className='s-l' style={bSE} onClick={e => {
                        setActT(false);
                        setMD(true);
                    }}>Attach From My Space</h6>
                    <h6 className='s-l' style={bSE} onClick={e => {
                        setActT(false);
                        setModal(true);
                    }}>Attach From PC</h6>
                    <h6 className='s-l' style={bSE} onClick={e => {
                        setActT(false);
                        setMDF(true);
                    }}>Attach Folder</h6>
                    {!isTask && <h6 className='s-l' style={bSE} onClick={e => {
                        setActT(false);
                        setMDLT(true);
                    }}>Convert To Task</h6>}
                    {!rec && <>
                        <h6 className='s-l' style={bSE} onClick={e => {
                            setActT(false); setMCV(true);
                        }}>Record Video</h6>
                        <h6 className='s-l' style={bSE} onClick={e => {
                            setActT(false); setMC(true);
                        }}>Record Audio</h6>
                    </>}
                    <h6 className='s-l' onClick={e => {
                        setActT(false);
                        setMDL(true)
                    }}>Delete {isTask ? 'Task' : 'Note'}</h6>
                </div>
            </h6>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className="col-lg-8 col-12">
                <div style={{ width: '100%' }}>
                    <Suspense fallback={<></>}> <FileText t={'TITLE'} plh={`Enter note title`} type={'text'} val={title}
                        onMouseLeave={e => {
                            Note.isTask ? handleUpdateTSilent() : handleUpdateSilent();
                        }} onMouseEnter={e => {
                            Note.isTask ? handleUpdateTSilent() : handleUpdateSilent();
                        }} handleInput={handleInput} err={errT} /> </Suspense>
                    <h6 style={iS}>NOTE</h6>
                    <Suspense fallback={<></>}>
                        <div className="col-12 p-0" onMouseLeave={e => {
                            Note.isTask ? handleUpdateTSilent() : handleUpdateSilent();
                        }} onMouseEnter={e => {
                            Note.isTask ? handleUpdateTSilent() : handleUpdateSilent();
                        }}>
                            <ReactQuill theme="snow" value={note} onChange={n => {
                                setNote(n); lEx && setLEX(false)
                            }} style={{ width: '90%' }} />
                        </div>
                    </Suspense>
                    {lEx && <div style={{ width: '90%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', position: 'relative' }}>
                        <h6 style={eS}>Note Size Exceeds 100mb.</h6>
                    </div>}
                    {isTask && <>
                        <h6 style={iS}>DUE DATE</h6>
                        <div className="input-group" style={iG}>
                            <input type={'date'} min={(new Date(Date.now()).toISOString()).slice(0, 10)} className="form-control" placeholder={'Select Date'} value={due} onChange={e => handleInputD(e)} />
                        </div>
                        {errD && <div style={eS}>This field is required</div>}
                        <h6 style={iS}>STATUS</h6>
                        <select className="form-control" style={{ width: '90%' }} defaultValue={status} onChange={e => handleSelect(e)}>
                            {['Open', 'In Progress', 'On Hold', 'Completed', 'Closed'].map((i, k) => <option key={k} value={i} data-name={i}>{i}</option>)}
                        </select>
                    </>}
                    <h6 style={iS}>SHARING PERMISSIONS</h6>
                    {<Suspense fallback={<></>}>
                        <CB i={'cbEditable'} t='Editable' c={cbEditable} onhandleCB={handleCBE} />
                    </Suspense>}
                    {ct && ct.length > 0 && <>
                        <h6 style={iS}>ATTACHED FOLDER</h6>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                            {renderCat()}
                        </div>
                    </>}
                    {at && at.length > 0 && <>
                        <h6 style={iS}>ATTACHED FILE</h6>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                            {renderFile()}
                        </div>
                    </>}
                    <h6 style={iS}>RECORDING</h6>
                    {rec ? <div className="nt-f-w">
                        <img src={returnType(rec.type)} alt="type" onClick={e => handleFile(rec, 1)} />
                        <h6 onClick={e => handleFile(rec, 1)}>{`${rec.name}`}</h6>
                        <div style={tM} onClick={e => removeRec(rec._id)} />
                    </div> : <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <button className="btn btn-dark" type='button' onClick={e => setMCV(true)} style={{ marginRight: '12px' }}>Record video<div className="faS" style={{ backgroundImage: `url('${VC}')` }} /></button>
                            <button className="btn btn-dark" type='button' onClick={e => setMC(true)}>Record audio<div className="faS" style={{ backgroundImage: `url('${MP}')` }} /></button>
                        </div>}
                    <h6 style={iS}>COLOR</h6>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                        {renderColor()}
                    </div>
                </div>
            </div>
            <Discussion id={id} message={message} setMessage={setMessage} updateChat={updateChat} count={count} profile={profile} isEdt={false}
                addComment={addComment} discussions={discussions} updated={updated} offset={offset} setOF={setOF} />
        </div>

        {tempFId && <DeleteModal handleModalDel={e => removeFile(false)} handleDelete={async e => removeFile(true)}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {tempCId && <DeleteModal handleModalDel={e => removeCat(false)} handleDelete={async e => removeCat(true)}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {modalDel && <DeleteModal handleModalDel={e => setMD(false)} handleDelete={async e => {
            let data = { _id: id, org: org, uId: _id };
            isTask ? deleteTask(data) : deleteNote(data);
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {mdlT && <DeleteModal handleModalDel={e => handleConfirm(false)} handleDelete={async e => {
            handleConfirm(true);
        }}>
            <p style={mT}>This will convert this note to task. Are you sure? </p>
        </DeleteModal>}

        {shMod && <Assigned id={org} isTask={isTask} _id={_id} nId={id} limit={limit} limitMult={limitMult} string={string1} limit2={limit2} limitMult2={limitMult2} string2={string2} tabNav={tabNav}
            handleL={onhandleL} handleLM={onhandleLM} handleS={onhandleS} handleL2={onhandleL2} handleLM2={onhandleLM2} handleS2={onhandleS2} type={typeF} setType={setTF}
            onhandleModal={e => setSHMOD(false)} />}

        {modal && <CreateFileModal id={org} _id={_id} setting={setting && setting.setting} onhandleModal={onhandleModal} />}
        {MF && <Suspense fallback={<></>}> <ModalFolder _id={_id} org={org} onAttach={attachCat} onhandleModal={handleModalCat} /> </Suspense>}
        {ModalF && f && <Suspense fallback={<></>}> <ModalFile file={f} onhandleModalView={handleModalView} t={t} /> </Suspense>}
        {MD && <Suspense fallback={<></>}> <Modal _id={_id} org={org} onAttach={attachFile} onhandleModal={handleModal} /> </Suspense>}
        {MC && <Suspense fallback={<></>}> <ModalRec noteName={title} _id={_id} org={org} onhandleModal={handleModalC} fileL={setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5} onSubmit={handleRec} /> </Suspense>}
        {MCV && <Suspense fallback={<></>}>  <ModalRecV noteName={title} _id={_id} org={org} onhandleModal={handleModalCV} fileL={setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5} onSubmit={handleRec} /> </Suspense>}
    </div>

}

const mapStateToProps = state => {
    return {
        setting: state.setting.data
    }
}

export default connect(mapStateToProps, {
    updateNote, deleteRec, addComment, convertNote, updateTask, updateTaskL, updateNoteL,
    deleteTask, deleteNote
})(Details);