import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getUser } from '../../redux/actions/projectActions';
import Container from '../container';
const List = lazy(() => import('./userFileCategoriesContainer'));

const ListPage = ({ profile, getUser, isL, isErr, isSuc, emp, match, isLP }) => {
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [tabNav, setTN] = useState(0), [isList, setISL] = useState(false);

    const { id, _id } = match.params;
    useEffect(() => { getUser(_id); }, [_id, getUser]);

    const setStart = () => setStarted(1);
    const onhandleS = s => setS(s);

    return <Container profile={profile} num={13} isSuc={isSuc && emp && emp.user && !isLP && !isL} isErr={isErr && !isL} eT={'Project File Categories Not Found'}>
        {emp && emp.user && <List id={_id} org={id} emp={emp.user} onStart={setStart} started={started} string={string}
            onhandleS={onhandleS} tabNav={tabNav} setTN={setTN} isList={isList} handleISL={setISL} />}
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        emp: state.Employee.data,
        isL: state.Employee.isL,
        isErr: state.Employee.isErr,
        isSuc: state.Employee.isSuc,
        isLP: state.Project.isL
    }
}

export default connect(mapStateToProps, { getUser })(ListPage);