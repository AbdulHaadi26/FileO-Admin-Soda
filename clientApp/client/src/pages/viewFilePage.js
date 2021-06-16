import React, { lazy, Suspense, useEffect, useState } from 'react';
import Axios from 'axios';
import Loader from '../components/loader/loader';
import { clientUrl } from '../utils/api';
const File = lazy(() => import('../components/fileV'));
const Error = lazy(() => import('../components/file/error'));

export default ({ match }) => {
    const [file, setFile] = useState(''), [err, setErr] = useState(false), [started, setS] = useState(0), [errT, setET] = useState(0);

    useEffect(() => {
        async function fetchFile() {
            try {
                const res = await Axios.post(`${clientUrl}/apiC/shared/file/${match.params._id}`, '');
                if (res.data.error) {
                    setErr(true);
                    setET(res.data.error);
                }
                !res.data.error && res.data.file && setFile(res.data.file);
            } catch (e) {
                setErr(true);
                setET('Unexpected error occured.');
            }
            setS(1);
        }
        fetchFile();
    }, [match.params._id]);

    return <div className="container-fluid">
        <div className="row">
            {started <= 0 && <Loader />}
            <Suspense fallback={<></>}>
                {file && started > 0 && <File file={file} />}
                {err && started > 0 && <Error eT={errT} />}
            </Suspense>
        </div>
    </div>
}