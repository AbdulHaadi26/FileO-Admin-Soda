import React from 'react';
import { connect } from 'react-redux';
import Modal from '../containers/modalBgContainer';
import { clearCut, uploadType } from '../../redux/actions/fileActions';
const mT = { marginTop: '16px', padding: '6px 12px' };

const UploadFile = ({ getList, file, clearCut, uploadType, handleVer, handleNew }) => {

    return file && file.error === 'File' ? <Modal handleModal={e => {
        clearCut();
        getList();
    }}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Confirmation</h3>
        <hr />
        <p style={mT}>File with this name already exists. Please select option below to proceed.</p>
        <hr />
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
            {file.file.uploadable && file.file.versioning && <button className="btn btn-primary" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={async e => {
                if (file.type !== 1) {
                    await uploadType({ mainFile: file.mainFile._id, file: file.file._id, type: 0 });
                } else if (file.file && file.dataFile) handleVer(file.file, file.dataFile);
                clearCut();
                getList();
            }}>Upload Version</button>}
            <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={async e => {
                if (file.type !== 1) {
                    await uploadType({ mainFile: file.mainFile._id, file: file.file._id, type: 1 });
                } else if (file.file && file.dataFile) handleNew(file.file, file.dataFile);
                clearCut();
                getList();
            }}>Replace Latest</button>
        </div>
    </Modal> : <></>
};

const mapStateToProps = state => {
    return {
        file: state.File.combinedFile
    }
};

export default connect(mapStateToProps, { clearCut, uploadType })(UploadFile);