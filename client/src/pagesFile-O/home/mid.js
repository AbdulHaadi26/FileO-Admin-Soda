import React from 'react';
import Icon from '../../assetsFile-O/Icon.svg';
import Image from '../../assetsFile-O/bg2.svg';
import Image2 from '../../assetsFile-O/bg3.svg';
import Icon2 from '../../assetsFile-O/Icon2.svg';
import Image3 from '../../assetsFile-O/Image3.svg';
import Icon3 from '../../assetsFile-O/Icon3.svg';
import './style.css';
import { Link } from 'react-router-dom';


export default () => {

    return <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0px' }}>
            <h1 style={{ fontSize: '33px', fontWeight: '600', width: '90%', textAlign: 'center' }}>When team align, work flows</h1>
            <p style={{ marginTop: '24px', fontSize: '14px', textAlign: 'center', width: '90%' }} className="col-lg-5 col-12 p-0">
            At File-O, we strive to build tools that hold workflows together. Part of that involves making the tools as user-friendly as possible and ensuring that teams aligned perfectly.
            </p>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', padding: '30px 0px', backgroundColor: 'rgba(255,179,0, 0.2)' }}>
            <div className="col-lg-10 col-12" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div className="col-lg-4 col-6">
                    <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Connect with your team round the clock</h1>
                </div>
                <div className="col-lg-2 col-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <img src={Icon} style={{ width: '60%' }} alt="File-O Connect" />
                </div>
            </div>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', padding: '60px 0px' }}>
            <div className="col-lg-6 col-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', padding: '0px 24px' }}>
                <div className="col-lg-10 col-12" style={{ flex: 'none' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Collaborate Anytime Anywhere</h1>
                    <p style={{ marginTop: '12px', fontSize: '14px' }}>Collaborative project management is a method used to plan, coordinate, control, and monitor distributed and complex projects. It enables project teams to collaborate across departmental, corporate, and national boundaries and to master growing project complexity.</p>
                </div>
                <div className="col-lg-10 col-12" style={{ marginTop: '18px', flex: 'none' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Start a Discussion</h1>
                    <p style={{ marginTop: '12px', fontSize: '14px' }}>All the participants of the project files, shared files, teams notes and tasks will be able to hold conversations in the form of posted messages and share their thoughts about particular shared file and folders. This feature helps users to collaborate and discuss ideas in a productive way.</p>
                </div>
                <div className="col-lg-10 col-12" style={{ marginTop: '18px', flex: 'none' }}>
                    <Link className="buttonB" to={'/pricing'}>Get Started</Link>
                </div>
            </div>
            <div className="col-lg-6 col-12 mtSR" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={Image} style={{ width: '80%' }} alt="File-O Dashboard" />
            </div>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', padding: '30px 0px', backgroundColor: 'rgba(58,161,213, 0.2)' }}>
            <div className="col-lg-10 col-12" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div className="col-lg-4 col-6">
                    <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Connect with your team through Audio/Video</h1>
                </div>
                <div className="col-lg-2 col-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <img src={Icon2} style={{ width: '80%' }} alt="File-O Connect" />
                </div>
            </div>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', padding: '60px 0px' }}>
            <div className="col-lg-6 col-12 mtSR" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={Image2} style={{ width: '80%' }} alt="File-O Dashboard" />
            </div>
            <div className="col-lg-6 col-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '0px 24px' }}>
                <div className="col-lg-10 col-12" style={{ flex: 'none' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Secure {'&'} Peace of Mind</h1>
                    <p style={{ marginTop: '12px', fontSize: '14px' }}>File-O helps you secure and organize your most sensitive information in the cloud. Your account will be password protected. Folders and Files in your File-O account are safe you can access them any time and on any device.</p>
                </div>
                <div className="col-lg-10 col-12" style={{ marginTop: '18px', flex: 'none' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Easy Sharing</h1>
                    <p style={{ marginTop: '12px', fontSize: '14px' }}>Easy Sharing of data is still lacking in so many projects and organizations. File-O lets you share important folders, files, notes and tasks in a real time. Receiver will get instant notifications on shared folders, files, notes and tasks. Through File-O, you will be able to achieve operational efficiency, keep employees motivated and identify superior performers in your organization.</p>
                </div>
                <div className="col-lg-10 col-12" style={{ marginTop: '18px', flex: 'none' }}>
                    <Link className="buttonB" to={'/pricing'}>Try Features</Link>
                </div>
            </div>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', padding: '30px 0px', backgroundColor: 'rgba(255,179,0, 0.2)' }}>
            <div className="col-lg-10 col-12" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div className="col-lg-4 col-6">
                    <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Engage with productivity tools</h1>
                </div>
                <div className="col-lg-2 col-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <img src={Icon3} style={{ width: '60%' }} alt="File-O Connect" />
                </div>
            </div>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', padding: '60px 0px' }}>
            <div className="col-lg-6 col-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', padding: '0px 24px' }}>
                <div className="col-lg-10 col-12" style={{ flex: 'none' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Seamless Sharing with Clients</h1>
                    <p style={{ marginTop: '12px', fontSize: '14px' }}>File-O enables businesses to share files with clients without involvement of any insecure channels which helps clients to prevent unauthorized access to confidential files.</p>
                </div>
                <div className="col-lg-10 col-12" style={{ marginTop: '18px', flex: 'none' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Get Instant Notifications</h1>
                    <p style={{ marginTop: '12px', fontSize: '14px' }}>File-O enables team members to get instantly notified on shared folders, files and tasks. It enhances user experience as well as enable teams to work productively in a competitive environment.</p>
                </div>
                <div className="col-lg-10 col-12" style={{ marginTop: '18px', flex: 'none' }}>
                    <Link className="buttonB" to={'/pricing'}>Try for Free</Link>
                </div>
            </div>
            <div className="col-lg-6 col-12 mtSR" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={Image3} style={{ width: '80%' }} alt="File-O Dashboard" />
            </div>
        </div>
    </div>
}