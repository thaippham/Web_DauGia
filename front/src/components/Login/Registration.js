import React, { useState } from 'react';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {CountryDropdown} from 'react-country-region-selector';
import ConvertDMS from '../Maps/ConvertDMS';

// For the material modal
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import CreateCoordinates from '../Maps/CreateCoordinates';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  borderRadius: 6,
  boxShadow: 24,
  p: 4,
};

function Registration() {

    let navigate = useNavigate();
    const [coordinates, setCoordinates] = useState({});
    const [holdData, setHoldData] = useState({});
    const [mycountry, setCountry] = useState([]);

    const initialValues = {
        username: "",
        password: "",
        name: "",
        surname: "",
        email: "",
        telephone: "",
        location: "",
        country: "Greece",
        taxnumber: "",
    };

    // REGEX for the telephone validation
    const phoneRegex = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

    // validation of the fields
    const validationSchema = Yup.object().shape({
        username: Yup.string().min(3).max(20).required("You must input a username").test('Unique Username', 'Username already exists',
            function (value) {
                return new Promise((resolve, reject) => {
                    axios.get(`https://localhost:33123/auth/exists/${value}`)
                        .then((res) => {
                            console.log(res);
                            if(res.data.exists===true){
                                resolve(false)
                            }
                            else {
                                resolve(true);
                            }
                        })
                        .catch((error) => {
                            resolve(true);
                        })
                })
            }
        ),
        password: Yup.string().min(4).max(20).required("Bạn hãy điền mật khẩu"),
        confirmPassword: Yup.string().min(4).max(20).required("Bạn phải nhập cái này.").oneOf([Yup.ref('password'), null], 'mật khẩu phải trùng khớp'),
        name: Yup.string().min(3).max(30).required("Bạn hãy điền tên"),
        surname: Yup.string().min(3).max(30).required("Bạn hãy điền họ"),
        email: Yup.string().required("Bạn hãy điền email").email(),
        telephone: Yup.string().matches(phoneRegex, 'Số điện thoại sai').required("Bạn hãy điền số điện thoại"),
        latitude: Yup.number("Đây là số").moreThan(-90).lessThan(90),
        longitude: Yup.number("Đây là số").moreThan(-180).lessThan(180),
        location: Yup.string().min(3).max(155).required("Bạn hãy điền địa chỉ"),
        country: Yup.string().required("Bạn hãy điền quốc gia"),
        taxnumber: Yup.number().required("Bạn hãy điền mã thuế").positive().integer().lessThan(1000000000, "Mã sai").moreThan(99999999, "Mã sai"),
    });

    const onSubmit = (data) =>{
        setHoldData(data);
        setOpenDialog(true);
        
    };

    const handleChange  = (country) =>{
        setCountry(country);
        console.log(country);
        initialValues.country=country;
    };


    // These here are for the Modal that displays awaiting approval
    const [open, setOpen] = React.useState(false);
    const handleClose = () => {
        setOpen(false);
        navigate('/auctions');
    }
    
    // these for the coordinates
    const [openDialog, setOpenDialog] = React.useState(false);

    const handleCloseDialog = () => {
        setOpenDialog(false);
        holdData.country = mycountry;
            
        // if the user inputed coordinates add them too
        if (Object.keys(coordinates).length > 0 ){
            var point = { type: 'Point', coordinates: [coordinates.lat, coordinates.lng]};
            holdData.latitudeLongitude = point;
        }

        axios.post("https://localhost:33123/auth/", holdData).then((res)=>{
        });

        setOpen(true);
        
    };

    return (

    <div className='createItemPage'>
        <Formik 
        initialValues={initialValues} 
        onSubmit={onSubmit} 
        onChange={handleChange}
        validationSchema={validationSchema} 
        validateOnChange={false}
        >
            <Form className='formContainer gradient-custom' >
                <label>Tên đăng nhập: </label>
                <ErrorMessage name="username" component="span" />
                <Field 
                id="inputCreateItem" 
                name="username" 
                placeholder="Username" 
                />
                <label>Password: </label>
                <ErrorMessage name="password" component="span" />
                <Field 
                id="inputCreateItem" 
                name="password" 
                type="password"
                placeholder="*****" 
                />
                <label>Nhập lại Password: </label>
                <ErrorMessage name="confirmPassword" component="span" />
                <Field 
                id="inputCreateItem" 
                name="confirmPassword" 
                type="password"
                placeholder="*****" 
                />
                <label>Tên: </label>
                <ErrorMessage name="name" component="span" />
                <Field 
                id="inputCreateItem" 
                name="name" 
                placeholder="Name" 
                />
                <label>Họ: </label>
                <ErrorMessage name="surname" component="span" />
                <Field 
                id="inputCreateItem" 
                name="surname" 
                placeholder="Surname" 
                />
                <label>Email: </label>
                <ErrorMessage name="email" component="span" />
                <Field 
                id="inputCreateItem" 
                name="email" 
                placeholder="Email" 
                />
                <label>Số điện thoại: </label>
                <ErrorMessage name="telephone" component="span" />
                <Field 
                id="inputCreateItem" 
                name="telephone" 
                placeholder="Telephone" 
                />
                
                <label>Mã thuế: </label>
                <ErrorMessage name="taxnumber" component="span" />
                <Field 
                id="inputCreateItem" 
                name="taxnumber" 
                placeholder="Taxnumber" 
                />

                <label>Địa chỉ: </label>
                <ErrorMessage name="location" component="span" />
                <Field 
                id="inputCreateItem" 
                name="location" 
                placeholder="City" 
                />
                <label>Quốc gia: </label>
                <ErrorMessage name="country" component="span" />

                <CountryDropdown 
                id="inputCreateItem" 
                name="country"
                value={mycountry}
                onChange={(e) => handleChange(e)}
                />
                
                <button type="submit">
                    Đăng ký
                </button>
                
            </Form>
        </Formik>

        <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title" style={{
                fontFamily: 'Futura',
                
            }}>
            {"Tùy chọn, bạn cũng có thể cung cấp vị trí chính xác của mình"}
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                <CreateCoordinates setCoordinates={setCoordinates} />
                { (Object.keys(coordinates).length > 0 ) &&
                    <Typography variant="h6" id="modal-modal-description" sx={{ mt: 2 }}>
                    Set to:&nbsp;&nbsp;{ConvertDMS(coordinates.lat, coordinates.lng)}
                  </Typography>
                }
            </DialogContentText>
            </DialogContent>
            <DialogActions>

            <button className="buttonito"  onClick={handleCloseDialog} autoFocus>Tiếp tục</button>
      
           </DialogActions>
        </Dialog>


        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h5" component="h2">
                    Application Received
                </Typography>
                <img alt="Received" className='approval_photo' src='https://codenex.in/wp-content/uploads/2019/01/appdevelopment.png' />
                <Typography variant="h6" id="modal-modal-description" sx={{ mt: 2 }}>
                Bạn sẽ có thể sử dụng dịch vụ của chúng tôi ngay sau khi được phê duyệt!
                </Typography>
            </Box>
        </Modal>

    </div>

  )
}

export default Registration;
