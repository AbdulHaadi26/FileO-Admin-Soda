import React, { useState } from 'react';
import { connect } from 'react-redux';
import '../style.css';
import returnType, { finalizeType } from '../../types';
import Modal from '../../containers/modalBgContainer';
import { registerFileM } from '../../../redux/actions/personal/userFilesActions';
import Cross from '../../../assets/cross.svg';
import '../style.css';
import File from '../../../assets/static/file.svg';
const iS = { marginTop: '30px', width: '120px', height: '120px', marginBottom: '20px' };
const mB = { marginBottom: '12px', marginLeft: '24px' };
const tS = { marginTop: '16px', width: '90%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };
const eS = { width: '100%', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const dF = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const tM = { width: '12px', height: '12px', marginLeft: '12px', cursor: 'pointer', backgroundImage: `url('${Cross}')` };

const Add = ({ catId, setting, registerFileM, _id, onhandleModal }) => {
    const [errE, setErrE] = useState(false), [arr, setArr] = useState([]), [errS, setErrS] = useState(false), [fl, setFL] = useState([]);

    let fileSize = setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5;

    const handleSubmit = e => {
        e.preventDefault();
        if (arr && arr.length > 0 && fl.length > 0) {
            onhandleModal();
            registerFileM(arr, fl);
        } else {
            arr.length <= 0 && setErrE(true);
        }
    }

    const handleFilePreview = e => {
        var ar = [], fL = [];
        if (e.target.files && e.target.files.length > 0 && e.target.files.length < 11) {
            setErrE(false); setErrS(false);
            for (let i = 0; i < e.target.files.length; i = i + 1) {
                let file = e.target.files[i];
                let type = file.name.split(".");
                if (file.size <= (fileSize * 1024 * 1024)) {
                    let data = {
                        name: file.name, size: file.size, mime: file.type, category: catId, type: finalizeType(type[type.length - 1]),
                        postedby: _id, description: '', fName: file.name
                    };
                    ar.push(data);
                    fL.push(file);
                }
            }
        } else {
            if (!e.target.files || e.target.files.length <= 0) setErrE(true);
            else if (e.target.files.length > 10) setErrS(true);
        }
        setArr(ar); setFL(fL);
    };

    const removeFile = a => {
        let ar = arr;
        ar = ar.filter(i => i.name !== a.name);
        setArr(ar);
    };

    const renderFL = () => arr.map(a => <div key={a.name} className="nt-f-w">
        <img src={returnType(a.type)} alt="type" />
        <h6 style={{ wordBreak: 'break-all' }}>{`${a.name}`}</h6>
        <div style={tM} onClick={e => removeFile(a)} />
    </div>);

    return <Modal handleModal={onhandleModal}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Upload Files</h3>
        <hr />
        <div className="col-12 p-0" style={dF}>
            <img src={File} alt="User Profile" style={iS} />
            <input type="file" className="btn" style={mB} onChange={e => handleFilePreview(e)} multiple />
            {errE && <div className="mr-auto" style={eS}>No file selected</div>}
            {errS && <div className="mr-auto" style={eS}>Maximum of 10 files can be uploaded</div>}
            <hr style={{ width: '100%' }}></hr>
        </div>
        {arr && arr.length > 0 && <div className="col-12" style={{ padding: '6px 12px' }}>
            <h6 style={tS}>FILES</h6>
            {renderFL()}
        </div>}
        {arr && arr.length > 0 && <hr />}
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

export default connect(mapStateToProps, { registerFileM })(Add);