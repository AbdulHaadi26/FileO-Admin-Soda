import React from 'react';
import { connect } from 'react-redux';
import LinkC from '../../containers/linkContainer';
const mT = { marginTop: '12px', backgroundColor: '#dfe6e9', padding: '4px 12px 4px 12px', borderRadius: '4px', cursor: 'pointer', wordBreak: 'break-all' };

const Modal = ({ showModal, url }) => {

    const onhandleModal = (e, val) => showModal(val);

    const copyText = async () => {
        if (url) {
            await navigator.clipboard.writeText(url);
            onhandleModal(false, false);
        }
    }

    return <LinkC handleModal={onhandleModal} onCopyText={copyText}>
        <p style={mT} onClick={e => copyText()}> {url ? `${url.slice(0,200)}.........` : ''}</p>
    </LinkC>
}

const mapStateToProps = state => {
    return {
        url: state.File.url
    }
}

export default connect(mapStateToProps)(Modal);