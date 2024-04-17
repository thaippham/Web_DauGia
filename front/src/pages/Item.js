import React, {useEffect, useState, useContext} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import axios from 'axios';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import {CountryDropdown} from 'react-country-region-selector';
import {AuthContext} from '../components/AuthContext';
import Header from '../components/Typography/Header';
import Title from  '../components/Typography/Title';
import HeaderNormal from '../components/Typography/HeaderNormal';
import Categories from '../components/Modals/Categories'
import CreateCoordinates from '../components/Maps/CreateCoordinates';
import ConvertDMS from '../components/Maps/ConvertDMS';

// Material UI components
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { DataGrid} from '@mui/x-data-grid';
import GavelIcon from '@mui/icons-material/Gavel';
import SellIcon from '@mui/icons-material/Sell';
import PointOfSaleSharpIcon from '@mui/icons-material/PointOfSaleSharp';
import {Rating} from '@mui/material';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

// For the Modals for the Seller
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import DisplayCoordinates from '../components/Maps/DisplayCoordinates';
import DisplayPhotos from '../components/Photos/DisplayPhotos';
import ChooseCover from '../components/Photos/ChooseCover';
import AddPhotos from '../components/Photos/AddPhotos';
import DeletePhoto from '../components/Photos/DeletePhoto';
import Body from '../components/Typography/Body';
import Detail from '../components/Typography/Detail';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';

// Styles for the modals
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 660,
  bgcolor: 'background.paper',
  border: '2px solid lightBlue',
  borderRadius: 6,
  boxShadow: 24,
  p: 4,
};

const style2 = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 470,
  bgcolor: 'background.paper',
  borderRadius: 6,
  boxShadow: 24,
  p: 4,
};

// The displayed columns for the bids
const columns = [
    { field: 'time', headerName: 'Placed On', width: 180, valueFormatter: params => 
    (new Date(params?.value).toLocaleString('en-GB')), },
    { field: 'amount', headerName: 'Amount', width: 170},
    { field: 'bidderName', headerName: 'Bidder', width: 170},
    { field: 'bidderRating', headerName: 'Rating', width: 78},
]

function Item() {

    let navigate = useNavigate();

    let {id} = useParams();
    const [itemObject, setItemObject]=useState({});
    const [allBids, setAllBids] = useState([]);
    const [sellerObject, setSellerObject] = useState({});

    // for purchase modal
    const [opened, setOpened] = useState(false);
    const handleConfirmed = () => setOpened(true);
    const handleClosed = () => {
        setOpened(false);
        navigate(`/mail`);
    }

    // So that the seller can edit the details
    const [editMode, setEditMode] = useState(false);

    const initialValues = {
        amount: "",
        ItemId: {id},
    };

    const today = new Date() 

    const {authState} = useContext(AuthContext);

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };


    const [selectedCategory, setSelectedCategory] = useState({});
    const [categories, setCategories] = useState([]);
    
    // validation of the fields
    const validationSchema = Yup.object().shape({
        amount: Yup.number("You must input a number.").required("Sai số tiền").test(
            "maxDigitsAfterDecimal",
            "Chỉ được 2 số thập phân sau dấu phẩy.",
            (number) => /^\d+(\.\d{1,2})?$/.test(number)).moreThan(itemObject.currently, 
            "Giá mua phải lớn hơn giá hiện tại"),
    });


    const [holdBidData, setHoldBidData ] = useState({});

     // For Bid Modal
     const [openedBid, setOpenedBid] = useState(false);
     const handleCloseBid = () => {
         setOpenedBid(false);
     }
     const handleOpenBid = () => {
         setOpenedBid(true);
     }

     const bidOnIt = () =>{
        holdBidData.ItemId = id;
        holdBidData.UserId = authState.id;
        const head={ 
            headers:{
                accessToken: localStorage.getItem("accessToken"),
                
            }
        }

        axios.post(`https://localhost:33123/bids/`, holdBidData, head).then((res)=>{
        });

        // Also inform their history
        const body2 = {     
            userId: authState.id,
        };
        axios.post(`https://localhost:33123/history/bid/${itemObject.id}`, body2, head).then((reshi)=>{
        });

        // and update the ui
        setItemObject({...itemObject, currently: holdBidData.amount, number_of_bids:itemObject.number_of_bids+1});
        handleCloseBid();
    }

    const onSubmit = (data) =>{

        if(itemObject.buy_price && data.amount >= itemObject.buy_price){
            alert("Bạn có thể mua nó với giá rẻ hơn. Đơn giản chỉ cần nhấn mua.")
        }        
        else if (Math.floor((Date.parse(itemObject.ends)-Date.parse(today)))<=0){
            alert("Rất tiếc, phiên đấu giá đã hết hạn! Mục không có sẵn!")
            navigate(`/`);
        }
        else{
            setHoldBidData(data); 
            handleOpenBid();     
        }
    };

    // For Delete Modal
    const [openedPurchase, setOpenedPurchase] = useState(false);
    const handleClosePurchase = () => {
        setOpenedPurchase(false);
    }
    const handleOpenPurchase = () => {
        setOpenedPurchase(true);
    }

    const buyIt = () =>{
        // In case they press the button in the time that it already expired
        if (Math.floor((Date.parse(itemObject.ends)-Date.parse(today)))<=0){
            alert("Rất tiếc, phiên đấu giá đã hết hạn! Mục không có sẵn!")
            navigate(`/`);
        }
        else{

            const body = {
                userId: authState.id,
                purchaseAmount: itemObject.buy_price,
                sellerId: itemObject.UserId,
            }
            const head={ 
                headers:{
                    accessToken: localStorage.getItem("accessToken"),
                    
                }
            }
            // update the item as purchased
            axios.put(`https://localhost:33123/items/purchase/${itemObject.id}`, body, head).then((res)=>{
            });

            // Also inform their history
            const body2 = {     
                userId: authState.id,
            };
            axios.post(`https://localhost:33123/history/bid/${itemObject.id}`, body2, head).then((reshi)=>{
            });


            handleConfirmed();
        }
        
    };

    // For Delete Modal
    const [openedDelete, setOpenedDelete] = useState(false);
    const handleCloseDelete = () => {
        setOpenedDelete(false);
    }
    const handleOpenDelete = () => {
        setOpenedDelete(true);
    }

    const deleteItem = () =>{
        const head={ headers:{
                accessToken: localStorage.getItem("accessToken"),
                userId: itemObject.UserId
            }
        }
        axios.delete(`https://localhost:33123/items/${itemObject.id}`, head).then((res)=>{
        });
        navigate(`/`);
    };

    const stopEditor = () =>{
        setEditMode(false);
    }

    const editor = () =>{
        setEditMode(true);
    }

    const editItem = (attribute) =>{
        if (editMode){
            if (attribute === "name"){
                setOpenedName(true);
            }
            else if (attribute === "started"){
                setOpenedStarted(true);
            }
            else if (attribute === "ends"){
                setOpenedEnds(true);
            }
            else if (attribute === "buy_price"){
                setOpenedBuyPrice(true);
            }
            else if (attribute === "currently"){
                setOpenedCurrently(true);
            }
            else if (attribute === "location"){
                setOpenedLocation(true);
            }
            else if (attribute === "country"){
                setOpenedCountry(true);
            }
            else if (attribute === "description"){
                setOpenedDescription(true);
            }
            else if (attribute === "coordinates"){
                setOpenedCoordinates(true);
            }
            else if (attribute === "category"){
                setOpenedCategory(true);
            }
        }
    };


     // For Category Modal
     const [openedCategory, setOpenedCategory] = useState(false);
     const handleClosedCategory = () => {
         setOpenedCategory(false);
     }
 
     const switchCategory = () =>{
 
         if ((Object.keys(selectedCategory).length > 0 )){
 
            const body = {
            furthermostCategoryId: selectedCategory.id,
            }

            const head={ headers:{
                            accessToken: localStorage.getItem("accessToken"),
                            userId: itemObject.UserId
                        }
            } 

            axios.put(`https://localhost:33123/items/category/${itemObject.id}`, body, head).then((res)=>{
            });

            window.location.reload();
         }
         setOpenedCategory(false);
 
     }

    // For Location Modal
    const [openedLocation, setOpenedLocation] = useState(false);
    const handleClosedLocation = () => {
        setOpenedLocation(false);
    }

    const [locationValue, setLocationValue] = React.useState("");
    const handleChangeLocation = (newValue) => {
        setLocationValue(newValue.target.value);
    };

    const switchLocation = () =>{

        if (locationValue){
            
            if ( locationValue === itemObject.location ){
                alert("You didn't change the location");
            }
            else{

                if (locationValue!=null){

                    const body = {
                        location: locationValue,
                    }

                    const head={ headers:{
                                    accessToken: localStorage.getItem("accessToken"),
                                    userId: itemObject.UserId
                                }
                    } 
                    axios.put(`https://localhost:33123/items/location/${itemObject.id}`, body, head).then((res)=>{
                    });

                    // this so the changes are shown in the ui as well
                    setItemObject({...itemObject, location: locationValue});

                }
            }
        }
        setOpenedLocation(false);

    }

    // For Coordinates Modal
    const [openedCoordinates, setOpenedCoordinates] = useState(false);
    const handleClosedCoordinates = () => {
        setOpenedCoordinates(false);
    }

    const [coordinatesValue, setCoordinatesValue] = React.useState({});

    const switchCoordinates = () =>{

        if (Object.keys(coordinatesValue).length > 0 ){
            var point = { type: 'Point', coordinates: [coordinatesValue.lat, coordinatesValue.lng]};
            
            const body = {
                latitudeLongitude: point,
            }

            const head={ headers:{
                            accessToken: localStorage.getItem("accessToken"),
                            userId: itemObject.UserId
                        }
            } 

            axios.put(`https://localhost:33123/items/coordinates/${itemObject.id}`, body, head).then((res)=>{
            });

            window.location.reload();
        }
        setOpenedCoordinates(false);

    }

     // For Name Modal
     const [openedName, setOpenedName] = useState(false);
     const handleClosedName = () => {
         setOpenedName(false);
     }
 
     const [nameValue, setNameValue] = React.useState("");
     const handleChangeName = (newValue) => {
         setNameValue(newValue.target.value);
     };
 
     const switchName = () =>{
 
        if (nameValue){

            const body = {
                name: nameValue,
            }

            const head={ headers:{
                accessToken: localStorage.getItem("accessToken"),
                userId: itemObject.UserId
            }} 
            
            axios.put(`https://localhost:33123/items/name/${itemObject.id}`, body, head).then((res)=>{
            });

            // this so the changes are shown in the ui as well
            setItemObject({...itemObject, name: nameValue});
        }
        setOpenedName(false);
 
     }

     // For Description Modal
     const [openedDescription, setOpenedDescription] = useState(false);
     const handleClosedDescription = () => {
         setOpenedDescription(false);
     }
 
     const [descriptionValue, setDescriptionValue] = React.useState("");
     const handleChangeDescription = (newValue) => {
         setDescriptionValue(newValue.target.value);
     };
 
     const switchDescription = () =>{
 
         if (descriptionValue){
 
            const body = {
                description: descriptionValue,
            }

            const head={ headers:{
                            accessToken: localStorage.getItem("accessToken"),
                            userId: itemObject.UserId
                        }
            } 

            axios.put(`https://localhost:33123/items/description/${itemObject.id}`, body, head).then((res)=>{
            });

            // this so the changes are shown in the ui as well
            setItemObject({...itemObject, description: descriptionValue});

         }
         setOpenedDescription(false);
 
     }

    // For Country Modal
    const [openedCountry, setOpenedCountry] = useState(false);
    const handleClosedCountry = () => {
        setOpenedCountry(false);
    }

    const [countryValue, setCountryValue] = React.useState("");
    const handleChangeCountry = (newValue) => {
        setCountryValue(newValue);
    };

    const switchCountry = () =>{
        if (countryValue){

            const body = {
                country: countryValue,
            }

            const head={ headers:{
                accessToken: localStorage.getItem("accessToken"),
                userId: itemObject.UserId
                }
            } 

            axios.put(`https://localhost:33123/items/country/${itemObject.id}`, body, head).then((res)=>{
            });

            // this so the changes are shown in the ui as well
            setItemObject({...itemObject, country: countryValue});

        }
        setOpenedCountry(false);

    }

    // For Started Modal
    const [openedStarted, setOpenedStarted] = useState(false);
    const handleClosedStarted = () => {
        setOpenedStarted(false);
    }
    
    const [startedValue, setStartedValue] = React.useState(dayjs(new Date()));
    const handleChangeStarted = (newValue) => {
        setStartedValue(newValue);
    };

    const switchStarted = () =>{

        if (startedValue){
            
            if ( Date.parse(startedValue)-Date.parse(new Date()) <= 0 ){
                alert("Thời gian bắt đầu không thể sau hiện tại.");
            }
            else if(Date.parse(startedValue)-Date.parse(itemObject.ends) >= 0){
                alert("Thời gian bắt đầu không được sau ngày kết thúc");
            }
            else{

                if (startedValue!=null){

                    
                    const body = {
                        started: startedValue,
                    }

                    const head={ headers:{
                                    accessToken: localStorage.getItem("accessToken"),
                                    userId: itemObject.UserId
                                }
                    } 

                    axios.put(`https://localhost:33123/items/started/${itemObject.id}`, body, head).then((res)=>{
                    });

                    // this so the changes are shown in the ui as well
                    setItemObject({...itemObject, started: startedValue});

                }
            }

        }
        setOpenedStarted(false);
    }

    // the same but for the ending date
    const [openedEnds, setOpenedEnds] = useState(false);
    const handleClosedEnds = () => {
        setOpenedEnds(false);
    }

    const [endsValue, setEndsValue] = React.useState(dayjs(new Date()));
    const handleChangeEnds = (newValue) => {
        setEndsValue(newValue);
    };

    const switchEnds = () =>{

        if (endsValue){
            
            if ( Date.parse(endsValue)-Date.parse(new Date()) <= 0 ){
                alert("Thời gian bắt đầu không thể sau hiện tại.");
            }
            else if(Date.parse(endsValue)-Date.parse(itemObject.started) < 0){
                alert("Thời gian bắt đầu không được sau ngày kết thúc");
            }
            else{

                if (endsValue!=null){

                    
                    const body = {
                        ends: endsValue,
                    }

                    const head={ headers:{
                                    accessToken: localStorage.getItem("accessToken"),
                                    userId: itemObject.UserId
                                }
                    } 
                    // console.log(body);
                    axios.put(`https://localhost:33123/items/ends/${itemObject.id}`, body, head).then((res)=>{
                    });

                    // this so the changes are shown in the ui as well
                    setItemObject({...itemObject, ends: endsValue});

                }
            }

        }
        setOpenedEnds(false);
    }

      // For the buy_price
      const [openedBuyPrice, setOpenedBuyPrice] = useState(false);
      const handleClosedBuyPrice = () => {
        setOpenedBuyPrice(false);
      }
  
      const [buyPriceValue, setBuyPriceValue] = React.useState(itemObject.buy_price);
      const handleChangeBuyPrice = (newValue) => {
        setBuyPriceValue(newValue.target.value);
      };
  
      const switchBuyPrice = () =>{
  
          if (buyPriceValue){
              
              if ( buyPriceValue <= itemObject.currently ){
                  alert("Giá mua phải cao hơn giá hiện tại");
              }
              else{

                      
                const body = {
                    buy_price: buyPriceValue,
                }

                const head={ headers:{
                                accessToken: localStorage.getItem("accessToken"),
                                userId: itemObject.UserId
                            }
                } 
                // console.log(body);
                axios.put(`https://localhost:33123/items/buyprice/${itemObject.id}`, body, head).then((res)=>{
                });

                // this so the changes are shown in the ui as well
                setItemObject({...itemObject, buy_price: buyPriceValue});
  
              }
  
          }
          setOpenedBuyPrice(false);
      }


      // For the first bid
      const [openedCurrently, setOpenedCurrently] = useState(false);
      const handleClosedCurrently = () => {
        setOpenedCurrently(false);
      }
  
      const [currentlyValue, setCurrentlyValue] = React.useState(itemObject.currently);
      const handleChangeCurrently = (newValue) => {
        setCurrentlyValue(newValue.target.value);
      };
  
      const switchCurrently = () =>{
  
          if (currentlyValue){
              
              if ( currentlyValue >= itemObject.buy_price ){
                  alert("Giá trị hiện tại phải nhỏ hơn Giá mua");
              }
              else{
  
                  if (currentlyValue!=null){
  
                      
                      const body = {
                          currently: currentlyValue,
                      }
  
                      const head={ headers:{
                                      accessToken: localStorage.getItem("accessToken"),
                                      userId: itemObject.UserId
                                  }
                      } 
                      // console.log(body);
                      axios.put(`https://localhost:33123/items/currently/${itemObject.id}`, body, head).then((res)=>{
                      });
  
                      // this so the changes are shown in the ui as well
                      setItemObject({...itemObject, currently: currentlyValue});
  
                  }
              }
  
          }
          setOpenedCurrently(false);
      }


    // These here are for the Bids Modal
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
    }

    const [coordinates, setCoordinates] = useState([]);

    const [images, setImages] = useState([]);

    useEffect(()=>{

        window.scrollTo(0, 0);

        // First get the item information
        axios.get(`https://localhost:33123/items/fetchy/${id}`).then((res)=>{

            setItemObject(res.data);

            if (res.data.latitudeLongitude!==null){
                setCoordinates(res.data.latitudeLongitude.coordinates);
            }

            // Get the item's photos if they exist
            axios.get(`https://localhost:33123/photos/${id}`).then((resimag)=>{
                setImages(resimag.data);
            });

            // Then get the categories recursively and return them from parent to children
            axios.get(`https://localhost:33123/categories/${res.data.furthermostCategoryId}`).then((rescateg)=>{
                setCategories(rescateg.data);
            });
            
            // Then get the seller information required
            if (res.data.UserId){
                axios.get(`https://localhost:33123/auth/fetchy/${res.data.UserId}`).then((respo)=>{
                    setSellerObject(respo.data);
                });
            }

            // For the seller also get the bids information
            if (res.data.UserId===authState.id){
            
                axios.get(`https://localhost:33123/bids/${id}`).then((response)=>{
            
                    setAllBids(response.data);
                    console.log(response.data);
                
                });
            
            }
            else{
                
                if (authState && authState.username!== "admin"){

                    // if the user is signed in inform their history
                    const body = {     
                        userId: authState.id,
                    };  

                    const head={ 
                        headers:{
                            accessToken: localStorage.getItem("accessToken"),
                        }
                    }
                    
                    axios.post(`https://localhost:33123/history/click/${id}`, body, head).then((respirespi)=>{
                    });
                
                }


            }

        });

    
    }, [authState, id]);


    // This to go to the bidder's profile
    const handleOnCellClick = (params) => {
        for (var bid=0;bid<allBids.length;bid++){
            if(allBids[bid].id===params.id){
                setOpen(false);
                navigate(`/profile/${allBids[bid].UserId}`);
            }
        }
    };


    return (
        <>
        
            <div className='itemPage'>
                
                <div className='leftSide' id="individual">
                    <br />
                    <DisplayPhotos images={images} />
                    <br />
                    <br />
                        <div className='footer'>
                            <Header text="Description" />
                        </div>
                        <br />
                        {editMode ? 
                            <div className='shake' onClick={() => {
                                editItem("description");}} >
                                <div className='body'>
                                    <Body text="Sửa mô tả..." />                        
                                </div>
                            </div>
                        :
                            <div className='body'>
                                <Body text={itemObject.description} />
                            </div>
                        }
                        <br />
                        {editMode ? 
                            <>
                            
                            <div className='shake' onClick={() => {
                                editItem("location");}} >
                                <Header text={
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        flexWrap: 'wrap',
                                        }}>
                                        <LocationOnIcon /> {itemObject.location} 
                                    </div>
                                }/>
                            </div>
                            <div className='shake' onClick={() => {
                                editItem("country");}} >
                                <Header text={
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        flexWrap: 'wrap',
                                        }}>
                                        {itemObject.country} 
                                    </div>
                                }/>
                            </div>

                            </>
                        :
                        <Header text={
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                textAlign: 'center',
                                flexWrap: 'wrap',
                                }}>
                                <LocationOnIcon /> {itemObject.location}, {itemObject.country} 
                                </div>
                        } />
                        }

                    { editMode ? 
                        <div className='shake' onClick={() => {
                            editItem("coordinates");}} > 
                            { Object.keys(coordinates).length > 0 ?
                            <>
                                <Detail text="Thay đổi vị trí chính xác trên bản đồ" />
                            </>
                            :
                            <>
                                <Detail text="Thêm vị trí chính xác trên bản đồ" />
                            </>
                            }
                        </div>    
                    : 
                        <div> 
                        { Object.keys(coordinates).length > 0 &&
                            <>
                            <Detail text={
                            <div >
                                <DisplayCoordinates lat={coordinates[0]} lng={coordinates[1]} />
                                {ConvertDMS(coordinates[0], coordinates[1])}
                                </div>
                            } />
                            </>
                        }
                        </div> 
                    }


                        
                    </div>
                    <div className='rightSide' id="individual" >
                        { editMode ? <div className='shake' onClick={() => {
                            editItem("name");}} > <Title title={itemObject.name}  /></div> : 
                            <div className="itemNB "> 
                            <Title title={itemObject.name}  />
                            
                        </div> }

                        <br />
                        { editMode ?
                            <div className='shake' onClick={() => {
                                editItem("category");}} >   
                                <Detail text={
                                categories.map((value, key)=>{
                                return (
                                    <>•{value}&nbsp;&nbsp;</>
                                );
                                }
                                )}
                            />
                            </div>
                        :
                        <>
                        { (Object.keys(categories).length > 0) &&
                            <>
                            <Detail text={
                            categories.map((value, key)=>{
                            return (
                                <>•{value}&nbsp;&nbsp;</>
                            );
                            }
                            )}
                            />
                            </>
                        }
                        </>
                        }

                        <br />

                        <br />
                            
                            <div className='footer' style={{color:'black'}} > 
                            <Detail sx={{color:'black'}} text={ <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    flexWrap: 'wrap',
                                    }}>
                                <PointOfSaleSharpIcon />
                                { sellerObject.saleCount ? 
                                (   <>&nbsp;Xếp hạng người bán: {sellerObject.sellerRating} &nbsp; Trung bình: &nbsp;
                                    <Rating name="read-only" value= {sellerObject.sellerRating/sellerObject.saleCount } readOnly precision={0.5}/>
                                    </>
                                )
                                :
                                (   <>&nbsp;Chưa có doanh số bán hàng
                                    </>
                                )
                                } 
                                </div>} 
                            />
                            </div>
                            <div className='container' > 
                            {
                                authState.status===true ?
                                <>
                                <Link className="linky" to={`/profile/${itemObject.UserId}`}>
                                    <Body text={`Sold by: ${sellerObject.username}`} />
                                </Link>
                                <HeaderNormal text="Nhấn vào đây để truy cập hồ sơ" />
                                </>
                                
                                :
                                <Body text={`Sold by: ${sellerObject.username}`} />
                            }
                            
                            </div>

                            <br />
                        
                            
                            <br />
                            { editMode ?
                                <div> 
                                { itemObject.buy_price ?
                                    <div className='shake' onClick={() => {
                                        editItem("buy_price");}} >
                                    <Header text={<div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        flexWrap: 'wrap',
                                        }}>
                                    <SellIcon />&nbsp;Giá: {itemObject.buy_price}$ </div> } />
                                    </div>
                                    :
                                    <div className='shake' onClick={() => {
                                        editItem("buy_price");}} >
                                    <Header text={<div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        flexWrap: 'wrap',
                                        }}>
                                    <SellIcon />&nbsp;Đặt giá mua</div> } />
                                    </div>
                                }
                                </div>
                            :
                            <div>
                                { itemObject.buy_price && (authState.id === itemObject.UserId) &&
                                    
                                    <div className='footer'  style={{ color: 'black' }} >
                                        <Header text={<div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            flexWrap: 'wrap',
                                            }}>
                                        <SellIcon />&nbsp;Giá: {itemObject.buy_price}$ </div> } />
                                    </div>
                                }
                            </div>
                            }

                            { itemObject.buy_price && ( (authState.status!==true) || (authState.username === "admin")) &&
                                <div className='footer'  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    flexWrap: 'wrap',
                                    }} >
                                <Header text={<div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    flexWrap: 'wrap',
                                    }}>
                                <SellIcon />&nbsp;Giá: {itemObject.buy_price}$ </div> } />
                            </div>

                            }
                            
                            {/* The seller, guest or admin obviously won't have the ability to buy */}
                            {( ! (authState.id === itemObject.UserId) &&itemObject.buy_price &&  authState.status===true && ! (authState.username === "admin") ) && itemObject.state==="AVAILABLE" &&
                                <>
                                <div className='footer'  >
                                    
                                    <div className='footer'  style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            flexWrap: 'wrap',
                                            }} >
                                        <Header text={<div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            flexWrap: 'wrap',
                                            }}>
                                        <SellIcon />&nbsp;Giá: {itemObject.buy_price}$ </div> } />
                                    </div>

                                <button className='buttonito' type="submit" onClick={handleOpenPurchase} >
                                Mua
                                </button>
                                </div>
                                <HeaderNormal text="Bằng cách nhấp vào Mua hàng, bạn có thể mua sản phẩm ngay lập tức" />
                                </>
                            }
                                <>
                                { editMode ? 
                                <div className='shake' onClick={() => {
                                    editItem("started");}} > 
                                    <Detail text={`Ngày bắt đầu: ${new Date(itemObject.started).toLocaleDateString('en-GB', options)}`} />
                                    </div> : 
                                    <div className='footer'  style={{ color: 'black'}}>
                                    <Detail text={`Ngày bắt đầu: ${new Date(itemObject.started).toLocaleDateString('en-GB', options)}`} />
                                    
                                </div> }


                                { editMode ? 
                                <div className='shake' onClick={() => {
                                    editItem("ends");}} > 
                                        <Detail text={`Ngày kết thúc: ${new Date(itemObject.ends).toLocaleDateString('en-GB', options)}`} />
                                    </div> : 
                                    <div className='footer'  style={{ color: 'black'}}>
                                        <Detail text={`Ngày kết thúc: ${new Date(itemObject.ends).toLocaleDateString('en-GB', options)}`} />
                                </div> }
                                
                                
                                </>
                            {/* } */}
                            {itemObject.state==="PURCHASED" &&
                                <Header text="Đã mua!" />
                            }
                            {itemObject.state==="EXPIRED" &&
                                <Header text="Đấu giá đã hết hạn!" />
                            }

                            {/* if there is at least one bid placed display the highest bidder so far */}
                            {
                                allBids.length>0 &&
                                <Header text={`Giá cao nhất được đặt bởi: ${allBids[allBids.length-1].bidderName}`} />
                            }

                            <br />

                            { editMode ? 
                            <div className='shake' onClick={() => {
                                editItem("currently");}} > 
                                <div className='footer'  style={{ color: 'black' }} >
                                    <Header text={<div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        flexWrap: 'wrap',
                                        }}>
                                    Hiện tại: {itemObject.currently}$&nbsp;[{itemObject.number_of_bids} Lượt đấu&nbsp; <GavelIcon />] </div> } />
                                </div>
                            </div>
                            :
                            <div className='footer'  style={{ color: 'black' }} >
                                <Header text={<div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    flexWrap: 'wrap',
                                    }}>
                                Hiện tại: {itemObject.currently}$&nbsp;[{itemObject.number_of_bids} Lượt đấu&nbsp; <GavelIcon />] </div> } />
                            </div>
                            }
                            

                            
                            {/* The seller, guest or admin obviously won't have the ability to bid or any bidder before it starts*/}
                            {( ! (authState.id === itemObject.UserId) && authState.status===true && ! (authState.username === "admin") ) && itemObject.state==="AVAILABLE" &&
                                <>
                                                        
                                <div className='footerSmall'> 
                                <Detail text={`
                                Time Left: 
                                ${Math.floor((Date.parse(itemObject.ends)-Date.parse(today))/1000 / (3600*24))} days : 
                                ${Math.floor(((Date.parse(itemObject.ends)-Date.parse(today))/(1000*3600)))%24} hours : 
                                ${Math.floor(((Date.parse(itemObject.ends)-Date.parse(today))/(1000*60)) % 60)} mins 
                                `} />
                                </div>
                                <Formik 
                                initialValues={initialValues} 
                                onSubmit={onSubmit} 
                                validationSchema={validationSchema} 
                                >
                                    <Form className="placeBid" >
                                        <ErrorMessage name="amount" component="span" />
                                        <Field 
                                        id="input"
                                        type="number" 
                                        step="0.01"
                                        name="amount" 
                                        placeholder="Bid Amount" 
                                        />
                                        <button className='buttonito' type="submit">Đặt giá</button>
                                    </Form>
                                </Formik>
                                </>
                            }
                        { editMode ? 
                        <div> 
                        {/* To stop editing */}
                        {
                            <button className='buttonito' onClick={stopEditor} > Dừng sửa </button>
                        }
                        </div>
                        :
                        <div> 
                        {/* Before the starting date or before the first bide the user will be able to edit it or delete it */}
                        { authState.id === itemObject.UserId && ((Date.parse(itemObject.started) > Date.parse(today)) || itemObject.number_of_bids===0 ) && ( itemObject.state==='AVAILABLE' || itemObject.state==='EXPECTED' ) &&
                            (<div>
                            <button className='buttonito' onClick={editor} > Sửa </button> 
                            <button className='buttonitoReverse' onClick={handleOpenDelete} > Xóa </button>
                            </div>)
                        }
                        {/* While the item is available the seller will be able to check the bids or change cover photo */}
                        { itemObject.state === 'AVAILABLE' && authState.id === itemObject.UserId  &&
                            (<div>
                                <button className='buttonito' onClick={handleOpen}>Kiểm tra hồ sơ dự thầu</button>
                            </div>)
                        }
                        { ( itemObject.state === 'AVAILABLE'  || itemObject.state === 'EXPECTED') && authState.id === itemObject.UserId  &&
                            (<div>
                                <DeletePhoto images={images} />
                                <ChooseCover images={images} />
                                <AddPhotos />
                            </div>)
                        }
                        </div>
                        }
                    </div> 
                    {/* The bid inspection Modal */}
                    <Modal
                            open={open}
                            onClose={handleClose}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                        >
                            <Box sx={style}>
                            <div className='headerito'>
                            <headerito>{itemObject.name} Giá đấu <GavelIcon /></headerito>
                            </div>
                            <div style={{ height: 371, width: 660 }}>
                            <DataGrid sx={{ m: 2 , "& .MuiDataGrid-row:hover": {
                                        backgroundColor: "skyblue"
                                    },            
                                }}
                            rows={allBids}
                            columns={columns}
                            pageSize={5}
                            rowsPerPageOptions={[5]}
                            disableSelectionOnClick
                            disableColumnMenu
                            disableColumnFilter
                            onCellClick={handleOnCellClick}
                            />
                        </div>
                        <button className='buttonito' onClick={handleClose}>
                            Đóng
                            </button>
                            
                            </Box>
                        </Modal>

                <Modal
                    open={opened}
                    onClose={handleClosed}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style2}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    Xin chúc mừng, bạn là người chiến thắng trong cuộc đấu giá này!
                    </Typography>
                    <img className='purchase_photo' src='https://freepikpsd.com/file/2019/10/aplicacion-png-1-Transparent-Images.png' alt='product' />
                    <Typography variant="h6" id="modal-modal-description" sx={{ mt: 2 }}>
                    Chỉ cần sắp xếp chi tiết thanh toán và giao hàng trong mail của chúng tôi&nbsp;&nbsp;
                    <button className='buttonito' onClick={handleClosed} >Nhắn cho người bán</button>
                    
                    </Typography>
                    </Box>
                </Modal>

                {/* This for the description modification */}
                <Modal
                    open={openedName}
                    onClose={handleClosedName}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style2}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                        Sửa đổi tên
                    </Typography>
                    <br />
                    <TextField
                        fullWidth
                        multiline
                        rows={1}
                        defaultValue={itemObject.name}
                        onChange={(e) => handleChangeName(e)}
                    />
                    <button className='buttonito' onClick={switchName} >Xác nhận</button>
                    </Box>
                </Modal>

                {/* This for the description modification */}
                <Modal
                    open={openedDescription}
                    onClose={handleClosedDescription}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style2}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    Sửa đổi mô tả
                    </Typography>
                    <br />
                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        defaultValue={itemObject.description}
                        onChange={(e) => handleChangeDescription(e)}
                    />
                    <button className='buttonito' onClick={switchDescription} >Xác nhận</button>
                    </Box>
                </Modal>


                {/* This for the location modification */}
                <Modal
                    open={openedLocation}
                    onClose={handleClosedLocation}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style2}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                        Chọn địa chỉ
                    </Typography>
                    <Detail text={`Currently: ${itemObject.location}`} />
                    <br />
                    <TextField
                        onChange={(e) => handleChangeLocation(e)}
                    />
                    <button className='buttonito' onClick={switchLocation} >Xác nhận</button>
                    </Box>
                </Modal>

                {/* This for the coordinates modification */}
                <Modal
                    open={openedCoordinates}
                    onClose={handleClosedCoordinates}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style2}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    Chọn vị trí của bạn trên bản đồ
                    </Typography>
                    <div style={{color: '#00C9FF'}} >
                        <CreateCoordinates setCoordinates={setCoordinatesValue} />
                        { (Object.keys(coordinatesValue).length > 0) &&
                            <Detail text={`Selected: ${coordinatesValue.lat}, ${coordinatesValue.lng}`} />
                        }
                    </div>

                    <button className='buttonito' onClick={switchCoordinates} >Xác nhận</button>
                    </Box>
                </Modal>
                
                {/* This for the category modification */}
                <Modal
                    open={openedCategory}
                    onClose={handleClosedCategory}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style2}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    Chọn từ các danh mục có sẵn
                    </Typography>
                    <div style={{color: '#00C9FF'}} >
                        <Categories setSelectedCategory={setSelectedCategory} />
                        { (Object.keys(selectedCategory).length > 0) &&
                            <Detail text={`Selected: ${selectedCategory.name}`} />
                        }
                    </div>
                    <button className='buttonito' onClick={switchCategory} >Xác nhận</button>
                    </Box>
                </Modal>

                {/* This for the Starting date modification */}
                <Modal
                    open={openedStarted}
                    onClose={handleClosedStarted}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style2}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    Chọn Ngày & Giờ Bắt đầu mới
                    </Typography>
                    <br />
                    <Detail text={`Current: ${new Date(itemObject.started).toLocaleString()}`} />
                    <br />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            value={startedValue}
                            onChange={handleChangeStarted}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                    <button className='buttonito' onClick={switchStarted} >Xác nhận</button>
                    </Box>
                </Modal>


                {/* This for the Ending Date modification */}
                <Modal
                    open={openedEnds}
                    onClose={handleClosedEnds}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style2}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    Chọn Ngày & Giờ Kết thúc mới
                    </Typography>
                    <br />
                    <Detail text={`Current: ${new Date(itemObject.ends).toLocaleString()}`} />
                    <br />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            value={startedValue}
                            onChange={handleChangeEnds}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                    <button className='buttonito' onClick={switchEnds} >Xác nhận</button>
                    </Box>
                </Modal>


                {/* This for Purchase */}
                <Modal
                    open={openedPurchase}
                    onClose={handleClosePurchase}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style2}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    Bạn có chắc chắn muốn mua mặt hàng này?
                    </Typography>
                    <HeaderNormal text="Bạn không thể đảo ngược hành động này" />
                    <button className="buttonitoReverse" onClick={handleClosePurchase}>Hủy</button>
                    <button className="buttonito"  onClick={buyIt} autoFocus>Xác nhận</button>
                    </Box>
                </Modal>

                {/* This for Bidding */}
                <Modal
                    open={openedBid}
                    onClose={handleCloseBid}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style2}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    Bạn có chắc chắn muốn đặt giá không {holdBidData.amount}$?
                    </Typography>
                    <HeaderNormal text="Bạn không thể đảo ngược hành động này" />
                    <button className="buttonitoReverse" onClick={handleCloseBid}>Hủy</button>
                    <button className="buttonito"  onClick={bidOnIt} autoFocus>Xác nhận</button>
                    </Box>
                </Modal>


                {/* This for deletion */}
                <Modal
                    open={openedDelete}
                    onClose={handleCloseDelete}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style2}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    Bạn có chắc bạn muốn xóa mục này?
                    </Typography>
                    <HeaderNormal text="Bạn không thể đảo ngược hành động này" />
                    <button className="buttonitoReverse" onClick={handleCloseDelete}>Hủy</button>
                    <button className="buttonito"  onClick={deleteItem} autoFocus>Xác nhận</button>
                    </Box>
                </Modal>

                {/* This for the buying price */}
                <Modal
                    open={openedBuyPrice}
                    onClose={handleClosedBuyPrice}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style2}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    Đặt giá mua
                    </Typography>
                    <br />
                    { itemObject.buy_price &&
                        <Detail text={`Current Buy Price: ${itemObject.buy_price}`} />
                    }
                    <Detail text={`Current First Bid: ${itemObject.currently}`} />
                    <br />
                    <TextField
                        type="number"
                        onChange={(e) => handleChangeBuyPrice(e)}
                    />
                    <button className='buttonito' onClick={switchBuyPrice} >Xác nhận</button>
                    </Box>
                </Modal>
                
                {/* Modal for current price */}
                <Modal
                    open={openedCurrently}
                    onClose={handleClosedCurrently}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style2}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    Đặt giá đầu tiên
                    </Typography>
                    <br />
                    { itemObject.buy_price &&
                        <Detail text={`Current Buy Price: ${itemObject.buy_price}`} />
                    }
                    <Detail text={`Current First Bid: ${itemObject.currently}`} />
                    <br />
                    <TextField
                        type="number"
                        onChange={(e) => handleChangeCurrently(e)}
                    />
                    <button className='buttonito' onClick={switchCurrently} >Xác nhận</button>
                    </Box>
                </Modal>

                {/* Modal for country */}
                <Modal
                    open={openedCountry}
                    onClose={handleClosedCountry}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style2}>
                        <Typography id="modal-modal-title" variant="h5" component="h2">
                            Chọn quốc gia mới
                        </Typography>
                        <br />
                        <Detail text={`Current Country: ${itemObject.country}`} />
                        <br />
                        <CountryDropdown 
                            style={{  height: '40px',
                                marginBottom: '10px',
                                border: '2px solid #00C9FF',
                                borderRadius: '5px',
                                paddingTop: '1px',
                                paddingLeft: '10px',
                                color: 'black',
                                fontFamily: 'Futura',
                                fontSize: '20px',}}
                            value={countryValue}
                            onChange={(e) => handleChangeCountry(e)}
                        />
                        <button className='buttonito' onClick={switchCountry} >Xác nhận</button>
                    </Box>
                </Modal>

            </div>
        </>
    )
}

export default Item;
