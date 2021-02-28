import React from 'react';
import { connect } from 'react-redux';
import { downloadFile } from '../../../redux/actions/userFilesActions';

const ButtonDown = ({ id, downloadFile }) => <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
    <button className="btn btn-dark" onClick={e => downloadFile(id)}>
        Download <span className="fa fa-download" style={{ marginLeft: '8px' }}></span>
    </button>
</div>

export default connect(null, { downloadFile })(ButtonDown);