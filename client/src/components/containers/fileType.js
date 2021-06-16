import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import SimpleLoader from '../loader/simpleLoader';

const fS = {
    height: '800px',
    overflow: 'none',
    marginTop: '20px'
};

const fCS = {
    height: '500px',
    overflow: 'none',
    marginTop: '20px'
};

const fPS = {
    height: '500px',
    overflow: 'none',
    marginTop: '20px'
};

const iC = {
    maxWidth: '100%',
    marginTop: '20px'
};

const vC = {
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.42), 0 2px 4px 0 rgba(0, 0, 0, 0.69)',
    borderRadius: '3px',
    marginTop: '20px'
};

const iS = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px'
};


export default ({ url, name, cmp, width, type, mimeType }) => {
    let eUrl = encodeURIComponent(url);
    let n = fS, p = fPS;
    const [data, setData] = useState(''), [isL, setL] = useState(false);

    useEffect(() => {
        if (type === 'pdf') {
            setL(true);
            Axios.get(url, { responseType: 'blob' }).then(blob => {
                let file = new Blob([blob.data], { type: "application/pdf" })
                setData(URL.createObjectURL(file));
                setL(false);
            }).catch(err => {
                console.log(err);
                setL(false);
            });
        } else if (type === 'text') {
            setL(true);
            Axios.get(url).then(blob => {
                if (blob && blob.data) setData(blob.data);
                setL(false);
            }).catch(err => {
                console.log(err);
                setL(false);
            });
        }
    }, [type, url]);

    if (width === 0 || width >= 992) {
        if (cmp) n = fCS;
    } else {
        n = fCS;
        p = fCS;
    }

    const renderLoader = () => {
        return <div className="col-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '18px', marginBottom: '12px' }}>
            <SimpleLoader/>
        </div>
    };


    switch (type) {
        case 'pdf': return !isL && data ? <object data={data} type="application/pdf" className="col-12 p-0" style={n}>
            <p>This browser does not support PDFs. Please download the PDF to view it: <a href={data}>Download PDF</a>.</p>
        </object> : isL ? <>{renderLoader()}</> : <></>
        case 'word': case 'excel': return <iframe className="col-12 p-0" src={`https://view.officeapps.live.com/op/embed.aspx?src=${eUrl}`} style={n} title={name} />;
        case 'video': return <video className="col-12 p-0" style={vC} controls> <source src={url} type="video/mp4" /> Your browser does not support the video tag.</video>;
        case 'power point': return <iframe className="col-12 p-0" src={`https://view.officeapps.live.com/op/embed.aspx?src=${eUrl}`} style={p} title={name} />;
        case 'image': return <div className="col-12 p-0" style={iS}><img style={iC} src={url} alt={name} /></div>
        case 'audio': return <audio controls className="col-12 p-0" style={vC}> <source src={url} type="audio/mpeg" /> Your browser does not support the audio element. </audio>
        case 'text': return !isL && data ? <div className="col-12 p-0 shadow" style={{ borderRadius: '6px' }}>
            <p style={{ width: '100%', fontSize: '14px', padding: '6px 24px', whiteSpace: 'pre-wrap', maxHeight:'350px', overflowY:'auto' }}>{data}</p>
        </div> : isL ? <>{renderLoader()}</> : <></>
        default: return <></>;
    }
}