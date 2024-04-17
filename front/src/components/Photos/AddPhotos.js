import { Typography, Box, Modal } from '@mui/material'
import React, {useState} from 'react'
import PhotoUpload from './PhotoUpload'
import {useParams} from 'react-router-dom';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid lightBlue',
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
};

function AddPhotos() {

  let {id} = useParams();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    window.location.reload();
  }

  return (
    <div>
      <button className='buttonitoInfo' onClick={handleOpen}>Thêm ảnh</button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          
          <Typography sx={{fontFamily: 'Futura'}} variant="h2" component="h2">Tải ảnh lên</Typography>
          <br />
          <Typography sx={{fontFamily: 'Futura'}} variant="h7" component="h2">Thêm ảnh cho sản phẩm</Typography>
          <br />
          <br />
          <PhotoUpload itemid={id} />

        </Box>
      </Modal>
    </div>
  )
}

export default AddPhotos
