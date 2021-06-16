import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import SimpleLoader from '../../loader/simpleLoader';
import { deletePlanD, registerPlanD, updatePlanD } from '../../../redux/actions/dailyPlanActions';
import Modal from '../../containers/modalBgContainer';

const List = ({ onhandleModal, date, registerPlanD, PlanList, isL, updatePlanD, deletePlanD, disabled }) => {

    const [text, setT] = useState('');

    useEffect(() => {
        setT(PlanList && PlanList.name ? PlanList.name : '');
    }, [PlanList]);

    const onhandleInputA = e => setT(e.target.value);

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <div>
            <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Daily Plans</h3>
            <hr />
            <div className="col-12" style={{ padding: '6px 12px' }}>
                {isL && <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px', marginBottom: '30px' }}>
                    <SimpleLoader />
                </div>}
                {!isL &&
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', marginTop: '12px', marginBottom: '12px' }}>
                        <div className="input-group" style={{ width: '100%' }}>
                            <textarea type='text' style={{ height: '150px', resize: 'none', width: '100%' }} className="form-control" placeholder={'Enter text here'} value={text} onChange={e => onhandleInputA(e)} />
                        </div>
                    </div>}
            </div>
            {!isL && <hr />}
            {!isL && <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
                <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    onhandleModal();
                }}>Cancel</button>
                {(!PlanList || !PlanList._id) ? <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={async e => {
                    !disabled && registerPlanD({ date, name: text });
                    onhandleModal();
                }}>Save</button> : <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={async e => {
                    if (text) updatePlanD({ _id: PlanList._id, name: text });
                    else deletePlanD({ _id: PlanList._id });
                    onhandleModal();
                }}>Update</button>}
            </div>}
        </div>
    </Modal>
};

const mapStateToProps = state => {
    return {
        PlanList: state.PlanD.list,
        isL: state.PlanD.isL
    }
};

export default connect(mapStateToProps, { registerPlanD, updatePlanD, deletePlanD })(List);