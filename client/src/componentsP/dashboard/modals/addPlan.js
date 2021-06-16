import React, { useState } from 'react';
import Modal from '../../containers/modalBgContainer';
const iG = { marginTop: '12px', width: '100%' };

export default ({ onhandleModal, onhandleAdd }) => {
    const [text, setText] = useState(''), [date, setDate] = useState('');

    const addHours = function (date, h) {
        date.setTime(date.getTime() + (h * 60 * 60 * 1000));
        return date;
    }

    let dateMin = new Date(Date.now());
    dateMin = addHours(dateMin, (-(dateMin.getDay() - 1) * 24))
    dateMin = new Date(dateMin);
    dateMin = dateMin.toISOString().slice(0, 10);

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => {
            e.preventDefault();
            text && date && onhandleAdd(text, date);
        }}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>New Plan</h3>
            <hr />
            <div className="col-12" style={{ padding: '6px 12px' }}>
                <div className="input-group" style={iG}>
                    <input type={'text'} className="form-control" placeholder={'Plan name'} value={text}
                        onChange={e => setText(e.target.value)} required={true} />
                </div>
                <div className="input-group" style={iG}>
                    <input type={'date'} min={dateMin} className="form-control"
                        placeholder={'Select Date'} value={date}
                        required={true}
                        onChange={e => {
                            let dateN = new Date(e.target.value);
                            dateN = addHours(dateN, (-(dateN.getDay() - 1) * 24))
                            dateN = new Date(dateN);
                            setDate(dateN.toISOString().substr(0, 10))
                        }} />
                </div>
            </div>
            <hr />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
                <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    onhandleModal();
                }}>Cancel</button>
                <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>Save</button>
            </div>
        </form>
    </Modal>
};
