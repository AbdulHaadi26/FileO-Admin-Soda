import React, { useState } from 'react';
import Modal from '../../containers/modalBgContainer';

export default ({ onhandleModal, onhandleAdd, Poll, userId }) => {

    const [opt, setOpt] = useState([-1, -1, -1, -1, -1]);

    const changeOpt = (i, j) => {
        let options = opt;
        options[i] = j;
        setOpt(options);
    };

    let question = Poll.questions;

    const onSubmit = (e) => {
        e.preventDefault();
        let list = question;
        let item;

        question.map((i, k) => {
            if (opt[k] > -1) {
                switch (opt[k]) {
                    case 0: item = i.opt1 && i.opt1.length > 0 ? i.opt1 : [];
                        item.push(userId);
                        list[k].opt1 = item;
                        break;
                    case 1: item = i.opt2 && i.opt2.length > 0 ? i.opt2 : [];
                        item.push(userId);
                        list[k].opt2 = item;
                        break;
                    case 2: item = i.opt3 && i.opt3.length > 0 ? i.opt3 : [];
                        item.push(userId);
                        list[k].opt3 = item;
                        break;
                    case 3:
                        item = i.opt4 && i.opt4.length > 0 ? i.opt4 : [];
                        item.push(userId);
                        list[k].opt4 = item;
                        break;
                    default: break;
                }
            }
            return k;
        });

        onhandleAdd(Poll._id, list);

    };


    return <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => onSubmit(e)}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px', marginRight: '12px' }}>{Poll.name}</h3>
            <hr />
            <div className="col-12" style={{ padding: '6px 12px' }}>
                <p style={{ fontSize: '12px' }}>{Poll.description}</p>
                {Poll.questions && Poll.questions.length > 0 && Poll.questions.map((i, k) => {
                    return <div key={k} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <hr style={{ width: '100%' }} />
                        <h6 style={{ fontSize: '12px', width: '100%' }}><b>{k + 1}-</b>{i.question}</h6>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            {i.options && i.options.length > 0 && i.options.map((l, m) => {
                                return l ? <div className="form-check col-lg-6 col-12" key={m}>
                                    <input className="form-check-input" type="radio" name={`radio-${k}`} id={k + '' + m} value="option1" onChange={e => changeOpt(k, m)} />
                                    <label className="form-check-label" style={{ fontSize: '12px' }} htmlFor={k + '' + m}>
                                        {l}
                                    </label>
                                </div> : <></>
                            })}
                        </div>
                    </div>
                })}
            </div>
            <hr />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
                <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    onhandleModal();
                }}>Cancel</button>
                <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>Submit</button>
            </div>
        </form>
    </Modal>
};
