import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode.react';
import './hostEvent.css'; // Import your CSS file
import axios from 'axios';
import AmuteLogo from '../images/Untitled design.png'

const QuickShare = ({ joinQueueURL }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join the queue',
          text: `Join the queue with this link: ${joinQueueURL}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareText = `Join the queue with this link: ${joinQueueURL}`;
      const shareURL = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
      window.location.href = shareURL;
    }
  };

  return (
    <div className="quick-share-container">
      <button className="quick-share-button" onClick={handleShare}>Share</button>
    </div>
  );
};

const AttendeesModal = ({ attendees, onClose }) => {
  const handleRemoveAttendee = async (attendeeId) => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/remove/attendee/${attendeeId}`);
      if (response.status === 200) {
        // Remove the attendee from the local state
        
      } else {
        console.error('Failed to remove attendee');
      }
    } catch (error) {
      console.error('Error removing attendee:', error);
    }
  };

  const handleChatAttendee = (phoneNo) => {
    // Handle opening WhatsApp chat with the given phone number
    const shareText = `Let's chat on WhatsApp!`;
    const shareURL = `whatsapp://send?phone=${phoneNo}&text=${encodeURIComponent(shareText)}`;
    window.open(shareURL);
  };

  return (
    <div className="modal-container_event_attendee_details">
      <div className="modal-content_event_attendee_details">
        <button className="modal-close_event_attendee_details" onClick={onClose}>Close</button>
        <h2>Attendees</h2>
        <ul>
          {attendees.map((attendee, index) => (
            <li key={index} className="attendee-item">
              <p>Name: {attendee.name}</p>
              <p>Phone: {attendee.phone_no}</p>
              <p>Time: {attendee.hour}-{attendee.minute}</p>
              <button className="attendee-action" onClick={() => handleChatAttendee(attendee.phone_no)}>Chat</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const EventDetailsData = () => {
  const [eventDetails, setEventDetails] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [showAttendees, setShowAttendees] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false); // State for showing/hiding QR modal
  const { id } = useParams();
  const nav = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token not found in localStorage');
          return;
        }
        const response = await fetch('http://localhost:8080/api/fetch/user/info', {
          headers: {
            Authorization: token
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        } else {
          setError('Failed to fetch user info');
        }
      } catch (error) {
        setError('Error fetching user info: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    // Fetch event details using the ID from the URL
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/get/event/${id}`);
        if (response.ok) {
          const eventData = await response.json();
          setEventDetails(eventData);
        } else {
          console.error('Failed to fetch event details');
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    // Fetch attendees when event details are loaded
    if (eventDetails) {
      const fetchAttendees = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/api/fetch/attendees/${id}`);
          if (response.status === 200) {
            setAttendees(response.data);
          } else {
            console.error('Failed to fetch attendees');
          }
        } catch (error) {
          console.error('Error fetching attendees:', error);
        }
      };
      fetchAttendees();
    }
  }, [eventDetails, id]);

  // Function to handle QR code scan
  const handleQRScan = (data) => {
    // Check if the scanned data is a join queue link
    if (isJoinQueueLink(data)) {
      // Redirect to the join queue link
      window.location.href = data;
    }
  };

  // Function to check if the data is a join queue link
  const isJoinQueueLink = (data) => {
    // Simple check to see if the data starts with 'http://localhost:3000/join/event/'
    return data.startsWith('http://localhost:3000/join/event/');
  };

  // Check if user_id of the event matches the id of the user
  useEffect(() => {
    if (userInfo && eventDetails && userInfo.id != eventDetails.user_id) {
      // Redirect to dashboard if user_id does not match
      nav('/dashboard');
    }
  }, [userInfo, eventDetails, nav]);

  const handleViewAttendees = () => {
    setShowAttendees(true);
  };

  const handleCloseAttendees = () => {
    setShowAttendees(false);
  };

  const handleQRClick = () => {
    setShowQRModal(true);
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
  };

  const handlePrintQR = () => {
    window.print();
  };

  return (
    <div className="event-details-container">
      {eventDetails && (
        <div>
          <div className="event-details">
            {!showQRModal && (
              <div className="qr-code-container" onClick={handleQRClick}>
                <QRCode value={`https://amute.vercel.app/join/event/${eventDetails.id}`} onScan={handleQRScan} />
              </div>
            )}
            <p><span className="detail-label">Name:</span> {eventDetails.name}</p>
            <p><span className="detail-label">Start Time:</span> {eventDetails.startTime}</p>
            <p><span className="detail-label">End Time:</span> {eventDetails.endTime}</p>
            <p><span className="detail-label">Date:</span> {eventDetails.date}</p>
            <p><span className="detail-label">Forever:</span> {eventDetails.isForever ? 'Yes' : 'No'}</p>
            <QuickShare joinQueueURL={`https://amute.vercel.app/join/event/${eventDetails.id}`} />
            <button className="quick-share-button" onClick={handleViewAttendees} style={{marginTop:' 5px'}}>View Attendees</button>
          </div>
          {showAttendees && <AttendeesModal attendees={attendees} onClose={handleCloseAttendees} />}
          {showQRModal && (
            <div className="qr-modal" onClick={handleCloseQRModal}>
              <div className="qr-content">
                <QRCode value={`https://amute.vercel.app/join/event/${eventDetails.id}`} />
                <p style={{ color: "#fff", marginTop: "10px" }}>Scan this with any QR app to book a slot in the queue</p>
                <h3>Amute</h3>
                <button className="print-button" onClick={(e) => { e.stopPropagation(); handlePrintQR() }}>Print QR Code</button>
                <button className='close_btn_qr_host' onClick={handleCloseQRModal}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventDetailsData;