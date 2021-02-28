import React from 'react';
import { connect } from 'react-redux';
import { ModalHide } from '../../redux/actions/profileActions';
import './style.css';

const Toast = ({ data, isSH, ModalHide }) => <div className="toast showing" style={{ display: `${isSH && data ? 'block' : 'none'}` }}>
    <div className="toast-header" style={{ backgroundColor: data && data.isErr ? '#c0392b' : '#2c3e50' }}>
        <strong className="mr-auto">{data && data.title}</strong>
        <button type="button" className="close" style={{ color: 'white', marginBottom: '4px' }} onClick={e => ModalHide()}>
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
    <div className="toast-body">
        {data && data.text}
    </div>
</div>

const mapStateToProps = state => {
    return {
        isSH: state.Modal.isSH,
        data: state.Modal.data
    }
};

export default connect(mapStateToProps, { ModalHide })(Toast);