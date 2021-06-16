import React from 'react';
import Privacy from '../../assetsFile-O/privacy.png'
import './style.css';

export default () => {

    return <div className="mid">
        <div className="col-10" style={{ marginTop: '36px' }}>
            <h3 style={{ fontWeight: '500', fontSize: '28px' }}>Privacy Policy</h3>
        </div>
        <div className="col-10" style={{ marginTop: '12px', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            <div className="col-lg-8 col-12 p-0" style={{ marginTop: '12px' }}>
                <p style={{ marginTop: '36px' }}>Thanks for using File O! Here we describe how we collect, use, and handle your personal data when you use our websites, software, and services.</p>
                <h6 style={{ marginTop: '36px' }}><b>What {'&'} Why?</b></h6>
                <p>We collect and use the following information to provide, improve, protect, and promote our Services.</p>
            </div>
            <div className="col-lg-4 col-12 p-0" style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                <img src={Privacy} alt="Privacy Policy" style={{ width: '50%' }} />
            </div>
        </div>
        <div className="col-10" style={{ marginTop: '36px', marginBottom: '48px' }}>
            <p><b>Account information.</b> We collect, and associate with your account, the information you provide to us when you do things such as sign up for your account, upgrade to a paid plan, and set up two-factor authentication (like your name, email address, phone number, payment info, and physical address).</p>
            <p style={{ marginTop: '36px' }}><b>Your Data.</b> Our Services are designed as a simple and personalized way for you to store your files, documents, photos, comments, messages, and so on. Collaborate with others, and work across multiple devices and services. To make that possible, we store, process, and transmit your data as well as information related to it. This related information includes your profile information that makes it easier to collaborate and share your data with others, as well as things like the size of the file, the time it was uploaded, collaborators, and usage activity.</p>
            <p style={{ marginTop: '36px' }}><b>Usage Information.</b> We collect, and associate with your account, the information you provide to us when you do things such as sign up for your account, upgrade to a paid plan, and set up two-factor authentication (like your name, email address, phone number, payment info, and physical address).We collect information related to how you use the Services, including actions you take in your account (like sharing, editing, viewing, creating and moving files or folders). We use this information to provide, improve, and promote our Services, and protect File O users. </p>
        </div>
    </div>
}