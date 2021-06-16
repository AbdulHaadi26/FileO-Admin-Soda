import React from 'react';
import { connect } from 'react-redux';
import Modal from '../containers/modalBgContainer';
import { clearCut, deleteFile, cutFile } from '../../redux/actions/personal/clientFilesAction';
const mT = { marginTop: '16px', padding: '6px 12px' };

const UploadFile = ({ file, clearCut, deleteFile, cutFile }) => {
    return file && file.error === 'Client File' ? <Modal handleModal={e => {
        clearCut();
    }}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Confirmation</h3>
        <hr />
        <p style={mT}>File with this name already exists. Please select option below to proceed.</p>
        <hr />
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
            <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={async e => {
                if (file.file && file.cat && file.mainFile) {
                    await deleteFile(file.file, '', '');
                    await cutFile({ _id: file.mainFile, cat: file.cat });
                }
                clearCut();
            }}>Replace</button>
        </div>
    </Modal> : <></>
};

const mapStateToProps = state => {
    return {
        file: state.File.combinedFile
    }
};

export default connect(mapStateToProps, { clearCut, deleteFile, cutFile })(UploadFile);