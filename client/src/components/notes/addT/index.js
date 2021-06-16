import React, { useState, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import '../snow.css';
import { registerTask, deleteRec, clearNote } from '../../../redux/actions/noteActions';
import returnType from '../../types';
import RegisterC from '../../containers/registerContainer';
import Attach from '../../../assets/attach.svg';
import MP from '../../../assets/mp2.svg';
import VC from '../../../assets/vc1.svg';
import Cross from '../../../assets/cross.svg';
import Folder from '../../../assets/folder.svg';
import CreateFileModal from '../../user_files/addModal';
import Icons from '../modals/icons';
import Assigned from '../modals/sharedT';
import history from '../../../utils/history';
const ModalFolder = lazy(() => import('../modals/attach'));
const CB = lazy(() => import('./cb'));
const ModalRec = lazy(() => import('../modelRec'));
const ModalRecV = lazy(() => import('../modelRecVideo'));
const ModalFile = lazy(() => import('../modelView'));
const InputText = lazy(() => import('../../inputs/inputText'));
const ReactQuill = lazy(() => import('react-quill'));
const iG = { marginTop: '2px', width: '90%' };
const iS = { margin: '16px 0px 8px 0px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const eS = { width: '100%', fontWeight: 700, color: '#b33939', fontSize: '12px', marginTop: '8px' };

const Add = ({ org, _id, registerTask, setting, deleteRec, noteS, clearNote, profile }) => {
    const [note, setNote] = useState(''), [v, setV] = useState(''), [at, setAT] = useState([]),
        [errV, setErrV] = useState(false), [f, setF] = useState(''), [ModalF, setMF] = useState(''), [MC, setMC] = useState(false), [MCV, setMCV] = useState(false), [ct, setCT] = useState([]), [lEx, setLEX] = useState(false),
        [fd, setFD] = useState(''), [t, setT] = useState(2), [cbEditable, setCBE] = useState(false), [modal, setModal] = useState(false), [MF, setMDF] = useState(false),
        [due, setDue] = useState(''), [status, setStatus] = useState('Open'), [errD, setErrD] = useState(false), [icon, setIcon] = useState(0), [cId, setCId] = useState('');

    const handleSubmit = e => {
        e.preventDefault();
        var arr = [], cats = [];
        if (v && (note ? (((new TextEncoder().encode(note)).length) / (1024 * 1024) < 98) : true)) {
            if (at && at.length > 0) at.map(a => arr.push({ _id: a._id, date: a.date }));
            if (ct && ct.length > 0) ct.map(c => cats.push({ _id: c._id, date: c.date }));
            let data = {
                title: v, text: note, org: org, _id: _id, color: '',
                fileList: arr, recId: fd && fd._id ? fd._id : '',
                editable: cbEditable, catList: cats, isTask: true,
                status: status, due: due, icon
            };
            registerTask(data);
        } else {
            !v && setErrV(true);
            note && (((new TextEncoder().encode(note)).length) / (1024 * 1024) > 98) && setLEX(true);
        }
    };

    const handleModalView = (e, val) => setMF(val);


    const handleInputD = e => { setDue(e.target.value.substring(0, 10)); errD && setErrD(false); }

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-name') && setStatus(e.target.options[selectedIndex].getAttribute('data-name'));
    };

    const onhandleModal = (file, val) => {
        if (file) {
            let tempFile = at ? at : [];
            var bool = false;
            tempFile.map(tF => {
                if (tF._id === file._id) bool = true;
                return tF;
            });
            if (!bool) {
                tempFile.push({
                    _id: file.versionId, name: file.name, type: file.type,
                    url: file.url, date: new Date(Date.now()).toISOString()
                });
            }
            setAT(tempFile);
        }
        setModal(val);
    }

    const attachFile = (e, file) => {
        var bool = false;
        let tempFile = at;
        tempFile.map(tF => {
            if (tF._id === file._id) bool = true;
            return tF;
        });
        if (!bool) {
            tempFile.push({
                _id: file._id, name: file.name, type: file.type,
                url: file.url, date: new Date(Date.now()).toISOString()
            });
        }
        setAT(tempFile);
        setMDF(false);
    }

    const attachCat = (e, cat) => {
        var bool = false;
        let tempCat = ct;
        tempCat.map(tF => {
            if (tF._id === cat._id) bool = true;
            return tF;
        });
        if (!bool) {
            tempCat.push({
                _id: cat._id, name: cat.name,
                uId: cat.uId, date: new Date(Date.now()).toISOString()
            });
        }
        setCT(tempCat);
        setMDF(false);
    };

    const removeFile = id => {
        let tempFile = at;
        tempFile = tempFile.filter(tF => tF._id !== id);
        setAT(tempFile);
    };

    const removeCat = id => {
        let tempFile = ct;
        tempFile = tempFile.filter(tF => tF._id !== id);
        setCT(tempFile);
    };

    const renderFile = () => at && at.length > 0 && at.map(a => <div key={a._id} className="col-lg-2 col-4 mFWS">
        <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '8px', width: 'fit-content' }}>
            <div onClick={e => removeFile(a._id)} style={{
                width: '18px', height: '18px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
            }}>
                <div style={{ width: '10px', height: '10px', cursor: 'pointer', backgroundImage: `url('${Cross}')` }} />
            </div>
        </h6>
        <img src={returnType(a.type)} style={{ width: '80%' }} alt="File" onClick={e => {
            setT(2);
            setF(a);
            setMF(true);
        }} />
        <h6 style={{ fontSize: '12px', marginTop: '6px', wordBreak: 'break-all' }} onClick={e => {
            setT(2);
            setF(a);
            setMF(true);
        }}>{a.name.length > 35 ? `${a.name.substr(0, 35)}...` : a.name}</h6>
    </div>);

    const renderCat = () => ct && ct.length > 0 && ct.map(a => <div key={a._id} className="col-lg-2 col-4 mFWS">
        <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '8px', width: 'fit-content' }}>
            <div onClick={e => removeCat(a._id)} style={{
                width: '18px', height: '18px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
            }}>
                <div style={{ width: '10px', height: '10px', cursor: 'pointer', backgroundImage: `url('${Cross}')` }} />
            </div>
        </h6>
        <img src={Folder} style={{ width: '80%' }} alt="Folder" />
        <h6 style={{ fontSize: '12px', marginTop: '6px', wordBreak: 'break-all' }}>{a.name.length > 35 ? `${a.name.substr(0, 35)}...` : a.name}</h6>
    </div>);

    const handleCBE = e => setCBE(e.target.checked);

    const handleModalC = (e, val) => setMC(val);

    const handleModalCV = (e, val) => setMCV(val);

    const handleInput = e => {
        setV(e.target.value);
        setErrV(false);
    };

    const handleRec = fData => {
        setFD(fData);
        setMC(false);
        setMCV(false);
    };

    const handleNote = value => {
        setNote(value);
        lEx && setLEX(false)
    };

    const removeRec = fId => {
        var data = { _id: fId };
        deleteRec(data);
        setFD('');
    };

    return <RegisterC onSubmit={handleSubmit} text={'Add Task'}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', position: 'relative' }}>
            <button className="btn btn-primary btn-send" type="submit">Add Task</button>
        </div>
        <Suspense fallback={<></>}> <InputText t={'TITLE'} plh={`Enter task title`} tp={'text'} val={v} handleInput={handleInput} err={errV} /> </Suspense>
        <h6 style={iS}>Task</h6>
        <Suspense fallback={<></>}>
            <ReactQuill theme="snow" value={note} onChange={handleNote} style={{ width: '90%' }} />
        </Suspense>
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
        <h6 style={iS}>ATTACH FOLDER/FILE</h6>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {renderCat()}
            {renderFile()}
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', position: 'relative' }}>
            <button className="btn btn-dark" type='button' onClick={e => setMDF(true)}>Attach
            <div className="faS" style={{ backgroundImage: `url('${Attach}')` }} /></button>
        </div>
        <h6 style={iS}>RECORDING</h6>
        {fd ? <div className="col-lg-2 col-4 mFWS">
            <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '8px', width: 'fit-content' }}>
                <div onClick={e => removeRec(fd._id)} style={{
                    width: '18px', height: '18px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                    justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
                }}>
                    <div style={{ width: '10px', height: '10px', cursor: 'pointer', backgroundImage: `url('${Cross}')` }} />
                </div>
            </h6>
            <img src={returnType(fd.type)} style={{ width: '80%' }} alt="File" onClick={e => {
                setT(2);
                setF(fd);
                setMF(true);
            }} />
            <h6 style={{ fontSize: '12px', marginTop: '6px' }} onClick={e => {
                setT(2);
                setF(fd);
                setMF(true);
            }}>{`${fd.name}`}</h6>
        </div> : <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <button className="btn btn-dark" type='button' onClick={e => setMCV(true)} style={{ marginRight: '12px' }}>Record video<div className="faS" style={{ backgroundImage: `url('${VC}')` }} /></button>
            <button className="btn btn-dark" type='button' onClick={e => setMC(true)}>Record audio<div className="faS" style={{ backgroundImage: `url('${MP}')` }} /></button>
        </div>}
        <h6 style={iS}>ICON</h6>
        <Icons i={icon} setI={setIcon} isTask={true} />

        {noteS && <Assigned id={org} isShow={true} isTask={true} _id={_id} nId={noteS} onhandleModal={e => {
            clearNote();
            history.push(`/organization/${org}/myspace/user/${_id}/notes/list/page/1`);
        }} />}

        {modal && <CreateFileModal id={org} _id={_id} setting={setting && setting.setting} onhandleModal={onhandleModal} />}
        {ModalF && f && <Suspense fallback={<></>}> <ModalFile uId={profile && profile._id} file={f} onhandleModalView={handleModalView} t={t} /> </Suspense>}
        {MF && <Suspense fallback={<></>}> <ModalFolder setModal={e => {
            setMDF(false);
            setCId('');
            setModal(true);
        }} _id={_id} org={org} onAttachCat={attachCat} onAttachFile={attachFile} cId={cId} setCId={setCId} onhandleModal={e => {
            setMDF(false);
            setCId('');
        }} /> </Suspense>}
        {MC && <Suspense fallback={<></>}> <ModalRec isTask={true} noteName={v} _id={_id} org={org} onhandleModal={handleModalC} fileL={setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5} onSubmit={handleRec} /> </Suspense>}
        {MCV && <Suspense fallback={<></>}> <ModalRecV isTask={true} noteName={v} _id={_id} org={org} onhandleModal={handleModalCV} fileL={setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5} onSubmit={handleRec} /> </Suspense>}
    </RegisterC>
}

const mapStateToProps = state => {
    return {
        setting: state.setting.data,
        noteS: state.Note.noteS
    }
};

export default connect(mapStateToProps, { registerTask, deleteRec, clearNote })(Add);