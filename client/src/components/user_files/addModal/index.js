import React, { lazy, Suspense, Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { clearUploadModal, getCatSelect, registerFileMod } from '../../../redux/actions/userFilesActions';
import '../style.css';
import returnType, { finalizeType } from '../../types';
import ModalContainer from '../../../components/containers/modalBgContainer';
import Container from '../../../pages/containerUpt';
const File = lazy(() => import('../selectFile/file'));
const tS = { marginTop: '16px', width: '100%', textAlign: 'left' };
const dF = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const eS = { marginTop: '16px', marginBottom: '12px', marginLeft: '1%', width: '89%', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };

const Add = ({
    list, setting, registerFileMod, id, _id, onhandleModal, clearUploadModal, isUpt, profile, per, fileData, getCatSelect
}) => {
    const [name, setN] = useState(''), [errn, setErrN] = useState(false), [rList, setRL] = useState([]), [tempId, setTI] = useState(''), [size, setS] = useState(0), [fName, setFN] = useState(''),
        [type, setT] = useState(''), [value, setV] = useState(''), [file, setF] = useState(''), [fS, setFS] = useState(''), [description, setDescription] = useState(''),
        [errF, setErrF] = useState(false), [errB, setErrB] = useState(false), [errS, setErrS] = useState(false), [mimeT, setMT] = useState('');

    useEffect(() => {
        getCatSelect(_id);
    }, [getCatSelect, _id]);

    var fileSize = setting && setting.maxFileSize ? setting.maxFileSize : 5;

    useEffect(() => {
        if (list && list.length > 0) {
            setRL(list);
        }
    }, [list, setTI, setRL]);

    const handleSubmit = e => {
        e.preventDefault();
        if (name && fS && !errB && mimeT) {
            setErrB(false); setErrF(false); setErrS(false); setErrN(false);
            var data = { _id: id, name: name, size: size, mime: mimeT, postedby: _id, org: id, category: tempId, type: type, description: description ? description : '', fName: fName };
            registerFileMod(data, file);
        } else {
            !name && setErrN(true);
            !fS && setErrS(true);
        }
    }

    const onhandleInputA = e => e.target.value.split(' ').length <= 500 && setDescription(e.target.value);
    const onhandleInput = e => {
        setN(e.target.value);
        setErrN(false);
    }

    const Submit = async () => {
        await clearUploadModal();
        onhandleModal(fileData, false);
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
    }

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) {
            setTI(e.target.options[selectedIndex].getAttribute('data-key'));
        }
    }

    const renderList = rList => rList.map(item => <option key={item._id} data-key={item._id} data-name={item.name}>{item.name}</option>);

    return <Container profile={profile} num={16} isSuc={!isUpt} onSubmit={Submit} isUpt={isUpt} percent={per}>
        <ModalContainer handleModal={e => onhandleModal('', false)}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Upload File</h3>
            <hr />
            <div className="col-12" style={{ padding: '6px 12px' }}>
                <div className="col-12" style={dF}>
                    <Suspense fallback={<Fragment />}>
                        <File value={value} size={fileSize} errBroken={errB} errFile={errF} errSelected={errS} onhandleFilePreview={handleFilePreview} />
                    </Suspense>
                    <hr style={{ width: '100%' }}></hr>
                </div>
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
                <select style={{ width: '100%' }} className="form-control" onChange={e => handleSelect(e)}>
                    <option value="" selected disabled hidden data-key={''}>Select MySpace Folder (Optional)</option>
                    {rList && rList.length > 0 && renderList(rList)}
                </select>
            </div>
            <hr />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>
                <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    onhandleModal('', false);
                }}>Cancel</button>
                <button className="btn btn-primary" type="button" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    handleSubmit(e);
                }}>Upload</button>
            </div>
        </ModalContainer>
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        list: state.Category.list,
        isUpt: state.File.isUpt,
        per: state.File.per,
        fileData: state.File.data
    }
}

export default connect(mapStateToProps, { registerFileMod, clearUploadModal, getCatSelect })(Add);
