import React, { lazy, Suspense, Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { registerFileNew, getFileDetailsM } from '../../../redux/actions/project_filesActions';
import '../style.css';
import returnType, { finalizeType } from '../../types';
import Modal from '../../containers/modalBgContainer';
const File = lazy(() => import('../selectFile/file'));
const nS = { marginTop: '12px', width: '90%', textAlign: 'left', fontSize: '14px', fontWeight: '500' };
const dF = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const tS = { resize: 'none', height: '60px' };

const Add = ({ registerFileNew, id, userId, pId, setting, fl, verId, onhandleModal, getFileDetailsM }) => {

    const [_id, setId] = useState(''), [name, setN] = useState(''), [tempId, setTI] = useState(''), [size, setS] = useState(0), [mimeT, setMT] = useState(''), [fName, setFN] = useState(''),
        [type, setT] = useState(''), [value, setV] = useState(''), [file, setF] = useState(''), [fS, setFS] = useState(false), [errF, setErrF] = useState(false),
        [errB, setErrB] = useState(false), [errS, setErrS] = useState(false), [description, setDescription] = useState('');

    let fileSize = setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5;

    useEffect(() => {
        let data = { _id: verId, pId: pId };
        getFileDetailsM(data);
    }, [getFileDetailsM, pId, verId]);

    useEffect(() => {
        if (fl && fl.file && fl.versions && fl.versions.length > 0) {
            const { file } = fl;
            setN(file.name); setTI(file.category._id); setId(file._id);
        }
    }, [fl, setN, setTI, setId]);

    const onhandleInputA = e => e.target.value.split(' ').length <= 500 && setDescription(e.target.value);

    const handleSubmit = e => {
        e.preventDefault();
        if (name && fS && !errB) {
            setErrB(false); setErrF(false);
            let data = { _id: verId, name: name, size: size, mime: mimeT, postedby: userId, org: id, category: tempId, active: true, type: type, fileId: _id, pId: pId, description: description ? description : '', fName: fName };
            onhandleModal();
            registerFileNew(data, file);
        } else {
            !fS && setErrS(true);
        }
    };

    const handleFilePreview = e => {
        if (e.target.files && e.target.files[0]) {
            let file = e.target.files[0];
            setErrB(false); setErrS(false); setErrF(false);
            var type = file.name.split(".");
            var typeS = finalizeType(type[type.length - 1]);
            setT(typeS);
            setV(returnType(typeS));
            if (file.size <= (fileSize * 1024 * 1024)) {
                setF(file); setS(file.size); setFS(true);
                setMT(file.type); setFN(file.name);
            } else setErrF(true);
        }
    };

    return <Modal handleModal={onhandleModal}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Replace Newest Version</h3>
        <hr />
        <div className="col-12" style={dF}>
            <Suspense fallback={<Fragment />}>
                <File value={value} size={fileSize} errBroken={errB} errFile={errF} errSelected={errS} onhandleFilePreview={handleFilePreview} />
            </Suspense>
        </div>
        <hr />
        <div className="col-12" style={{ padding: '6px 12px' }}>
            <h6 style={nS}>{name}</h6>
            <div className="input-group" style={{ width: '100%', marginTop: '12px' }}>
                <textarea type='text' className="form-control" placeholder={'File description'} value={description} onChange={e => onhandleInputA(e)} style={tS} />
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '8px' }}>
                <p className="word-count" style={{ fontSize: '12px' }}>{description.split(" ").length} / 500</p>
            </div>
        </div>
        <hr />
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
            <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                onhandleModal();
            }}>Cancel</button>
            <button className="btn btn-primary" type="button" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                handleSubmit(e);
            }}>Upload</button>
        </div>
    </Modal >
};

const mapStateToProps = state => {
    return {
        setting: state.setting.data,
        fl: state.File.data
    }
};

export default connect(mapStateToProps, { registerFileNew, getFileDetailsM })(Add);