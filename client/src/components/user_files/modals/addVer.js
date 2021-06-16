import React, { lazy, Suspense, Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { registerFileVer, getFileDetailsM } from '../../../redux/actions/userFilesActions';
import '../style.css';
import returnType, { finalizeType } from '../../types';
import Modal from '../../containers/modalBgContainer';
const FileS = lazy(() => import('../selectFile/file'));
const tS = { marginTop: '12px', width: '100%', textAlign: 'left', fontSize: '12px' };
const nS = { marginTop: '12px', width: '100%', textAlign: 'left', fontSize: '14px', fontWeight: '500' };
const dS = { display: 'flex', flexDirection: 'column', alignItems: 'center' };

const Add = ({ setting, registerFileVer, getFileDetailsM, id, uId, verId, File, onhandleModal }) => {
    const [name, setN] = useState(''), [tempId, setTI] = useState(''), [size, setS] = useState(0), [description, setDescription] = useState(''),
        [type, setT] = useState(''), [value, setV] = useState(''), [file, setF] = useState(''), [fS, setFS] = useState(''), [fName, setFN] = useState(''),
        [errF, setErrF] = useState(false), [errB, setErrB] = useState(false), [errS, setErrS] = useState(false), [mimeT, setMT] = useState('');

    let fileSize = setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5;

    useEffect(() => {
        let data = { _id: verId, pId: uId };
        getFileDetailsM(data);
    }, [verId, uId, getFileDetailsM]);

    useEffect(() => {
        if (File && File.file) {
            const { file } = File
            setN(file.name); setTI(file.category._id);
        }
    }, [File, setN, setTI]);

    const onhandleInputA = e => e.target.value.split(' ').length <= 500 && setDescription(e.target.value);

    const handleSubmit = e => {
        e.preventDefault();
        if (name && fS && !errB) {
            setErrB(false);
            setErrF(false);
            setErrS(false);
            let data = {
                _id: verId, mime: mimeT, name: name, size: size, postedby: uId, org: id,
                category: tempId, active: true, type: type, description: description ? description : '',
                fName: fName
            };
            onhandleModal();
            registerFileVer(data, file);
        } else !fS && setErrS(true);
    }

    const handleFilePreview = e => {
        if (e.target.files && e.target.files[0]) {
            setErrB(false);
            setErrS(false);
            setErrF(false);
            var type = e.target.files[0].name.split(".");
            var typeS = finalizeType(type[type.length - 1]);
            setT(typeS);
            setV(returnType(typeS));
            if (e.target.files[0].size <= (fileSize * 1024 * 1024)) {
                setF(e.target.files[0]); setS(e.target.files[0].size); setFS(true);
                setMT(e.target.files[0].type); setFN(e.target.files[0].name);
            } else setErrF(true);
        }
    };

    return <Modal handleModal={onhandleModal}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Upload Version</h3>
        <hr />
        <div className="col-12" style={dS}>
            <Suspense fallback={<Fragment />}>
                <FileS value={value} size={fileSize} errBroken={errB} errFile={errF} errSelected={errS} onhandleFilePreview={handleFilePreview} />
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
    </Modal>
}

const mapStateToProps = state => {
    return {
        setting: state.setting.data,
        File: state.File.data
    }
};

export default connect(mapStateToProps, { registerFileVer, getFileDetailsM })(Add);