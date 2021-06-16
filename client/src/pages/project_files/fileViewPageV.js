import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getDiscussion } from '../../redux/actions/discussionActions';
import { getFile } from '../../redux/actions/project_filesActions';
import Container from '../container';
const ViewFile = lazy(() => import('../../components/project_files/viewByVersion'));

const ViewPage = ({ getFile, profile, isSuc, file, isErr, match, getDiscussion, count, discussion }) => {
    const { _id, id, pId, ver } = match.params, [tabNav, setTN] = useState(0), [offset, setOF] = useState(12), [updated, setUpdated] = useState('');

    useEffect(() => {
        async function fetch() {
            let data = { _id: _id, pId: pId };
            await getFile(data);
            await getDiscussion({ _id: _id, offset: 0 }, 0);
            setUpdated(new Date(Date.now()).toISOString());
        };
        fetch();
    }, [getFile, _id, pId, getDiscussion]);

    const udpateDiscussion = async () => {
        await getDiscussion({ _id: _id, offset: Math.floor(offset / 12) }, 1);
        setOF(offset + 12);
    };

    const updateChat = async () => {
        await getDiscussion({ _id: _id, offset: 0 }, 2);
        setUpdated(new Date(Date.now()).toISOString())
    };

    return <Container profile={profile} num={13} isErr={isErr} isSuc={isSuc && file} eT={'Project File Not Found'}>
        <ViewFile ver={Number(ver)} profile={profile && profile.user} File={file} id={id} auth={profile.user.userType === 1} tabNav={tabNav}
            _id={_id} setTN={setTN} count={count} offset={offset} setOF={udpateDiscussion} updated={updated} updateChat={updateChat} discussion={discussion}
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

export default connect(mapStateToProps, { getFile, getDiscussion })(ViewPage);