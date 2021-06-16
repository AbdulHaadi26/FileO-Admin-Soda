import React, { lazy, Suspense, Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { registerFile } from '../../../redux/actions/userFilesActions';
import '../style.css';
import returnType, { finalizeType } from '../../types';
import Modal from '../../containers/modalBgContainer';
const File = lazy(() => import('../selectFile/file'));
const dF = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const eS = { marginTop: '16px', marginBottom: '12px', marginLeft: '1%', width: '89%', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const tS = { resize: 'none', height: '60px' };

const Add = ({ setting, registerFile, id, _id, catId, onhandleModal }) => {
    const [name, setN] = useState(''), [errn, setErrN] = useState(false), [size, setS] = useState(0), [fName, setFN] = useState(''),
        [type, setT] = useState(''), [value, setV] = useState(''), [file, setF] = useState(''), [fS, setFS] = useState(''), [description, setDescription] = useState(''),
        [errF, setErrF] = useState(false), [errB, setErrB] = useState(false), [errS, setErrS] = useState(false), [mimeT, setMT] = useState('');

    let fileSize = setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5;

    const handleSubmit = e => {
        e.preventDefault();
        if (name && fS && !errB) {
            setErrB(false); setErrF(false); setErrS(false); setErrN(false);
            let data = {
                _id: id, name: name, size: size, mime: mimeT, postedby: _id,
                org: id, category: catId, type: type,
                description: description ? description : '', fName: fName
            };
            onhandleModal();
            registerFile(data, file);
        } else {
            !name && setErrN(true);
            !fS && setErrS(true);
        }
    }

    const onhandleInputA = e => e.target.value.split(' ').length <= 500 && setDescription(e.target.value);
    const onhandleInput = e => {
        setN(e.target.value);
        setErrN(false);
    };

    const handleFilePreview = e => {
        if (e.target.files && e.target.files[0]) {
            setErrB(false); setErrS(false); setErrF(false);
            var type = e.target.files[0].name.split(".");
            var typeS = finalizeType(type[type.length - 1]);
            setT(typeS);
            setV(returnType(typeS));
            if (e.target.files[0].size <= (fileSize * 1024 * 1024)) {
                setF(e.target.files[0]); setS(e.target.files[0].size); setFS(true);
                setN(type[0]); setMT(e.target.files[0].type); setFN(e.target.files[0].name)
            } else setErrF(true);
        }
    };

    return <Modal handleModal={onhandleModal}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Upload File</h3>
        <hr />
        <div className="col-12" style={dF}>
            <Suspense fallback={<Fragment />}>
                <File value={value} size={fileSize} errBroken={errB} errFile={errF} errSelected={errS} onhandleFilePreview={handleFilePreview} />
            </Suspense>
        </div>
        <hr />
        <div className="col-12" style={{ padding: '6px 12px' }}>
            <div className="input-group" style={{ width: '100%', marginTop: '12px' }}>
                <input type={'text'} className="form-control" placeholder={'File name'} value={name} onChange={e => onhandleInput(e)} />
            </div>
            {errn && <div style={eS}>This field is required</div>}
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
        setting: state.setting.data
    }
};

export default connect(mapStateToProps, { registerFile })(Add);