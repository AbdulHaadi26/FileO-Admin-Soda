import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Container from '../container';
import { fetchNotes } from '../../redux/actions/noteActions';
import { fetchTasks } from '../../redux/actions/taskActions';
import { fetchAttachment } from '../../redux/actions/userFilesActions';
const List = lazy(() => import('../../components/notes/list'));

const ListPage = ({ match, profile, isL, isLA, isLT, fetchNotes, fetchTasks, fetchAttachment }) => {
    const { id, _id, num } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [limitMult, setLM] = useState(0), [limit, setL] = useState(12), [isList, setISL] = useState(false),
        [string2, setS2] = useState(''), [limitMult2, setLM2] = useState(0), [limit2, setL2] = useState(12), [type, setT] = useState('All'), [tabNav, setTN] = useState(Number(num)),
        [typeT, setTypeT] = useState('Name'), [status, setSet] = useState('All'), [stringT, setST] = useState(''), [due, setDue] = useState('Due'),
        [limitT, setLT] = useState(0), [limitMultT, setLMT] = useState(12), [typeN, setTypeN] = useState('All');

    useEffect(() => {
        setTN(Number(num));
        let data;
        switch (Number(num)) {
            case 1:
                data = { _id: _id, offset: 0, status: 'All', type: 'Name', due: 'Due' };
                fetchTasks(data);
                break;
            case 2:
                fetchAttachment({ type: 'All' });
                break;
            default:
                data = { limit: 0, _id: _id, type: 'All' };
                fetchNotes(data);
        }
        setStarted(1);
    }, [num, _id, fetchTasks, fetchAttachment, fetchNotes]);

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);
    const onhandleS = s => setS(s);

    const onhandleL2 = n => setL2(n);
    const onhandleT = n => setT(n);

    const onhandleTN = n => setTypeN(n);
    const onhandleLM2 = n => setLM2(n);
    const onhandleS2 = s => setS2(s);

    const onhandleLT = n => setLT(n);
    const onhandleLMT = n => setLMT(n);

    return <Container profile={profile} isSuc={!isL && !isLA && !isLT && started > 0} num={16}>
        <List org={id} _id={_id} string={string} limitMult={limitMult} limit={limit} tabNav={tabNav}
            string2={string2} limitMult2={limitMult2} limit2={limit2} type={type} isList={isList}
            setTN={setTN} handleS={onhandleS} handleLM={onhandleLM} handleL={onhandleL} handleISL={setISL}
            handleS2={onhandleS2} handleLM2={onhandleLM2} handleL2={onhandleL2} handleT={onhandleT}
            handleTypeT={setTypeT} handleStatus={setSet} status={status} typeT={typeT} limitT={limitT}
            handleST={setST} stringT={stringT} due={due} handleDue={setDue} limitMultT={limitMultT}
            handleLT={onhandleLT} handleLMT={onhandleLMT} handleTypeN={onhandleTN} typeN={typeN}
        />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Note.isL,
        isLA: state.File.isL,
        isLT: state.Task.isL
    }
}

export default connect(mapStateToProps, { fetchNotes, fetchAttachment, fetchTasks })(ListPage);