import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { generateUrl } from '../../../redux/actions/clientFilesAction';
import { ModalProcess } from '../../../redux/actions/profileActions';
import ModalL from '../../containers/linkContainer';
const mT = { marginTop: '12px', backgroundColor: '#dfe6e9', padding: '4px 12px 4px 12px', borderRadius: '4px', cursor: 'pointer', wordBreak: 'break-all' };

const Modal = ({ _id, catId, showModal, generateUrl, ModalProcess }) => {
    const [link, setLink] = useState(''), [date, setDate] = useState(new Date(Date.now()).toISOString().substr(0, 10)), [check, setChecked] = useState(false);

    useEffect(() => setLink(`https://demo1client.file-o.com/client/${_id}/file/upload`), [setLink, _id, catId]);

    const onhandleModal = (e, val) => showModal(e, val);

    const copyText = async e => {
        let data = {
            _id,
            cat: ''
        };

        if (check) data.date = date;

        generateUrl(data);
        await navigator.clipboard.writeText(link);
        data.date && ModalProcess({ title: 'Link', text: `This link will expire on ${data.date}.` });
        onhandleModal(e, false);
    }

    return <ModalL handleModal={onhandleModal} onCopyText={copyText}>
        <p style={mT} onClick={e => copyText(e)}>{link}</p>
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h6 className="mr-auto" style={{ fontWeight: '400' }}>Expiration</h6>
            <div className="form-switch">
                <input type="checkbox" style={{ marginTop: '-12px' }}
                    onChange={e => setChecked(e.target.checked)}
                    className="form-check-input"
                />
            </div>
        </div>
        {check && <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div className="input-group" style={{ marginRight: '16px', minWidth: '40%' }}>
                <input
                    type={'date'} className="form-control" placeholder={'Select expiry date'}
                    min={new Date(Date.now()).toISOString().substr(0, 10)} value={date} onChange={e => setDate(e.target.value.substr(0, 10))}
                />
            </div>
        </div>}
        <p style={{ fontSize: '12px', color: 'gray', fontWeight: '400' }}>Disable this link on a specific date.</p>
    </ModalL>
}

export default connect(null, { generateUrl, ModalProcess })(Modal);