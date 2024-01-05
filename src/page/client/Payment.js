import React ,{useEffect,useState}from 'react';
import { Row, Col, Form, Input, Button, Table, Radio, Space, Result, Image } from "antd";
import { PayPalButton } from "react-paypal-button-v2";
import { useSelector,useDispatch } from 'react-redux';
import {getPriceVND} from '../../contain/getPriceVND';
import {Link,useLocation} from 'react-router-dom';
import * as FetchAPI from '../../util/fetchApi';
import {updateCartCurrent} from '../../contain/updateQuanityCart';
import imgbanking from '../../images/banking.png';
import cod from '../../images/svg/cod.svg';
import momo from '../../images/svg/momo.svg';
import other from '../../images/svg/other.svg';
import vnpay from '../../images/svg/vnpay_new.svg';
import zalopay from '../../images/svg/zalopay.svg';
import paypal from '../../images/svg/PayPal.svg';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function Payment (props){
    const [name, setname] = useState("");
    const [email, setemail] = useState();
    const [phone, setphone] = useState();
    const [address, setaddress] = useState();
    const [message, setmessage] = useState();
    const [totalTmp, settotalTmp] = useState(0);
    const [idUser, setidUser] = useState("");
    const [promoprice, setpromoprice] = useState(0);
    const dataCart = useSelector(state=>state.productReducer.cart);
    const datauser = useSelector(state=>state.userReducer.currentUser);
    const [dataSale, setdataSale] = useState();
    const dispatch = useDispatch();
    const [showUser, setshowUser] = useState(false);
    const [methodPayment, setmethodPayment] = useState(1);
    const [form] = Form.useForm();
    const [paymentSucess, setpaymentSucess] = useState(false);
    const [sdkReady, setSdkReady] = useState(false);
    // const imgMethodBank = imgbanking;
    const location = useLocation();
    useEffect(() => {
        setpaymentSucess(false)
        setshowUser(false)
        if (location.dataSale !== undefined) {
            setdataSale(location.dataSale)
            setpromoprice(location.dataSale.cost_sale)
        }
        if (dataCart.length !== undefined) {
            let total = 0;
            dataCart.map((e, index) => {
                if (e[0].promotional === null) {
                    total += e[0].price * e.quanity
                } else {
                    total += e[0].promotional * e.quanity
                }
                if (index === dataCart.length - 1) {
                    settotalTmp(total)
                }
                return false
            })
        }
        getUser();
    }, [datauser]);

    const successPaymentHandler = (paymentResult) => {
        setmessage(`PAYPAL_PAYMENT_${name}`);
        setSdkReady(true);
      };

    const getUser = async()=>{
        if(datauser.name!==undefined){
            const res = await FetchAPI.postDataAPI("/user/getInforUser",{"idUser":datauser.id})
            const user = res[0];
            form.setFieldsValue({name:user.name,email:user.email,address:user.address,phone:user.phone})
            setname(user.name);
            setemail(user.email);
            setidUser(user.id);
            setaddress(user.address);
            setphone(user.phone);
            setshowUser(true)
        }else{  
            form.setFieldsValue({name:"",email:"",address:"",phone:""})
            setname("");
            setemail("");
            setidUser("");
            setaddress("");
            setphone("");
            setshowUser(true);
        }
    }
    const handleValidationOrder = () => {
       
        // if(methodPayment===4){
        //     handlePaymentMomo();
        // }else{
        // }
        handleOrder();
    }

    const handlePaymentMomo = async () => {
        const params = {
            amount: totalTmp-promoprice+30000
        }
        const res = await FetchAPI.postDataAPI("/payment/create_payment_momo", params);
        if (res) {
            setmessage(`MOMO_PAYMENT_${name}`);
            // setSdkReady(true);
            window.open(res, "_blank");
        }
    }

    const createOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    description: "Payment Paypal",
                    amount: {
                        currency_code: "USD",
                        value: ((totalTmp-promoprice+30000)/23000).toFixed(2),
                    },
                },
            ],
        }).then((orderID) => {
                return orderID;
            });
    };

    const onApprove = (data, actions) => {
        return actions.order.capture().then(function (details) {
            successPaymentHandler()
        });
    };

    const handleOrder = async()=>{
        let idSale = null;
        let total = totalTmp+30000;
        if(dataSale!== undefined){
            idSale = dataSale.id
            total = total-dataSale.cost_sale
        }
        const data = {
            "name": name,
            "address": address,
            "email" : email,
            "phone" : phone,
            "total_price":total,
            "message":message,
            "dataProduct":dataCart,
            "methodPayment":methodPayment,
            "user": idUser,
            "idSale":idSale,
        }

        const res = await FetchAPI.postDataAPI("/order/addBill",data);
        if(res.msg){
            if(res.msg==="success"){
                localStorage.removeItem("cart");
                updateCartCurrent(dispatch);
                setpaymentSucess(true)
            }else{
                console.log(res.msg)
            }
        }
    }
    const columns  = [
        {
            title:"Sản phẩm",
            key:'name',
            render: record=>{
                return (
                    <Row style={{alignItems:'center'}}>
                        <Image src={record[0].image} width={50}/>
                        <span style={{marginLeft:12}}>{record[0].name+" - ( "+record.option+" )"}</span>
                        <span style={{ fontWeight:'bold',paddingLeft:20 }}>X {record.quanity}</span>
                    </Row>
                )
            }
        },
        { 
            title:"Tạm tính",
            dataIndex:"",
            key:'temp',
            render:(record)=>{
                if(record[0].promotional===null){
                    return <span>{getPriceVND(record[0].price*record.quanity)+" đ"}</span>
                       
                }else{
                    return <span>{getPriceVND(record[0].promotional*record.quanity)+" đ"}</span>
                }
            }
        }
    ]
    const InformationPayment = ()=>(
       <div className='infor-payment' style={{ padding:20 }}>
            <h2 style={{fontSize:26, fontWeight:'600' ,marginBottom: 0}}>THÔNG TIN THANH TOÁN</h2>
           <div style={{ display:'flex',flexDirection:'column' ,marginBottom: 12 }}>
            {dataSale===undefined &&
                <span >Bạn có mã khuyển mãi? <Link to="/cart">Quay lại</Link> giỏ hàng để nhận được khuyển mãi ! </span>
            }
           </div>
           
            <Form.Item
                name="name"
                label="Họ Tên"
                labelCol={{ span: 'auto' }}
                wrapperCol={{ span: 18 }}
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                style={{width:'100%',marginBottom: 12, borderRadius: 4, flexDirection:'column'}}
            >
                <Input
                    placeholder="Nhập họ tên"
                    value={name}
                    defaultValue={name}
                    onChange= {(e)=>setname(e.target.value)}
                    // maxLength={60}
                    style={{height:40}}
                />
            </Form.Item>
            <Form.Item
                name="address"
                label="Địa chỉ"
                labelCol={{ span: 'auto' }}
                wrapperCol={{ span: 18 }}
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                style={{width:'100%',marginBottom: 12, borderRadius: 4, flexDirection:'column'}}
            >
                <Input
                    placeholder="Nhập địa chỉ"
                    value={address}
                    defaultValue={address}
                    onChange= {(e)=>setaddress(e.target.value)}
                    // maxLength={24}
                    style={{height:40}}
                />
            </Form.Item>
            <Form.Item
                name="phone"
                label="Số điện thoại"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                style={{width:'100%',marginBottom: 12, borderRadius: 4, flexDirection:'column'}}            >
                <Input
                    placeholder="Nhập số điện thoại"
                    value={phone}
                    defaultValue={phone}
                    onChange= {(e)=>setphone(e.target.value)}
                    maxLength={10}
                    style={{height:40}}
                />
            </Form.Item>
            <Form.Item
                name="email"
                label="Địa chỉ Email"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
                rules={[
                    { type: 'email',message:"Vui lòng nhập đúng Email"},
                    {required:true,message:"Vui lòng điền Email !"},
                ]}
                style={{width:'100%',marginBottom: 12, borderRadius: 4, flexDirection:'column'}}            >
                <Input
                    placeholder="Nhập địa chỉ Email"
                    value={email}
                    defaultValue={email}
                    onChange= {(e)=>setemail(e.target.value)}
                    // maxLength={24}
                    style={{height:40}}
                    disabled={datauser.id!==undefined}
                />
            </Form.Item>
            <Form.Item
                name= 'introduction'
                label="Ghi chú đơn hàng"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
                style={{width:'100%',marginBottom: 12, borderRadius: 4, flexDirection:'column'}}            >
                <Input.TextArea
                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                    value={message}
                    defaultValue={message}
                    onChange={(e) => setmessage(e.target.value)}
                    disabled={methodPayment ===1 || methodPayment ===2 ? false : true}
                    maxLength={200}
                    style={{height:200}}
                />
            </Form.Item>
       </div>
    )

    const Payment = ()=>(
        <div style={{ border:"1px dashed black",padding:32, borderRadius:4, }}>
            <h2 style={{fontSize:22, fontWeight:'600' ,marginBottom: 12}}>ĐƠN HÀNG CỦA BẠN</h2>
            <Table 
                dataSource={dataCart} 
                columns={columns} 
                pagination={false}
                summary={()=>(
                    <Table.Summary>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0}><span style={{fontWeight:'bold'}}>Tạm tính</span></Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>{getPriceVND(totalTmp)+" đ"}</Table.Summary.Cell>
                        </Table.Summary.Row>
                        {dataSale !== undefined &&
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0}><span style={{fontWeight:'bold'}}>Mã khuyến mãi</span></Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>{"-"+getPriceVND(promoprice)+" đ"}</Table.Summary.Cell>
                        </Table.Summary.Row>
                        }
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0}><span style={{fontWeight:'bold'}}>Phí vận chuyển</span></Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>{getPriceVND(30000)+" đ"}</Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0}><span style={{fontWeight:'bold'}}>Tổng</span></Table.Summary.Cell>
                            <Table.Summary.Cell index={1}><span style={{fontWeight:'bold', fontSize:16}}>{getPriceVND(totalTmp-promoprice+30000)+" đ"}</span></Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
            )}/>

            {
                !sdkReady ? (
                    <Radio.Group 
                className='radio-payment' 
                style={{paddingTop:20}}
                value={methodPayment}
                onChange= {(e)=>setmethodPayment(e.target.value)}
                horizontal
            >
            <Space className='radio-list' direction="vertical">
                <Radio value={1}>
                    <div className='radio-content-input'>
                    <img className='main-img' src={cod}/>
                    <b >Trả tiền mặt khi nhận hàng</b><br/>
                    </div>
                    {methodPayment===2 ? <span tyle={{fontSize:16, margin:'8px 0'}}></span>:null}
                 </Radio>
                <Radio value={2}>
                    <div className='radio-content-input'>
                    <img className='main-img' src={other}/>
                    <b >Chuyển khoản qua ngân hàng</b><br/>
                    </div>
                    {methodPayment===2 ? 
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <Image style={{margin:'8px 0'}} src={imgbanking} width={'75%'} preview={false}/>
                    <span style={{fontSize:16}}>Vui lòng chuyển khoản với nội dung là <span style={{fontWeight:'600'}}>số điện thoại</span> của bạn</span>
                    </div>:null}
                </Radio>
                <Radio value={3}>  
                    <div className='radio-content-input'>
                    <img className='main-img' src={vnpay}/>
                    <b >Thẻ ATM/Visa/Master/JCB/QR Pay qua cổng VNPAY </b><br/>
                    </div>
                    {methodPayment===1 ? <span tyle={{fontSize:16, margin:'8px 0'}}></span>:null}
                 </Radio>
                 <Radio value={4}>
                    <div className='radio-content-input'>
                    <img className='main-img' src={momo}/>
                    <b >Ví MoMo </b><br/>
                    </div>
                                {methodPayment === 1 ? <span tyle={{ fontSize: 16, margin: '8px 0' }}></span> : null}
                                {
                            methodPayment === 4 && (
                                <Button htmlType="submit" style={{ height:30,width:200,fontWeight:'bold', borderRadius:4, margin: '4px', backgroundColor: '#A50064' }} onClick={handlePaymentMomo}>
                                Thanh toán ví Momo
                            </Button>
                            )
                        }
                 </Radio>
                 <Radio value={5}>
                 <div className='radio-content-input'>
                    <img className='main-img' src={zalopay}/>
                    <b >Ví Zalopay </b><br/>
                    </div>
                    {methodPayment===1 ? <span tyle={{fontSize:16, margin:'8px 0'}}></span>:null}
                 </Radio>
                 <Radio value={6}>
                 <div className='radio-content-input'>
                    <img className='main-img' src={paypal}/>
                            <b>Paypal</b><br/>
                    </div>
                        {methodPayment === 1 ? <span tyle={{ fontSize: 16, margin: '8px 0' }}></span> : null}
                        {
                            methodPayment === 6 && (
                                <PayPalButton
                                options={{ 
                                    clientId :"AY0itk3qWLAGZ8FcDaKLq2xVBFqBpas3wNpX4b7seBqHqVh1XXbPKAYylXo9KlMHVrWAjOXo8w5x3B45"
                                 }}
                                    amount={((totalTmp-promoprice+30000)/23000).toFixed(2)}
                                            onSuccess={successPaymentHandler}
                                          
                                />
                            //     <PayPalScriptProvider options={{ clientId: "AaiOR0UuKrkTaDWKtlae81PRr3enX2RBcxrcpX39uHH2VJy1ntxfIu3LuU8wOgey8oHm4SzH3cwqM5N5" }}>
                            //                 <PayPalButtons
                            //                     createOrder={createOrder}
                            //                     onApprove={onApprove}
                            //                     style={{ layout: "horizontal" }} />
                            // </PayPalScriptProvider>
                            )
                        }
                        
                 </Radio>
            </Space> 
            </Radio.Group>
                ) : (
                        <p style={{ fontWeight: 'bold', textAlign: 'center', marginTop: '20px', fontSize: '25px', color: 'green' }}>Đã thanh toán !</p>
                )
            }

        </div>
    )
    const Content = ()=>(
        <div>
        {dataCart.length!==undefined ?
            <div>
            {showUser &&
            <Form 
                style={{ width:1340,margin:'50px auto',minHeight:450 }} 
                onFinish={handleValidationOrder}
                form={form}
                initialValues={{
                    name: name,
                    email: email
                }}
                
            >
                <Row>
                    <Col xl={12} xs={12} >
                        {InformationPayment()}
                    </Col >
                    <Col xl={12} xs={8} >
                        {Payment()}
                        <div style={{width:'100%', paddingTop:20, display:'flex', justifyContent:'space-between',alignItems:'center' }}>
                        <span ><Link to="/cart">Quay lại</Link></span>
                            <Button className='button-cart' htmlType="submit" style={{ height:60,width:240,fontWeight:'bold', borderRadius:4 }} onClick={()=>console.log(email)}>
                                Hoàn tất đơn hàng
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Form>
            }
            </div>
            :
            <div style={{ width:1340,margin:'50px auto',minHeight:450 }}>
            <span style={{ fontWeight:'bold' }}> Hãy thêm sản phẩm vào giỏ hàng để thực hiện chức năng này... </span>
            <div style={{ display:'flex',flex:1,justifyContent:'center',paddingTop:"10%" }}>
                        <Button style={{ height:50 }} type="primary" danger>
                            <Link to="/">
                                Quay trở lại cửa hàng
                            </Link>
                        </Button>
                    </div>
            </div>
        }   
        </div>
    )
    return(
        <div>
            {paymentSucess ? 
            <Result
                style={{ height:450,paddingTop:50 }}
                status="success"
                title="Đặt hàng thành công!"
                subTitle="Theo dõi đơn hàng của bạn ?"
                extra={[
                <Button type="primary">
                    <Link to="/">
                    Tiếp tục đặt sản phẩm
                    </Link>
                </Button>,
                <Button >
                    <Link to="/billfollow">
                    Theo dõi đơn hàng
                    </Link>
                </Button>,
            ]}
          />
            :
            <div>
                {Content()}
            </div>
            }
        </div>
        
    )
} 