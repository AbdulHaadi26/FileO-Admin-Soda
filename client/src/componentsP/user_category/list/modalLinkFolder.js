import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { generateUrlC } from '../../../redux/actions/personal/clientFilesAction';
import { ModalProcess } from '../../../redux/actions/profileActions';
import { clientUrl } from '../../../utils/api';
import ModalL from '../../containers/linkContainer';
const mT = { marginTop: '12px', backgroundColor: '#dfe6e9', padding: '4px 12px 4px 12px', borderRadius: '4px', cursor: 'pointer', wordBreak: 'break-all' };

const Modal = ({ catId, showModal, generateUrlC, ModalProcess }) => {
    const [link, setLink] = useState(''), [date, setDate] = useState(new Date(Date.now()).toISOString().substr(0, 10)), [check, setChecked] = useState(false);

    useEffect(() => setLink(`${clientUrl}/shared/category/${catId}`), [setLink, catId]);

    const onhandleModal = (e, val) => showModal(val);

    const copyText = async e => {
        let data = {
            cat: catId
        };

        if (check) data.date = date;

        generateUrlC(data);

        await navigator.clipboard.writeText(link);
        data.date && ModalProcess({ title: 'Link', text: `This link will expire on ${data.date}.` });
        onhandleModal(false);
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
        <h6 style={{ fontSize: '12px', color: 'gray', fontWeight: '400' }}>Disable this link on a specific date.</h6>
    </ModalL>
}

export default connect(null, { generateUrlC, ModalProcess })(Modal);