import React, { Suspense, lazy, useEffect } from 'react';
import { connect } from 'react-redux';
import { getFile } from '../../../redux/actions/userFilesActions'
import '../subStyle.css';
const FileType = lazy(() => import('../../containers/fileType'));
const ButtonDown = lazy(() => import('./buttonDown'));
const ButtonDownR = lazy(() => import('./buttonDownRec'));
const fS = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.3', minWidth: '100vw' };
const pS = { position: 'fixed', zIndex: '9999' };
const mB = { maxHeight: '95vh', overflowY: 'scroll' };
const dF = { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' };
const font = { fontSize: '14px', fontWeight: '400', marginBottom: '30px' };

const ModalFileView = ({ file, onhandleModalView, t, getFile, uId, File }) => {

    useEffect(() => {
        let data = { _id: file._id, pId: uId };
        t === 2 && getFile(data)
    }, [getFile, uId, file._id, t]);

    let latestFile = file;

    if (File && File.versions && File.file) {
        let latestVersion = File.versions.length - 1;

        File.versions = File.versions.sort(function (a, b) {
            var textA = a.version;
            var textB = b.version;
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });

        latestFile = File.versions[latestVersion];
    }

    return <>
        <div style={fS} onClick={e => onhandleModalView(e, false)} ></div>
        <div className="col-lg-8 col-12 modalDiv" style={pS}>
            <div className="modal-content animated fadeInDown faster col-12 p-0 mdl">
                <div className="modal-body" style={mB}>
                    <Suspense fallback={<></>}>
                        <div style={dF}>
                            <h6 style={font}>{file.name}</h6>
                            <span className="fa fa-times" style={{ cursor: 'pointer', marginBottom: '30px' }} onClick={e => onhandleModalView(e, false)} />
                        </div>
                        {t === 2 ?  <FileType type={latestFile.type} url={latestFile.url} name={latestFile.name} />  : <FileType type={file.type} url={file.url} name={file.name} />}
                        {t !== 2 ? <ButtonDownR id={file._id} /> : <ButtonDown id={file._id} />}
                    </Suspense>
                </div>
            </div>
        </div>
    </>
}

const mapStateToProps = state => {
    return {
        isErr: state.File.isErr,
        isSuc: state.File.isSuc,
        File: state.File.data
    }
};

export default connect(mapStateToProps, { getFile })(ModalFileView);