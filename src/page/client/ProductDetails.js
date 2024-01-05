import React,{useState,useEffect} from 'react';
import {Image,Row,Col,Breadcrumb,Rate,InputNumber,Select ,Button,Spin,message,List,notification} from 'antd';   
import *as FetchAPI from '../../util/fetchApi';
import {getPriceVND} from '../../contain/getPriceVND';
import {Link,useLocation,useHistory,useParams} from 'react-router-dom';
import * as MENU from '../../util/menuProduct';
import Product from '../../elements/product';
import { useDispatch } from 'react-redux';
import { updateCartCurrent } from '../../contain/updateQuanityCart';
import PreviewImmage from '../../elements/PreviewImmage';
import ReactHtmlParser from 'react-html-parser';


const { Option } = Select;
export default function ProductDetails(){
    const [dataProduct, setdataProduct] = useState();
    const [showContent, setshowContent] = useState(false);
    const [buttonLoading, setbuttonLoading] = useState(false);
    const [nameCategory, setnameCategory] = useState("");
    const [nameProductType, setnameProductType] = useState("");
    const [quanity, setquanity] = useState(1);
    const [dataOption, setdataOption] = useState();
    const [option, setoption] = useState();
    const [outOfStock, setoutOfStock] = useState(false);
    const [dataRelate, setdataRelate] = useState([]);
    const [imageDecription, setimageDecription] = useState();
    const [reviewStar, setreviewStar] = useState(5);
    const [quanityReview, setquanityReview] = useState(0);
    const {idProduct} = useParams();
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();
    useEffect(() => {    
        window.scroll(0,0);
        const getDetailProduct = async()=>{
            try {
                setshowContent(false);
                setquanity(1);
                getOption(idProduct);
                const data = {
                    "id":idProduct
                }
                const res = await FetchAPI.postDataAPI("/product/getProductDetails",data);
                console.log(res)
                if(res[0].reviewStar!==null){
                    setreviewStar(res[0].reviewStar);
                    setquanityReview(res[0].quanityReview);
                }
                getImageDecripton(res[0]);
                setdataProduct(res[0]);
                getName(res[0]);
                
            } catch (error) {
            }
        }
        getDetailProduct();
    }, [location])
    const getImageDecripton = (data)=>{
        let item = [];
        if(data.imageDecription1!==null){
            item.push(data.imageDecription1)
        }
        if(data.imageDecription2!==null){
            item.push(data.imageDecription2)
        }
        if(data.imageDecription3!==null){
            item.push(data.imageDecription3)
        }
        if(data.imageDecription4!==null){
            item.push(data.imageDecription4)
        }
        setimageDecription(item)
    }
    const getName = async(data)=>{
        const res = await FetchAPI.postDataAPI("/product/getProductByType",{"id":data.idProductType});
        setdataRelate(res.filter(e=>e.id!==data.id)); 
        const category = await MENU.getCategoryById({"id":data.idCategory});
        const product_type = await MENU.getPrductTypeById({"id":data.idProductType});
        setnameCategory(category.name);
        setnameProductType(product_type.name);
        setshowContent(true);
    }
    const handleValidation = ()=>{
        setbuttonLoading(true);
        setTimeout(()=>{
            if(option==null){
                message.warning('Hãy chọn kích cỡ, màu sắc để đặt hàng');
                setbuttonLoading(false);
            }else if(quanity ===null){
                message.warning('Vui lòng chọn số lượng !');
                setbuttonLoading(false)
            }
            else if(option[1]<quanity){
                message.warning('Mẫu này số lượng chỉ còn '+option[1]+' sản phẩm, quý khách vui lòng thông cảm !');
                setbuttonLoading(false);
            }else{
                handleOrder();
            }
        },1000)
    }
    const btn = (
        <Button type="primary" onClick={()=>{history.push('/cart');notification.close("notifysuccess")}}>
            Đi ngay
        </Button>
    )
    const handleOrder = ()=>{
        const dataOut = localStorage.getItem("cart");
        let objDataOut = JSON.parse(dataOut);
        if(objDataOut===null||dataOut===undefined){
            const data = [{"id":dataProduct.id,"quanity":quanity,"option":option[0]}];
            objDataOut = data
        }
        else{
            //Check product and option in cart
            let police = objDataOut.some(x => x.id===dataProduct.id && x.option===option[0]);
            if(police){
                //find postition
                let index = objDataOut.findIndex(x=> x.id===dataProduct.id && x.option===option[0]);
                //setNewQuanity
                let newQuanity = objDataOut[index].quanity+quanity;
                if(newQuanity>option[1]){
                    message.warning('Sản phẩm chỉ còn '+option[1]+", vui lòng chọn kiểm tra lại");
                    setbuttonLoading(false);
                    return;
                }else{
                    //setNewQuanity
                    objDataOut[index].quanity = newQuanity;
                }
            }else{
                const data = {"id":dataProduct.id,"quanity":quanity,"option":option[0]};
                objDataOut.push(data);
            }
        }
        localStorage.setItem("cart",JSON.stringify(objDataOut));
        setTimeout(()=>{
            setbuttonLoading(false);
            updateCartCurrent(dispatch);
            notification["success"]({
                message: 'Đặt hàng thành công',
                description:
                  'Bạn có muốn chuyển đến giỏ hàng ngay bây giờ.',
                btn,
                key: "notifysuccess"
            });
        },1000)
    }
    const getOption = async(id)=>{
        let i = [];
        const data = {"id":id};
        const res = await FetchAPI.postDataAPI('/product/getProductInventory',data);
        if(res.length===0){
            setoutOfStock(true);
        }else{
            let totalquanity = 0;
            res.map((e)=>[
                totalquanity+=(e.quanity-e.sold)
            ])
            if(totalquanity===0){
                setoutOfStock(true)
            }else{
                setoutOfStock(false);
            }
        }
        res.map((item)=>{
            if(item.quanity-item.sold!==0){
                i.push(
                    <Option value={[item.size,item.quanity-item.sold]}>
                        {item.size +" - "}<span style={{ color:'gray' }}>{item.quanity-item.sold}</span>
                    </Option>
                )
            }

        })
        setdataOption(i);
    }
    const ItemProductRelate = dataRelate
    .slice(0, 5) // Chọn 5 sản phẩm đầu tiên
    .map((item) => (
      <Col style={{ display: 'flex', justifyContent: 'center', padding: '10px 10px' }}>
        <Product width={200} item={item} />
      </Col>
    ));

    
    const line = ()=>(
        <div style={{ backgroundColor:'#dfe0e1',height:1,margin:'10px 0' }}/>
    )
    const ProductInformation = ()=>(
        <div style={{ display:'flex',flexDirection:'column' }}>
            <span style={{ fontSize:20,fontWeight:'700', color:'#414042' }}>{dataProduct.name}</span>  
            <span style={{color:'#a3a5a7'}}><span style={{ fontWeight:'bold' }}>Mã SP : </span>{dataProduct.id}</span>
            <div> 
                <Rate allowHalf style={{ color:"orange"}} tooltips="12345" defaultValue={reviewStar} disabled/>
                <span style={{ marginLeft:10 }}>{`(${quanityReview} đánh giá)`}</span>
            </div>
        </div>
    )
    const contentProduct = ()=>(
        <div style={{ display:'flex',flexDirection:'column' }}>
            {ProductInformation()}
            {line()}
            {dataProduct.promotional===null ?
                <span style={{ fontSize:18, fontWeight:'bold', color:'#414042' }}>Giá: {getPriceVND(dataProduct.price)+" đ"}</span>
                :
                <div style={{ display:'flex',flexDirection:'column' }}>
                    <span style={{ fontSize:18, fontWeight:'bold',textDecorationLine:'line-through', color:'#414042' }}>
                        Giá gốc: {getPriceVND(dataProduct.price)+" đ"}
                    </span>
                    <span style={{ fontSize:18, fontWeight:'bold',color:'red',fontWeight:'bold', color:'#414042' }}>
                        Giá: {getPriceVND(dataProduct.promotional)+" đ"}
                    </span>
                </div>
            }
            {line()}

            <div style={{ display:'flex',justifyContent:'space-between',flexDirection:'row',alignItems:'center',margin:'10px 0' }}>
                <span style={{ fontSize:14, fontWeight:'bold' }}>Tùy chọn : </span>
                <div style={{ padding:"0px 10px"}}> 
                  <Select style={{ width: 120 }} placeholder="Chọn Size, Màu" onChange={(e)=>setoption(e)} allowClear>
                        {dataOption}
                  </Select>
                </div>
            </div>

            <div style={{ display:'flex',justifyContent:'space-between',flexDirection:'row',alignItems:'center',margin:'10px 0' }}>
                <span style={{ fontSize:14, fontWeight:'bold' }}>Số lượng : </span>
                <div style={{ padding:"0px 10px"}}> 
                    <InputNumber  
                        style={{ textAlign:'center' }} 
                        min={1} 
                        max={10}
                        value={quanity}
                        onChange = {(e)=>{setquanity(e)}}
                    /> 
                </div>
            </div>

            {line()}
            <div style={{ paddingTop:15 }}>
                <Button 
                    type="primary" 
                    danger 
                    style={{ width:'100%',height:52,borderRadius:4}} 
                    onClick={handleValidation}
                    disabled={outOfStock}
                    loading={buttonLoading}
                >
                    {outOfStock ? 
                        <span style={{ fontWeight:'bold' }}>HẾT HÀNG</span>
                    :
                        <span style={{ fontWeight:'bold' }}>THÊM VÀO GIỎ HÀNG</span>
                    }
                </Button>
                <div style={{ paddingTop:50 }}> 
                    {dataProduct.description!==null &&
                    <span style={{ fontSize:16}}> <h4>THÔNG TIN SẢN PHẨM</h4> </span>
                    }
                    <span style={{ fontSize:16}}>{ReactHtmlParser(dataProduct.description)}</span>
                </div>
            </div>
           
        </div> 
    )
    const Direction = ()=>(
        <Breadcrumb style={{ fontSize:13 }}>
            <Breadcrumb.Item>
                <Link to={"/home"}>TRANG CHỦ</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
                <Link to={`/category/${dataProduct.idCategory}`}>{nameCategory}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
                <Link to={`/menuproduct/${dataProduct.idProductType}`}>{nameProductType}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item style={{fontWeight:'bold'}}>{dataProduct.name}</Breadcrumb.Item>
        </Breadcrumb>
    )
    const itemImageDecription = (item)=>(
        <div style={{ padding:10, width:'50%'}}>
        <Image src={item} preview={{mask:(<PreviewImmage small={true}/>)}}/>
        </div>
    )
    return(
        <div style={{ maxWidth:1170, margin: 'auto' }}>
            {showContent ?
            <div style={{ minHeight:800 }}>
            <div className='navigation-product'>
                {Direction()}
            </div>       
            <Row  /*gutter={{ xs: 8, sm: 16, md: 24, lg: 30 }}*/>
                <div className='full-imgproduct'>
               <Col 
               className='img-listproduct'
                >
                    {/* <div>
                        <Image src={dataProduct.image} width={350} preview={{mask:(<PreviewImmage />)}}/>    
                    </div> */}
                        <Image.PreviewGroup>
                            <List
                           
                                className='List-imgpreview'
                                // grid={{ gutter: 16, column: 4 }}
                                dataSource={imageDecription}
                                locale={{ emptyText:'Không có ảnh sản phẩm' }}
                                renderItem={itemImageDecription}
                            />
                        </Image.PreviewGroup>
               </Col>
               <Col className='content-product'>
                    {contentProduct()}
               </Col>
               </div>
               <Col className="productRelate" style={{ width:'100%' }}>
                   <span style={{ fontSize:30,paddingBottom:20,fontWeight:'bold', width:'auto', margin:'auto' }}>GỢI Ý CHO BẠN</span>
                   <Row style={{justifyContent:'space-between'}}>
                        {ItemProductRelate}
                   </Row>
               </Col>
            </Row>
            </div>
            :
            <div style={{ width:'100%',height:500 }}>
                <Spin spinning={!showContent} size="large">
                    <div style={{ width:'100%',height:500 }}/>
                </Spin>
            </div>
            }
        </div>
    )
}