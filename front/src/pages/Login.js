import React, { useEffect } from 'react';
import { Grid, Typography } from '@mui/material';
import Registration from '../components/Login/Registration';
import LoginForm from '../components/Login/LoginForm';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import {motion} from 'framer-motion'

function Login() {

    useEffect(() => {
        window.scrollTo(0, 0)
      }, [])

    return (
        
        <motion.div className='loginME'  
            initial={{width: 0}}
            animate={{width: '80vw'}}
            exit={{ width: '80vw', transition: {duration: 0.1 }}}
        > 

            <Grid container  direction={"row"} spacing={1.35}>
                <Grid item>
                    <Typography sx={{ fontSize: 20, fontFamily: 'Futura', textAlign: 'center', color: '#00C9FF' }} gutterBottom>Đăng nhập</Typography>
                    <LoginForm />
                    <br />
                    <br />
                    
                    
                   
                </Grid>
                <Grid item>
                    <Typography sx={{ fontSize: 20, fontFamily: 'Futura', textAlign: 'center', color: '#00C9FF' }} gutterBottom>Đăng Ký</Typography>
                    <Registration />
                </Grid>
            </Grid>
        
        </motion.div>
  )
}

export default Login;
