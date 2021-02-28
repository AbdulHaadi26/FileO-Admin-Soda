import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchFile } from '../../redux/actions/sharedFilesAction';
import { fetchNote } from '../../redux/actions/sharedNotesAction';
import { fetchCats } from '../../redux/actions/sharedCatActions';
import Container from '../container';
import { fetchTasks } from '../../redux/actions/sharedTasksActions';
const List = lazy(() => import('../../components/shared/sharedFiles'));

const ListPage = ({ profile, fetchFile, fetchTasks, isL, isLS, isLC, isLT, fetchNote, fetchCats, match }) => {
    const { id, _id, num } = match.params;
    const [started, setStarted] = useState(0), [opt2, setOPT2] = useState('File'), [string, setS] = useState(''), [string3, setS3] = useState(''), [tabNav, setTN] = useState(Number(num)),
        [type, setT] = useState('All'), [limit2, setL2] = useState(12), [limitMult2, setLM2] = useState(0), [opt3, setOPT3] = useState('Note'), [string2, setS2] = useState(''), [opt1, setOPT1] = useState('Category'),
        [isList, setISL] = useState(false), [typeT, setTypeT] = useState('Name'), [status, setSet] = useState('All'), [stringT, setST] = useState(''), [due, setDue] = useState('Due'),
        [limitT, setLT] = useState(0), [limitMultT, setLMT] = useState(12);

    useEffect(() => {
        setTN(Number(num));
        let data;
        switch (Number(num)) {
            case 1:
                data = { _id: _id, type: 'All', search: 'file' };
                fetchFile(data);
                break;
            case 2:
                data = { limit: 0, _id: _id, search: 'note' };
                fetchNote(data);
                break;
            case 3:
                data = { _id: _id, limit: 0, status: 'All', type: 'Name', due: 'Due' };
                fetchTasks(data);
                break;
            default:
                data = { _id: _id, search: 'category' };
                fetchCats(data);
                break;
        }
        setStarted(1);
    }, [fetchFile, _id, setStarted, fetchNote, fetchCats, fetchTasks, num]);

    const onhandleOPT2 = opt => setOPT2(opt);
    const onhandleS = s => setS(s);
    const onhandleT = t => setT(t);
    const onhandleL2 = no => setL2(no);
    const onhandleLM2 = no => setLM2(no);
    const onhandleS2 = s => setS2(s);
    const onhandleOPT3 = opt => setOPT3(opt);
    const onhandleOPT1 = opt => setOPT1(opt);
    const onhandleS3 = s => setS3(s);

    return <Container profile={profile} num={15} isSuc={!isL && !isLS && !isLC && !isLT && started > 0}> <List id={id} _id={_id} opt2={opt2} handleOPT2={onhandleOPT2} opt1={opt1} handleOPT1={onhandleOPT1}
        string={string} limit2={limit2} limitMult2={limitMult2} opt3={opt3} string2={string2} handleL2={onhandleL2} handleLM2={onhandleLM2} handleS2={onhandleS2} handleS={onhandleS} handleOPT3={onhandleOPT3}
        string3={string3} handleS3={onhandleS3} type={type} handleT={onhandleT} tabNav={tabNav} setTN={setTN} isList={isList} handleISL={setISL}
        handleTT={setTypeT} handleTypeT={setTypeT} handleStatus={setSet} status={status} typeT={typeT} limitT={limitT}
        handleST={setST} stringT={stringT} due={due} handleDue={setDue} limitMultT={limitMultT} handleLT={setLT} handleLMT={setLMT}
    /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isLS: state.Note.isL,
        isLC: state.Category.isL,
        isLT: state.Task.isL
    }
}

export default connect(mapStateToProps, { fetchFile, fetchNote, fetchCats, fetchTasks })(ListPage);