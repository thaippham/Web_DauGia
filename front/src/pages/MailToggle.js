import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MailInbox from '../components/Mail/MailInbox';
import MailOutbox from '../components/Mail/MailOutbox';
import OutboxIcon from '@mui/icons-material/Outbox';
import InboxIcon from '@mui/icons-material/Inbox';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ReviewsIcon from '@mui/icons-material/Reviews';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import MailChats from '../components/Mail/MailChats';
import MailPurchases from '../components/Mail/MailPurchases';
import Title from '../components/Typography/Title';
import MailMessage from '../components/Mail/MailMessage';

export default function MailToggle() {
  const [alignment, setAlignment] = React.useState('inbox');

  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  return (
    <>
      <div className='container'>
        <Title title="Tin nhắn" />
    
      </div>

      <div className='container' style={{backgroundColor: 'white'}}>
        <ToggleButtonGroup
          color="success"
          value={alignment}
          exclusive
          onChange={handleChange}
          aria-label="Platform"
        >
          <ToggleButton value="message"sx={{ fontFamily: 'Futura' }}><MailOutlineIcon />&nbsp;Tin nhắn mới</ToggleButton>
          <ToggleButton value="inbox" sx={{  fontFamily: 'Futura' }}><InboxIcon />&nbsp;Nhắn tin</ToggleButton>
          <ToggleButton value="outbox" sx={{  fontFamily: 'Futura' }}><OutboxIcon />&nbsp;Thư đã gửi</ToggleButton>
          <ToggleButton value="chats" sx={{  fontFamily: 'Futura' }}><QuestionAnswerIcon />&nbsp;SALES</ToggleButton>
          <ToggleButton value="reviews"sx={{ fontFamily: 'Futura' }}><ReviewsIcon />&nbsp;Đã mua</ToggleButton>
        </ToggleButtonGroup>
      </div>

      <div style={{     minHeight: '90vh', width: '90%',

        backgroundImage: `url("https://www.livechatdirectory.co.uk/wp-content/uploads/2022/09/sending-email-gif.gif")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '20%',
        }}>

      <div className='container'>
        { alignment==='message' &&
          <MailMessage />
        }
        { alignment==='inbox' &&
          <MailInbox />
        }
        { alignment==='outbox' &&
          <MailOutbox />
        }
        { alignment==='chats' &&
          <MailChats />
        }
        { alignment==='reviews' &&
          <MailPurchases />
        } 
      </div>
    </div>
  </>
  );
}
