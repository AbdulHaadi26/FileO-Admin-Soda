import React, { useState } from 'react';
import Modal from '../../containers/modalBgContainer';
const iG = { marginTop: '12px', width: '100%' };
const tS = { width: '100%', textAlign: 'left' };

export default ({ onhandleModal, onhandleAdd }) => {
    let dateMin = new Date(Date.now());
    dateMin.setDate(dateMin.getDate() + 1);
    dateMin = dateMin.toISOString().slice(0, 10);

    const [text, setText] = useState(''), [date, setDate] = useState(''), [description, setDescription] = useState(''),
        [p, setP] = useState(0), [questions, setQuestion] = useState([]), [item, setItem] = useState('');

    const [opt0, setOpt0] = useState(''), [opt1, setOpt1] = useState(''), [opt2, setOpt2] = useState(''), [opt3, setOpt3] = useState('');

    const onhandleInputA = e => e.target.value.split(' ').length <= 500 && setDescription(e.target.value);

    const addQuestion = () => {
        let list = questions;

        item && list.push({
            question: item,
            options: [opt0, opt1, opt2, opt3],
            opt1: [],
            opt2: [],
            opt3: [],
            opt4: []
        });

        setQuestion(list);
        setItem('');
        setOpt0('');
        setOpt1('');
        setOpt2('');
        setOpt3('');
    };

    const removeQuestion = (k) => {
        let list = questions;
        list = list.filter((i, key) => k !== key)
        setQuestion(list);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        p < 1 && text && date && setP(p + 1);
        p === 1 && text && date && onhandleAdd(text, date, description, questions);
    };

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => onSubmit(e)}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px', marginRight: '12px' }}>New Poll</h3>
                <div className="input-group col-lg-5 col-7" style={{ marginBottom: '12px', padding: '6px 12px', marginLeft: 'auto', marginTop: '12px' }}>
                    <input type={'date'} min={dateMin} className="form-control"
                        placeholder={'Select Date'} value={date}
                        required={true}
                        onChange={e => {
                            let dateN = new Date(e.target.value);
                            setDate(dateN.toISOString().substr(0, 10))
                        }} />
                </div>
            </div>
            <hr />
            <div className="col-12" style={{ padding: '6px 12px' }}>
                {p === 0 && <>
                    <div className="input-group" style={iG}>
                        <input type={'text'} className="form-control" placeholder={'Poll name'} value={text}
                            onChange={e => setText(e.target.value)} required={true} autoFocus={true} />
                    </div>
                    <div className="input-group" style={{ width: '100%', marginTop: '12px' }}>
                        <textarea type='text' className="form-control" placeholder={'Poll description'} value={description} onChange={e => onhandleInputA(e)} style={tS} />
                    </div>
                </>}
                {p === 1 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    {(!questions || questions.length < 5) && <>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginBottom: '12px', width: '100%' }}>
                            <button className="btn btn-primary" type="button" onClick={e => addQuestion()} style={{ marginLeft: '12px', fontSize: '12px', fontWeight: '600', padding: '4px 16px' }}>Add Question</button>
                        </div>
                        <textarea type='text' className="form-control" placeholder={'Enter question'} value={item}
                            onChange={e => setItem(e.target.value)} style={{ width: '95%' }} />
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            <div className="input-group col-lg-6 col-12" style={iG}>
                                <input type={'text'} className="form-control" placeholder={'Enter option 1'} value={opt0}
                                    onChange={e => setOpt0(e.target.value)} />
                            </div>
                            <div className="input-group col-lg-6 col-12" style={iG}>
                                <input type={'text'} className="form-control" placeholder={'Enter option 2'} value={opt1}
                                    onChange={e => setOpt1(e.target.value)} />
                            </div>
                            <div className="input-group col-lg-6 col-12" style={iG}>
                                <input type={'text'} className="form-control" placeholder={'Enter option 3'} value={opt2}
                                    onChange={e => setOpt2(e.target.value)} />
                            </div>
                            <div className="input-group col-lg-6 col-12" style={iG}>
                                <input type={'text'} className="form-control" placeholder={'Enter option 4'} value={opt3}
                                    onChange={e => setOpt3(e.target.value)} />
                            </div>
                        </div>
                    </>}
                    <div style={{ width: '95%', display: 'flex', flexDirection: 'column' }}>
                        {questions && questions.length > 0 && <hr />}
                        {questions && questions.length > 0 && questions.map((i, k) => {
                            return <div key={k} style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                    <span className="iconDs del" onClick={e => removeQuestion(k)}></span>
                                </div>
                                <h6 style={{ width: '100%', fontSize: '12px', fontWeight: '500' }}>{i.question}</h6>
                            </div>
                        })}
                    </div>
                </div>}
            </div>
            <hr />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
                <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    onhandleModal();
                }}>Cancel</button>
                <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>{p === 1 ? 'Save' : 'Next'}</button>
            </div>
        </form>
    </Modal>
};
