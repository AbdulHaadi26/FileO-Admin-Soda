import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getDiscussion } from '../../redux/actions/discussionActions';
import { getFile } from '../../redux/actions/userFilesActions';
import Container from '../container';
const ViewFile = lazy(() => import('../../components/user_files/view'));

const FileViewPage = ({ match, getFile, profile, isSuc, file, isErr, getDiscussion, discussion, count }) => {
    const { _id, id, uId } = match.params, [tabNav, setTN] = useState(0), [offset, setOF] = useState(12), [updated, setUpdated] = useState('');

    useEffect(() => {
        let data = { _id: _id, pId: uId };
        getFile(data);
        getDiscussion({ _id: _id, offset: 0 }, 0);
        setUpdated(new Date(Date.now()).toISOString());
    }, [getFile, getDiscussion, _id, uId]);

    const getF = () => {
        let data = { _id: _id, pId: uId };
        getFile(data);
    }

    const udpateDiscussion = () => {
        getDiscussion({ _id: _id, offset: Math.floor(offset / 12) }, 1);
        setOF(offset + 12);
    };

    const updateChat = () => {
        getDiscussion({ _id: _id, offset: 0 }, 2);
        setUpdated(new Date(Date.now()).toISOString())
    };

    return <Container profile={profile} num={14} isErr={isErr} isSuc={isSuc && file} eT={'User File Not Found'}>
        <ViewFile discussion={discussion} _id={_id} profile={profile && profile.user} count={count} offset={offset} setOF={udpateDiscussion} updated={updated}
            updateChat={updateChat} getF={getF} File={file} id={id} uId={uId} tabNav={tabNav} setTN={setTN} />
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

export default connect(mapStateToProps, { getFile, getDiscussion })(FileViewPage);