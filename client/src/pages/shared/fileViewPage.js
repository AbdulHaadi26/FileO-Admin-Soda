import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getDiscussion } from '../../redux/actions/discussionActions';
import { getFileShared } from '../../redux/actions/userFilesActions';
import Container from '../container';
const ViewFile = lazy(() => import('../../components/shared/view'));

const ViewPage = ({ match, getFileShared, profile, isSuc, file, isErr, discussion, count, getDiscussion }) => {
    const { _id, id, fId } = match.params, [tabNav, setTN] = useState(0), [offset, setOF] = useState(12), [updated, setUpdated] = useState('');

    useEffect(() => {
        async function fetch() {
            let data = { _id: fId };
            await getFileShared(data);
            await getDiscussion({ _id: fId, offset: 0 }, 0);
            setUpdated(new Date(Date.now()).toISOString());
        }
        fetch();
    }, [getFileShared, getDiscussion, fId]);


    const udpateDiscussion = async() => {
        await getDiscussion({ _id: fId, offset: Math.floor(offset / 12) }, 1);
        setOF(offset + 12);
    };

    const updateChat = async () => {
        await getDiscussion({ _id: fId, offset: 0 }, 2);
        setUpdated(new Date(Date.now()).toISOString())
    };

    return <Container profile={profile} num={15} isErr={isErr} isSuc={isSuc && file} eT={'Shared File Not Found'}>
        <ViewFile discussion={discussion} _id={fId} profile={profile && profile.user} count={count} offset={offset} setOF={udpateDiscussion} updated={updated}
            updateChat={updateChat} File={file} id={id} uId={_id} fId={fId} tabNav={tabNav} setTN={setTN}
            disabled={profile && profile.user && profile.user.current_employer && profile.user.current_employer.isDisabled}
        />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.File.isErr,
        isSuc: state.File.isSuc,
        file: state.File.data,
        discussion: state.Discussion.list,
        count: state.Discussion.count
    }
}

export default connect(mapStateToProps, { getFileShared, getDiscussion })(ViewPage);